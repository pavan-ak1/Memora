import ContentModel from "../model/contentModel";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import LinkModel from "../model/linkModel";
import { random } from "../utils/utils";
import UserModel from "../model/userModel";
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
    const { link, type, title, tags: rawTags } = req.body;

    if (!req.userId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Authentication required." });
    }

    let tags: string[] = [];
    if (typeof rawTags === "string") {
      try {
        const parsedTags = JSON.parse(rawTags);
        if (
          Array.isArray(parsedTags) &&
          parsedTags.every((item) => typeof item === "string")
        ) {
          tags = parsedTags
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "");
        } else {
          tags = rawTags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "");
        }
      } catch (e) {
        tags = rawTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "");
      }
    } else if (Array.isArray(rawTags)) {
      tags = rawTags
        .filter((item) => typeof item === "string")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");
    }

    if (!link || !type || !title) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Link, type, and title are required." });
    }

    await ContentModel.create({
      link,
      type,
      tags,
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

export const searchContent = async (req: Request, res: Response) => {
  const userId = req.userId;
  const searchValue = req.query.searchValue;

  const content = await ContentModel.find({
    user: userId,
    title: {
      $regex: searchValue,
    },
  }).populate("user", "username");
  res.status(StatusCodes.OK).json({ content });
};

export const shareContent = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Authentication required." });
    }
    const share = req.body.share;
    if (share) {
      const existingLink = await LinkModel.findOne({ user: req.userId });
      if (existingLink) {
        return res.status(StatusCodes.OK).json({
          message: "Link already exists",
          hash: existingLink.hash,
        });
      }
      const linkHash = random(10);
      await LinkModel.create({
        user: req.userId,
        hash: linkHash,
      });
      return res.status(StatusCodes.OK).json({
        message: "Created new shared link",
        hash: linkHash,
      });
    } else {
      await LinkModel.deleteOne({
        user: req.userId,
      });
      return res.status(StatusCodes.OK).json({
        message: "Shared link deleted",
      });
    }
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to update shared link", error: error.message });
  }
};

export const sharedLinkLogic = async (req: Request, res: Response) => {
  try {
    const hash = req.params.shareLink;
    const link = await LinkModel.findOne({ hash });
    if (!link) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Incorrect link" });
    }
    const content = await ContentModel.find({ user: link.user });
    const user = await UserModel.findOne({ _id: link.user });
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }
    res.status(StatusCodes.OK).json({
      user: user.username,
      content,
    });
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        message: "Failed to fetch shared content",
        error: error.message,
      });
  }
};
