import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";

export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400).json({ message: "Name and description are required." });
      return;
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, description },
    });

    res.status(200).json({
      message: "Category updated successfully.",
      data: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update category." });
  }
}
