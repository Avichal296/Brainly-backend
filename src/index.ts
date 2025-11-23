import express from "express";
import { random } from "./utils.js";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { JWT_PASSWORD } from "./config.js";
import { userMiddleware } from "./middleware.js";
import cors from "cors";

// -------------------------
// 🔥 REQUIRED MIDDLEWARE
// -------------------------
const app = express();
app.use(cors());
app.use(express.json()); // <<<<<< REQUIRED (body parser)
app.use(express.urlencoded({ extended: true })); // <<<<<< REQUIRED (form support)
// -------------------------

// Signup
app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        await UserModel.create({ username, password });

        res.json({
            message: "User signed up"
        });
    } catch (e) {
        res.status(411).json({
            message: "User already exists"
        });
    }
});

// Signin
app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const existingUser = await UserModel.findOne({ username, password });

    if (existingUser) {
        const token = jwt.sign({ id: existingUser._id }, JWT_PASSWORD);

        res.json({ token });
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        });
    }
});

// Add Content
app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const { link, type, title } = req.body;

    await ContentModel.create({
        link,
        type,
        title,
        userId: req.userId,
        tags: []
    });

    res.json({ message: "Content added" });
});

// Get Content
app.get("/api/v1/content", userMiddleware, async (req, res) => {
    const userId = req.userId;

    const content = await ContentModel.find({ userId }).populate(
        "userId",
        "username"
    );

    res.json({ content });
});

// Delete content
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        contentId,
        userId: req.userId
    });

    res.json({ message: "Deleted" });
});

// Share brain
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
    const share = req.body.share;

    if (share) {
        const existingLink = await LinkModel.findOne({ userId: req.userId });

        if (existingLink) {
            res.json({ hash: existingLink.hash });
            return;
        }

        const hash = random(10);
        await LinkModel.create({
            userId: req.userId,
            hash
        });

        res.json({ hash });
    } else {
        await LinkModel.deleteOne({ userId: req.userId });

        res.json({ message: "Removed link" });
    }
});

// Open shared brain
app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({ hash });

    if (!link) {
        res.status(411).json({ message: "Sorry incorrect input" });
        return;
    }

    const content = await ContentModel.find({ userId: link.userId });
    const user = await UserModel.findById(link.userId);

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
