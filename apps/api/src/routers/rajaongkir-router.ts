import express, { Request, Response } from "express";

const router = express.Router();
const apiKey = process.env.RAJA_ONGKIR_API_KEY;
const baseUrl =
  process.env.RAJA_ONGKIR_BASE_URL ||
  "https://api-sandbox.collaborator.komerce.id";

if (!apiKey || !baseUrl) {
  throw new Error(
    "Missing RAJA_ONGKIR_API_KEY or RAJA_ONGKIR_BASE_URL in .env"
  );
}

// GET /api/rajaongkir/provinces
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      res.status(400).json({ message: "Keyword is required" });
      return;
    }
    const keywordStr = String(keyword);
    const url = `${baseUrl.replace(/\/$/, "")}/tariff/api/v1/destination/search?${new URLSearchParams({ keyword: keywordStr })}`;
    // console.log("📦 Final URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-key": apiKey!,
      },
    });

    const rawText = await response.text();
    // console.log("📨 Raw response:", rawText);

    let result;
    try {
      result = JSON.parse(rawText);
    } catch (err) {
      res.status(500).json({ message: "Invalid JSON from API", raw: rawText });
      return;
    }

    if (response.ok) {
      const destinations = result.data.map((item: any) => ({
        ...item,
        label: `${item.subdistrict_name}, ${item.district_name}, ${item.city_name}, ${item.province_name}, ${item.zip_code}`,
      }));

      res.json(destinations);
    } else {
      res.status(response.status).json({
        message: result?.meta?.message || "Failed to fetch destination",
        raw: result,
      });
    }
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/rajaongkir/cities?province=ID
// router.get("/cities", async (req, res) => {
//   try {
//     const { province } = req.query;

//     const response = await fetch(
//       `https://api.rajaongkir.com/starter/city?province=${province}`,
//       {
//         method: "GET",
//         headers: {
//           key: apiKey!,
//         },
//       }
//     );

//     const result = await response.json();

//     if (response.ok) {
//       res.json(result.rajaongkir.results);
//     } else {
//       res.status(response.status).json({ message: "Failed to fetch cities" });
//     }
//   } catch (error) {
//     console.error("Error fetching cities:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

export default router;
