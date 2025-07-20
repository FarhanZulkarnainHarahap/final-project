import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handlerCity(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { province } = req.query;

  if (!province) {
    res.status(400).json({ message: "Province ID is required" });
    return;
  }

  try {
    const response = await axios.get(
      `https://api.rajaongkir.com/starter/city?province=${province}`,
      {
        headers: {
          key: process.env.RAJA_ONGKIR_API_KEY!,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ message: "Failed to fetch cities" });
  }
}
