import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400).json({ message: "Name and description are required." });
      return;
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
      },
    });
    if (!newCategory) {
      res.status(500).json({ message: "Error creating category." });
      return;
    }
    res.status(201).json({
      message: "Category created successfully.",
      data: newCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
}
