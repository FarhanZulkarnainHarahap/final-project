import cloudinary from "../config/cloudinary-config.js";
import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";

import { MidtransClient } from "midtrans-node-client";

const snap = new MidtransClient.Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SANDBOX_SERVER_KEY,
});

export const handleManualCheckout = async (req: Request, res: Response) => {
  try {
    //const userId = req.user.id;
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;
    const user = req.user;

    console.log(JSON.stringify(user));

    let { address, shippingOptions, cartItems, paymentMethod } = req.body;

    const file = req.file;
    if (!file && paymentMethod == "manual") {
      res.status(400).json({ message: "No payment proof uploaded." });
      return;
    }

    // Upload image to Cloudinary
    let uploadRes = null;
    if (paymentMethod == "manual") {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      uploadRes = await cloudinary.uploader.upload(base64Image, {
        folder: "payment_proofs",
      });
    }

    // Parse address/cart
    const parsedAddress = JSON.parse(address);
    const parsedCart = JSON.parse(cartItems);
    const parsedShipping = JSON.parse(shippingOptions);
    cartItems = JSON.parse(cartItems);

    //TODO::shipping cost harus di calculate ulang disini melalui backend. ga boleh data nya dikirim dr front end, supaya ga ada exploit untuk manipulasi data nominal shipping
    let totalWeight = cartItems.reduce(
      (sum, item) => sum + item.Product.weight * item.quantity,
      0
    );

    let subtotal = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.Product.price) * item.quantity,
      0
    );

    console.log(JSON.stringify(parsedShipping));
    const queryParams = new URLSearchParams({
      shipper_destination_id: "501", // your warehouse
      receiver_destination_id: parsedAddress.Address?.[0]?.destinationId,
      weight: totalWeight.toString(),
      item_value: subtotal.toString(),
      cod: "false",
    });
    console.log(JSON.stringify(queryParams));

    const response = await fetch(
      `${baseUrl}/api/v1/rajaongkir/calculate?${queryParams}`
    );
    const result = await response.json();

    console.log(JSON.stringify(result));

    if (!response.ok || !result.data || result.data.length === 0) {
      res.status(400).json({ message: "Failed to calculate shipping cost." });
      return;
    }

    let shippingData = result.data;
    let shippingCost = 0;

    let regularShippings = result.data?.calculate_reguler;

    regularShippings.forEach((cost) => {
      console.log(cost.shipping_name + "|" + cost.service_name);
      console.log(
        parsedShipping.shippingName + "|" + parsedShipping.serviceName
      );
      if (
        cost.shipping_name == parsedShipping.shippingName &&
        cost.service_name == parsedShipping.serviceName
      ) {
        shippingCost = cost.grandtotal;
      }
    });

    // Calculate subtotal and total
    // const subTotal = parsedCart.reduce(
    //   (sum, item) =>
    //     sum + item.Product.price * item.Product.weight * item.quantity,
    //   0
    // );
    const subTotal = parsedCart.reduce(
      (sum, item) => sum + item.Product.price * item.quantity,
      0
    );
    const totalPrice = subTotal + shippingCost;

    console.log(totalPrice);

    let orderNumber = `ORD-${Date.now()}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber: orderNumber,
        subTotal,
        shippingTotal: shippingCost,
        totalPrice,
        shippingOptions: parsedShipping,
        proofImageUrl: uploadRes?.secure_url,
        addressId: parsedAddress.Address?.[0]?.id,
        userId: req.user.id,
        paymentMethod: paymentMethod,
        OrderItem: {
          create: parsedCart.map((item) => ({
            productId: item.Product.id,
            unitPrice: parseFloat(item.Product.price),
            quantity: item.quantity,
            total: parseFloat(item.Product.price) * item.quantity,
          })),
        },
      },
      include: {
        OrderItem: true,
      },
    });

    let midItemDetails = parsedCart.map(
      (item: {
        productId: string;
        unitPrice: number;
        quantity: number;
        Product: { name: string };
      }) => ({
        id: item.productId,
        name: item.Product.name,
        quantity: item.quantity,
        price: item.unitPrice,
      })
    );

    midItemDetails.push({
      id: "SHIPPING COST",
      name: "SHIPPING COST",
      quantity: 1,
      price: shippingCost,
    });

    if (paymentMethod != "manual") {
      let requestBody = {
        transaction_details: {
          order_id: orderNumber,
          gross_amount: totalPrice,
        },
        item_details: midItemDetails,
        customer_details: {
          first_name: user.firstName,
          email: user.email,
        },
      };
      try {
        console.log(JSON.stringify(requestBody));

        let midtransTransaction = await snap.createTransaction(requestBody);
        res.status(201).json({
          message: "Order created and transaction initialized",
          data: {
            midtransTransaction,
            orderNumber,
          },
        });
      } catch (error) {
        console.log(error);
        console.log("WTF");
        console.log(JSON.stringify(error.ApiResponse));
        res.status(500).json({
          message: "Order failed",
        });
      }
    }
    res
      .status(200)
      .json({ message: "Manual payment submitted", data: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during manual checkout" });
  }
};
