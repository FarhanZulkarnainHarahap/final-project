export async function logout(_req, res) {
    try {
        res
            .clearCookie("accessToken")
            .status(200)
            .json({ message: "Logout success" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to logout" }).redirect("/");
    }
}
