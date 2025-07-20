// types/multer.ts
import { Request } from "express";

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export interface MulterRequest extends Request {
  files?: {
    imagePreview?: MulterFile[];
    imageContent?: MulterFile[];
    [fieldname: string]: MulterFile[];
  };
}
