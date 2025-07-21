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
        label: `${item.id} - ${item.subdistrict_name}, ${item.district_name}, ${item.city_name}, ${item.province_name}, ${item.zip_code}`,
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

// calculate shipping cost

router.get("/calculate", async (req: Request, res: Response) => {
  try {
    const {
      shipper_destination_id,
      receiver_destination_id,
      weight,
      item_value,
      cod,
    } = req.query;

    console.log(JSON.stringify(req.query));

    // Basic validation
    if (
      !shipper_destination_id ||
      !receiver_destination_id ||
      !weight ||
      !item_value
    ) {
      res.status(400).json({ message: "Missing required query parameters" });
      return;
    }

    console.log("LLL");

    const queryParams = new URLSearchParams({
      shipper_destination_id: String(shipper_destination_id),
      receiver_destination_id: String(receiver_destination_id),
      weight: String(weight),
      item_value: String(item_value),
      // cod: String(cod),
      cod: "no",
    });
    console.log("LLL2");

    const url = `${baseUrl.replace(/\/$/, "")}/tariff/api/v1/calculate?${queryParams.toString()}`;
    console.log(url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-key": apiKey!,
      },
    });
    console.log("LLL3");

    const rawText = await response.text();

    let result;
    try {
      result = JSON.parse(rawText);
    } catch (err) {
      res.status(500).json({ message: "Invalid JSON from API", raw: rawText });
      return;
    }

    if (response.ok) {
      console.log("LLL4");
      console.log(JSON.stringify(result));
      res.json(result);
    } else {
      console.log("LLL5");
      console.log(JSON.stringify(response.body));
      res.status(response.status).json({
        message: result?.meta?.message || "Failed to calculate shipping cost",
        raw: result,
      });
    }
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
