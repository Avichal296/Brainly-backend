"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utils_js_1 = require("./utils.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = require("./db.js");
const config_js_1 = require("./config.js");
const middleware_js_1 = require("./middleware.js");
const cors_1 = __importDefault(require("cors"));
// -------------------------
// 🔥 REQUIRED MIDDLEWARE
// -------------------------
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // <<<<<< REQUIRED (body parser)
app.use(express_1.default.urlencoded({ extended: true })); // <<<<<< REQUIRED (form support)
// -------------------------
// Signup
app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        await db_js_1.UserModel.create({ username, password });
        res.json({
            message: "User signed up"
        });
    }
    catch (e) {
        res.status(411).json({
            message: "User already exists"
        });
    }
});
// Signin
app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const existingUser = await db_js_1.UserModel.findOne({ username, password });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({ id: existingUser._id }, config_js_1.JWT_PASSWORD);
        res.json({ token });
    }
    else {
        res.status(403).json({
            message: "Incorrect credentials"
        });
    }
});
// Add Content
app.post("/api/v1/content", middleware_js_1.userMiddleware, async (req, res) => {
    const { link, type, title } = req.body;
    await db_js_1.ContentModel.create({
        link,
        type,
        title,
        userId: req.userId,
        tags: []
    });
    res.json({ message: "Content added" });
});
// Get Content
app.get("/api/v1/content", middleware_js_1.userMiddleware, async (req, res) => {
    const userId = req.userId;
    const content = await db_js_1.ContentModel.find({ userId }).populate("userId", "username");
    res.json({ content });
});
// Delete content
app.delete("/api/v1/content", middleware_js_1.userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;
    await db_js_1.ContentModel.deleteMany({
        contentId,
        userId: req.userId
    });
    res.json({ message: "Deleted" });
});
// Share brain
app.post("/api/v1/brain/share", middleware_js_1.userMiddleware, async (req, res) => {
    const share = req.body.share;
    if (share) {
        const existingLink = await db_js_1.LinkModel.findOne({ userId: req.userId });
        if (existingLink) {
            res.json({ hash: existingLink.hash });
            return;
        }
        const hash = (0, utils_js_1.random)(10);
        await db_js_1.LinkModel.create({
            userId: req.userId,
            hash
        });
        res.json({ hash });
    }
    else {
        await db_js_1.LinkModel.deleteOne({ userId: req.userId });
        res.json({ message: "Removed link" });
    }
});
// Open shared brain
app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;
    const link = await db_js_1.LinkModel.findOne({ hash });
    if (!link) {
        res.status(411).json({ message: "Sorry incorrect input" });
        return;
    }
    const content = await db_js_1.ContentModel.find({ userId: link.userId });
    const user = await db_js_1.UserModel.findById(link.userId);
    if (!user) {
        res.status(411).json({ message: "User not found" });
        return;
    }
    res.json({
        username: user.username,
        content
    });
});
app.listen(5001, () => console.log("Backend running on 5001"));
