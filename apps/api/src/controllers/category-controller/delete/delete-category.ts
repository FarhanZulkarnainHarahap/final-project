import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const deletedCategory = await prisma.category.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Category deleted successfully.",
      data: deletedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete category." });
  }
}
