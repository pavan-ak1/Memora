"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = exports.signup = exports.signinSchema = exports.signupSchema = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // Import Secret and SignOptions
const userModel_1 = __importDefault(require("../model/userModel"));
const zod_1 = require("zod");
const http_status_codes_1 = require("http-status-codes");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.signupSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters").max(30),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.signinSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username is required"),
    password: zod_1.z.string().min(1, "Password is required"),
});
// --- Helper Function ---
const generateToken = (id) => {
    const jwtSecret = process.env.JWT_SECRET;
    const expiresIn = (process.env.JWT_EXPIRES_IN || '1d');
    if (!jwtSecret) {
        console.error("FATAL ERROR: JWT_SECRET is not defined in .env file");
        throw new Error('JWT secret key is not configured.');
    }
    const options = {
        expiresIn,
    };
    return jsonwebtoken_1.default.sign({ id }, jwtSecret, options);
};
// --- Controller Functions ---
const signup = async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExists = await userModel_1.default.findOne({ username });
        if (userExists) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: 'Username is already taken' });
        }
        const user = await userModel_1.default.create({ username, password });
        const token = generateToken(String(user._id));
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            message: "User created successfully",
            token,
            user: {
                _id: String(user._id),
                username: user.username,
                password: user.password,
            },
        });
    }
    catch (error) {
        console.error("Signup Error:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong during signup." });
    }
};
exports.signup = signup;
const signin = async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log("Signin attempt for username:", username);
        const user = await userModel_1.default.findOne({ username }).select('+password');
        if (!user) {
            console.log("User not found:", username);
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
        }
        if (!user.password) {
            console.log("User found but no password field:", username);
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
        }
        console.log("Comparing passwords for user:", username);
        const isPasswordCorrect = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            console.log("Password incorrect for user:", username);
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
        }
        console.log("Password correct, generating token for user:", username);
        const token = generateToken(String(user._id));
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Signed in successfully",
            token,
            user: {
                _id: String(user._id),
                username: user.username,
                password: user.password,
            },
        });
    }
    catch (error) {
        console.error("Signin Error:", error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong during signin." });
    }
};
exports.signin = signin;
// Make sure to export all functions and schemas correctly.
const authController = { signup: exports.signup, signin: exports.signin, signupSchema: exports.signupSchema, signinSchema: exports.signinSchema };
exports.default = authController;
