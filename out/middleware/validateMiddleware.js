"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSignin = exports.validateSignup = void 0;
const authController_1 = require("../controllers/authController");
const validateSignup = (req, res, next) => {
    try {
        authController_1.signupSchema.parse(req.body);
        next();
    }
    catch (error) {
        return res.status(400).json({ message: error.errors?.[0]?.message || 'Invalid signup data' });
    }
};
exports.validateSignup = validateSignup;
const validateSignin = (req, res, next) => {
    try {
        authController_1.signinSchema.parse(req.body);
        next();
    }
    catch (error) {
        return res.status(400).json({ message: error.errors?.[0]?.message || 'Invalid signin data' });
    }
};
exports.validateSignin = validateSignin;
