import { PrismaClient } from "../generated/prisma/index.js";
import { genSalt, hash } from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  console.info("🌱 [SEED] Starting seed script");

  try {
    /* -------------------------------------------------------------------------- */
    /*                             DELETE EXISTING DATA                           */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Cleaning old data...");

    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.image.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.discountUsage.deleteMany();
    await prisma.discount.deleteMany();
    await prisma.inventoryJournal.deleteMany();
    await prisma.storeProduct.deleteMany();
    await prisma.storeAddress.deleteMany();
    await prisma.storeUser.deleteMany();
    await prisma.address.deleteMany();
    await prisma.userAddress.deleteMany();
    await prisma.store.deleteMany();
    await prisma.category.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    console.info("✅ Old data cleaned");

    /* -------------------------------------------------------------------------- */
    /*                               CREATE USERS                                  */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating users...");

    const salt = await genSalt(10);

    const user1 = await prisma.user.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: await hash("secret123", salt),
        isVerified: true,
        username: "johndoe",
        role: "USER",
        Cart: {
          create: {},
        },
      },
    });

    const storeAdmin = await prisma.user.create({
      data: {
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@store.com",
        password: await hash("admin123", salt),
        isVerified: true,
        username: "alicestore",
        role: "STORE_ADMIN",
        Cart: {
          create: {},
        },
      },
    });

    const superAdmin = await prisma.user.create({
      data: {
        firstName: "Bob",
        lastName: "Taylor",
        email: "bob@admin.com",
        password: await hash("superadmin123", salt),
        isVerified: true,
        username: "bobsuper",
        role: "SUPER_ADMIN",
        Cart: {
          create: {},
        },
      },
    });

    console.info("✅ Users created:");
    console.info(`- ${user1.email} (USER)`);
    console.info(`- ${storeAdmin.email} (STORE_ADMIN)`);
    console.info(`- ${superAdmin.email} (SUPER_ADMIN)`);

    /* -------------------------------------------------------------------------- */
    /*                               CREATE STORES                                */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating stores...");

    const store1 = await prisma.store.create({
      data: {
        name: "SuperMart Jakarta",
        userId: storeAdmin.id,
      },
    });

    const store2 = await prisma.store.create({
      data: {
        name: "FreshMart Bandung",
        userId: superAdmin.id,
      },
    });

    const store3 = await prisma.store.create({
      data: {
        name: "MegaStore Surabaya",
        userId: superAdmin.id,
      },
    });

    console.info("✅ Stores created:");
    console.info(`- ${store1.name}`);
    console.info(`- ${store2.name}`);
    console.info(`- ${store3.name}`);

    /* -------------------------------------------------------------------------- */
    /*                            CREATE STORE ADDRESSES                          */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating store addresses...");

    await prisma.storeAddress.create({
      data: {
        storeId: store1.id,
        latitude: -6.2088,
        longitude: 106.8456,
        Address: {
          create: {
            destination: "SuperMart Jakarta Main Branch",
            address: "Jl. Sudirman No. 1",
            city: "Jakarta",
            province: "DKI Jakarta",
            postalCode: "10110",
          },
        },
      },
    });

    await prisma.storeAddress.create({
      data: {
        storeId: store2.id,
        latitude: -6.9175,
        longitude: 107.6191,
        Address: {
          create: {
            destination: "FreshMart Bandung Branch",
            address: "Jl. Asia Afrika No. 8",
            city: "Bandung",
            province: "West Java",
            postalCode: "40111",
          },
        },
      },
    });

    await prisma.storeAddress.create({
      data: {
        storeId: store3.id,
        latitude: -7.2575,
        longitude: 112.7521,
        Address: {
          create: {
            destination: "MegaStore Surabaya Branch",
            address: "Jl. Pemuda No. 15",
            city: "Surabaya",
            province: "East Java",
            postalCode: "60271",
          },
        },
      },
    });

    console.info("✅ Store addresses created");

    /* -------------------------------------------------------------------------- */
    /*                               CREATE CATEGORIES                            */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating categories...");

    const category1 = await prisma.category.create({
      data: {
        name: "Fruits",
        description: "Fresh fruits and farm produce",
      },
    });

    const category2 = await prisma.category.create({
      data: {
        name: "Beverages",
        description: "Drinks, juices, and refreshments",
      },
    });

    const category3 = await prisma.category.create({
      data: {
        name: "Snacks",
        description: "Snacks and quick bites",
      },
    });

    console.info("✅ Categories created:");
    console.info(`- ${category1.name}`);
    console.info(`- ${category2.name}`);
    console.info(`- ${category3.name}`);

    /* -------------------------------------------------------------------------- */
    /*                               CREATE PRODUCTS                              */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating products...");

    const product1 = await prisma.product.create({
      data: {
        name: "Apple Fuji 1kg",
        description: "Fresh Fuji apples from premium orchards",
        price: 30000,
        weight: 1.0,
        userId: storeAdmin.id,
        Image: {
          create: [
            {
              imageUrl:
                "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859664/apple_yrplns.jpg",
            },
          ],
        },
        imagePreview: {
          create: [
            {
              imageUrl:
                "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859664/apple_yrplns.jpg",
            },
          ],
        },
        imageContent: {
          create: [
            {
              imageUrl:
                "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859664/apel_hqtnge.jpg",
            },
          ],
        },
      },
    });

    const product2 = await prisma.product.create({
      data: {
        name: "Orange Juice 500ml",
        description: "100% pure orange juice with no added sugar",
        price: 25000,
        weight: 0.5,
        userId: storeAdmin.id,
        Image: {
          create: [
            {
              imageUrl:
                "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751860741/orange_juice_zvtzor.jpg",
            },
          ],
        },
        imagePreview: {
          create: [
            {
              imageUrl:
                "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751860741/orange_juice_zvtzor.jpg",
            },
          ],
        },
        imageContent: {
          create: [
            {
              imageUrl:
                "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859790/orange_juice2_txetmj.jpg",
            },
          ],
        },
      },
    });

    const product3 = await prisma.product.create({
      data: {
        name: "Potato Chips Original",
        description: "Crispy potato chips with sea salt",
        price: 15000,
        weight: 0.15,
        userId: storeAdmin.id,
        Image: {
          create: [
            {
              imageUrl:
                "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859927/chips_uhv1b8.jpg",
            },
          ],
        },
        imagePreview: {
          create: [
            {
              imageUrl:
                "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859927/chips_uhv1b8.jpg",
            },
          ],
        },
        imageContent: {
          create: [
            {
              imageUrl:
                "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859927/chips2_mxjhhv.jpg",
            },
          ],
        },
      },
    });

    console.info("✅ Products created:");
    console.info(`- ${product1.name}`);
    console.info(`- ${product2.name}`);
    console.info(`- ${product3.name}`);

    /* -------------------------------------------------------------------------- */
    /*                           CREATE PRODUCT CATEGORIES                        */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating product-category relationships...");

    await prisma.productCategory.createMany({
      data: [
        {
          productId: product1.id,
          categoryId: category1.id, // Fruits
        },
        {
          productId: product2.id,
          categoryId: category2.id, // Beverages
        },
        {
          productId: product3.id,
          categoryId: category3.id, // Snacks
        },
      ],
    });

    console.info("✅ Product-category relationships created");

    /* -------------------------------------------------------------------------- */
    /*                            CREATE STORE PRODUCTS                           */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating store products with stock...");

    await prisma.storeProduct.createMany({
      data: [
        // Store 1 products
        { productId: product1.id, storeId: store1.id, stock: 50 },
        { productId: product2.id, storeId: store1.id, stock: 30 },
        { productId: product3.id, storeId: store1.id, stock: 100 },

        // Store 2 products
        { productId: product1.id, storeId: store2.id, stock: 40 },
        { productId: product2.id, storeId: store2.id, stock: 25 },
        { productId: product3.id, storeId: store2.id, stock: 80 },

        // Store 3 products
        { productId: product1.id, storeId: store3.id, stock: 60 },
        { productId: product2.id, storeId: store3.id, stock: 35 },
        { productId: product3.id, storeId: store3.id, stock: 120 },
      ],
    });

    console.info("✅ Store products created with stock levels");

    /* -------------------------------------------------------------------------- */
    /*                            CREATE USER ADDRESSES                           */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating user addresses...");

    await prisma.userAddress.create({
      data: {
        userId: user1.id,
        recipient: "John Doe",
        isPrimary: true,
        Address: {
          create: {
            destination: "Home",
            address: "Jl. Kebon Jeruk No. 25",
            city: "Jakarta",
            province: "DKI Jakarta",
            postalCode: "11530",
          },
        },
      },
    });

    console.info("✅ User addresses created");

    console.info("🌱 Seed completed successfully ✅");
  } catch (error) {
    console.error("❌ Error during seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.info("🔌 Prisma client disconnected");
  }
}

seed();
