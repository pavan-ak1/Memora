"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validateMiddleware_1 = require("../middleware/validateMiddleware");
const router = (0, express_1.Router)();
router.post('/signup', validateMiddleware_1.validateSignup, authController_1.signup);
router.post('/signin', validateMiddleware_1.validateSignin, authController_1.signin);
exports.default = router;
