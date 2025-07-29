import ContentModel from "../model/contentModel";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { hash } from "bcryptjs";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const addContent = async (req: Request, res: Response) => {
  try {
    const { link, title } = req.body;

    if (!req.userId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Authentication required." });
    }

   

    if (!link ||  !title) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Link, type, and title are required." });
    }

    await ContentModel.create({
      link,
      
      title,
      user: req.userId,
    });

    res
      .status(StatusCodes.CREATED)
      .json({ message: "Content added successfully!" });
  } catch (error: any) {
    console.error("Error adding content:", error);
    if (error.name === "ValidationError") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to add content", error: error.message });
  }
};

export const getContents = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "User not authenticated." });
    }

    const contents = await ContentModel.find({
      user: userId,
    }).populate("user", "username");

    res.status(StatusCodes.OK).json({ contents });
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch contents", error: error.message });
  }
};

export const deleteContents = async (req: Request, res: Response) => {
  try {
    const contentId = req.params.id;
    const userId = req.userId;

    if (!userId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Authentication required." });
    }

    if (!contentId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Content ID is required." });
    }

    const contentToDelete = await ContentModel.findOne({
      _id: contentId,
      user: userId,
    });

    if (!contentToDelete) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Content not found or not owned by user." });
    }

    const contentTitle = contentToDelete.title;
    await ContentModel.deleteOne({ _id: contentId, user: userId });

    res
      .status(StatusCodes.OK)
      .json({ message: `Content "${contentTitle}" deleted successfully.` });
  } catch (error: any) {
    console.error("Error deleting content:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to delete content", error: error.message });
  }
};


