import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";

export async function getAllCategories(_req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany();
    if (!categories || categories.length === 0) {
      res.status(404).json({ message: "No categories found." });
      return;
    }
    res.status(200).json({
      message: "Categories fetched successfully.",
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch categories." });
  }
}

export async function getCategoryById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      res.status(404).json({ message: "Category not found." });
      return;
    }

    res.status(200).json({
      message: "Category fetched successfully.",
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch category." });
  }
}
