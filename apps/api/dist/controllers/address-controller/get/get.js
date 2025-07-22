import prisma from "../../../config/prisma-client.js";
export async function getAddresses(req, res) {
    try {
        const user = req.user;
        const userId = user.id;
        const userAddresses = await prisma.userAddress.findMany({
            where: { userId },
            orderBy: { isPrimary: "desc" },
            include: {
                Address: true,
            },
        });
        res.json(userAddresses);
    }
    catch (err) {
        console.error("Get addresses error:", err);
        res.status(500).json({ message: "Failed to fetch addresses." });
    }
}
export async function getAllProvincesFromStores(_req, res) {
    try {
        // Ambil semua Address yang memiliki storeAddressId
        const addresses = await prisma.address.findMany({
            where: {
                storeAddressId: {
                    not: null,
                },
                province: {
                    not: "",
                },
            },
            select: {
                province: true,
            },
            distinct: ["province"],
        });
        const provinces = addresses
            .map((addr) => addr.province)
            .filter((prov) => !!prov); // filter null/undefined
        res.status(200).json({ provinces });
    }
    catch (error) {
        console.error("Error fetching provinces:", error);
        res.status(500).json({ message: "Failed to fetch provinces" });
    }
}
