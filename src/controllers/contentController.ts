import ContentModel from "../model/contentModel";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes"; 

export const addContent = async (req: Request, res: Response) => {
  try {
    const { link, type, title, tags: rawTags } = req.body;
    let tags: string[] = [];
    if (typeof rawTags === 'string') {
      try {
        const parsedTags = JSON.parse(rawTags);
        if (Array.isArray(parsedTags) && parsedTags.every(item => typeof item === 'string')) {
          tags = parsedTags.map(tag => tag.trim()).filter(tag => tag !== '');
        } else {
          
          tags = rawTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        }
      } catch (e) {
        
        tags = rawTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      }
    } else if (Array.isArray(rawTags)) {
      
      tags = rawTags.filter(item => typeof item === 'string').map(tag => tag.trim()).filter(tag => tag !== '');
    }
    
    if (!link || !type || !title) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Link, type, and title are required." });
    }

    await ContentModel.create({
      link,
      type,
      tags, 
      title,
      user: req.userId, 
    });

    res.status(StatusCodes.CREATED).json({ message: "Content added successfully!" });

  } catch (error: any) {
    console.error("Error adding content:", error);
   
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation failed",
        errors: error.errors 
      });
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to add content", error: error.message });
  }
};
