import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from "jsonwebtoken"; // Import Secret and SignOptions
import User from "../model/userModel";
import { z } from "zod";
import { StatusCodes } from 'http-status-codes';

import bcrypt from 'bcryptjs';

export const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signinSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// --- Helper Function ---
const generateToken = (id: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const expiresIn = (process.env.JWT_EXPIRES_IN || '1d') as SignOptions['expiresIn'];

  if (!jwtSecret) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file");
    throw new Error('JWT secret key is not configured.');
  }

  const options: SignOptions = {
      expiresIn,
  };

  return jwt.sign({ id }, jwtSecret, options);
};

// --- Controller Functions ---

export const signup = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username is already taken' });
    }

    const user = await User.create({ username, password });

    const token = generateToken(String(user._id));

    res.status(StatusCodes.CREATED).json({
      message: "User created successfully",
      token,
      user: {
        _id: String(user._id),
        username: user.username,
        password: user.password,
      },
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong during signup." });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {    
    const user = await User.findOne({ username }).select('+password') as unknown as { _id: any, username: string, password: string };

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }
    
   
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    
    const token = generateToken(String(user._id));

    res.status(StatusCodes.OK).json({
      message: "Signed in successfully",
      token,
      user: {
        _id: String(user._id),
        username: user.username,
        password: user.password,
      },
    });

  } catch (error: any) {
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong during signin." });
  }
};

// Make sure to export all functions and schemas correctly.
const authController = { signup, signin, signupSchema, signinSchema };
export default authController;