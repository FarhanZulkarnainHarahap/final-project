import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handlerPorvince(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await axios.get(
      "https://api.rajaongkir.com/starter/province",
      {
        headers: {
          key: process.env.RAJA_ONGKIR_API_KEY!, // Ambil dari .env.local
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching provinces:", error);
    res.status(500).json({ message: "Failed to fetch provinces" });
  }
}
