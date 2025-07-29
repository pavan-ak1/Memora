import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import LinkModel from "../model/linkModel";
import { random } from "../utils/utils";
import UserModel from "../model/userModel";
import ContentModel from "../model/contentModel";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const toggleShare = async (req: Request, res: Response) => {
  try {
    console.log('Toggle share request received. User ID:', req.userId);
    console.log('Request body:', req.body);
    
    if (!req.userId) {
      console.error('No user ID found in request');
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'User not authenticated',
        error: 'Missing user ID in request'
      });
    }

    const share = req.body.share;
    
    if (share) {
      console.log('Enabling sharing for user:', req.userId);
      
      try {
        const existingLink = await LinkModel.findOne({
          user: req.userId
        });

        if (existingLink) {
          console.log('Existing share link found:', existingLink.hash);
          return res.status(StatusCodes.OK).json({
            hash: existingLink.hash,
            message: 'Using existing share link'
          });
        }

        console.log('No existing share link found. Creating new one...');
        const hash = random(10);
        console.log('Generated hash:', hash);
        
        const newLink = await LinkModel.create({
          user: req.userId,
          hash: hash
        });
        
        console.log('New share link created:', newLink);

        return res.status(StatusCodes.CREATED).json({
          hash,
          message: 'Sharing enabled successfully'
        });
      } catch (dbError: any) {
        console.error('Database error in toggleShare:', dbError);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'Database error while updating share settings',
          error: dbError?.message || 'Unknown database error'
        });
      }
    } else {
      console.log('Disabling sharing for user:', req.userId);
      
      try {
        const result = await LinkModel.deleteOne({
          user: req.userId
        });
        
        console.log('Delete result:', result);

        if (result.deletedCount === 0) {
          console.log('No share link found to delete for user:', req.userId);
          return res.status(StatusCodes.NOT_FOUND).json({
            message: 'No active share link found to disable'
          });
        }

        return res.status(StatusCodes.OK).json({
          message: 'Sharing disabled successfully'
        });
      } catch (dbError: any) {
        console.error('Database error while disabling sharing:', dbError);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'Error while disabling sharing',
          error: dbError?.message || 'Unknown error'
        });
      }
    }
  } catch (error: any) {
    console.error('Unexpected error in toggleShare:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'An unexpected error occurred',
      error: error?.message || 'Unknown error'
    });
  }
};

export const getSharedContent = async (req: Request, res: Response) => {
  try {
    const { shareLink } = req.params;
    console.log('Fetching shared content for link:', shareLink);
    
    // Find the share link
    const link = await LinkModel.findOne({ hash: shareLink });
    
    if (!link) {
      console.log('No share link found for:', shareLink);
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "The share link is invalid or has expired"
      });
    }
    
    console.log('Found link for user ID:', link.user);
    
    // Get the user's public content
    const [content, user] = await Promise.all([
      ContentModel.find({ user: link.user, isPublic: { $ne: false } })
        .select('title link type createdAt')
        .sort({ createdAt: -1 }),
      UserModel.findById(link.user).select('username')
    ]);
    
    if (!user) {
      console.log('User not found for link:', link.user);
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "The owner of this content could not be found"
      });
    }
    
    console.log(`Found ${content.length} content items for user: ${user.username}`);
    
    // Set cache headers for public content
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    
    return res.status(StatusCodes.OK).json({
      success: true,
      username: user.username,
      content: content,
      sharedAt: link.createdAt
    });
    
  } catch (error) {
    console.error("Error in getSharedContent:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while fetching the shared content"
    });
  }
};
