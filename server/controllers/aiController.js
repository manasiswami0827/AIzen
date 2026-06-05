import { GoogleGenerativeAI } from "@google/generative-ai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const AI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateArticle = async (req, res) => {
  try {
    const userId = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required"
      });
    }

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(429).json({
        success: false,
        message: "Limit reached. Upgrade to premium."
      });
    }

    const model = AI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 }
      });
    }
    return res.json({ success: true, content });
  } catch (error) {
    console.log("FULL GEMINI ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const generateBlogTitle = async (req, res) => {
  try {
    const userId = req.auth(); 
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required"
      });
    }

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(429).json({
        success: false,
        message: "Limit reached. Upgrade to continue."
      });
    }

    const model = AI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    if (!content) {
      return res.status(500).json({
        success: false,
        message: "No title generated"
      });
    }

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 }
      });
    }

    return res.json({ success: true, content });
  } catch (error) {
    console.error("generateBlogTitle FULL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};


export const generateImage = async (req, res) => {
  try {
    const userId = req.auth(); // Fixed: from auth middleware
    const { prompt, publish } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
      headers: { "x-api-key": process.env.CLIPDROP_API_KEY, ...formData.getHeaders() },
      responseType: "arraybuffer"
    });

    const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${!!publish})
    `;

    return res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("generateImage error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const userId = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (!image) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const formData = new FormData();
    formData.append("image_file", fs.createReadStream(image.path));

    const response = await axios.post("https://clipdrop-api.co/remove-background/v1", formData, {
      headers: { "x-api-key": process.env.CLIPDROP_API_KEY, ...formData.getHeaders() },
      responseType: "arraybuffer"
    });

    const base64Image = `data:image/png;base64,${Buffer.from(response.data, "binary").toString("base64")}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')
    `;

    return res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("removeImageBackground error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Remove Image Object - FIXED (same pattern)
export const removeImageObject = async (req, res) => {
  try {
    const userId = req.auth();
    const { object } = req.body;
    const plan = req.plan;
    const image = req.file;
    console.log(req.auth());
console.log(req.userId);

    if (!image) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }
    if (!object) {
      return res.status(400).json({ success: false, message: "Object name is required" });
    }
    if (plan !== "premium") {
      return res.status(403).json({ success: false, message: "This feature is only available for premium subscription" });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image"
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')
    `;

    return res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.error("removeImageObject error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};