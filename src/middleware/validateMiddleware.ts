import { Request, Response, NextFunction } from 'express';
import { signupSchema, signinSchema } from '../controllers/authController';

export const validateSignup = (req: Request, res: Response, next: NextFunction) => {
  try {
    signupSchema.parse(req.body);
    next();
  } catch (error: any) {
    return res.status(400).json({ message: error.errors?.[0]?.message || 'Invalid signup data' });
  }
};

export const validateSignin = (req: Request, res: Response, next: NextFunction) => {
  try {
    signinSchema.parse(req.body);
    next();
  } catch (error: any) {
    return res.status(400).json({ message: error.errors?.[0]?.message || 'Invalid signin data' });
  }
};
