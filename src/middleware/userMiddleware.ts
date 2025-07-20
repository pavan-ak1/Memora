import { NextFunction, Request, Response } from "express"
    import { StatusCodes } from "http-status-codes";
    import jwt from "jsonwebtoken"
    


    

  
    declare global {
      namespace Express {
        interface Request {
          userId?: string;
        }
      }
    }

    const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
      const secret = process.env.JWT_SECRET; 
      const authHeader = req.headers["authorization"];

      if (!authHeader) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Authorization header missing." });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token not found in Authorization header." });
      }


      if (!secret) {
        console.error("userMiddleware: JWT_SECRET is NOT defined in environment variables!");
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server configuration error: JWT_SECRET missing." });
      }

      try {
        const decoded = jwt.verify(token, secret) as { id: string, iat: number, exp: number }; 

        req.userId = decoded.id; 

        
        next();
      } catch (error: any) {
        
        if (error instanceof jwt.JsonWebTokenError) {
          return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token.", error: error.message });
        } else if (error instanceof jwt.TokenExpiredError) {
          return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token expired.", error: error.message });
        } else {
          console.error("Authentication error:", error);
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to authenticate token.", error: error.message });
        }
      }
    }

    export default userMiddleware;
    