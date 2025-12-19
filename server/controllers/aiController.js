// import OpenAI from "openai";
// import sql from "../configs/db.js";
// import { clerkClient } from "@clerk/express";
// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";
// import axios from "axios";
// import FormData from "form-data";

// const AI = new OpenAI({
//   apiKey: process.env.GEMINI_API_KEY,
//   baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
// });

// export const generateArticle = async (req, res) => {
//   try {
//     const { userId } = req.auth();
//     const { prompt, length = 800 } = req.body;
//     const plan = (req.plan || "").toLowerCase();
//     const free_usage = Number(req.free_usage) || 0;

//     if (!prompt || typeof prompt !== "string") {
//       return res.status(400).json({ success: false, message: "Prompt is required" });
//     }

//     if (plan !== "premium" && free_usage >= 10) {
//       return res.status(429).json({ success: false, message: "Free usage limit reached. Upgrade to continue." });
//     }

//     let content;
//     try {
//       const response = await AI.chat.completions.create({
//         model: "gemini-2.0-flash",
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.7,
//         max_tokens: Math.min(Math.max(Number(length) || 800, 100), 4000),
//       });

//       content = response?.choices?.[0]?.message?.content?.trim();
//     } catch (apiError) {
//       console.error("Gemini API error:", apiError);
//       if (apiError.status === 429) {
//         return res.status(429).json({
//           success: false,
//           message: "AI service rate limit exceeded. Please try again later or upgrade your plan."
//         });
//       }
//       return res.status(500).json({ success: false, message: "AI service failed. Try again later." });
//     }

//     if (!content) {
//       return res.status(500).json({ success: false, message: "No content generated" });
//     }

//     await sql`
//       INSERT INTO creations (user_id, prompt, content, type)
//       VALUES (${userId}, ${prompt}, ${content}, 'article')
//     `;

//     if (plan !== "premium") {
//       await clerkClient.users.updateUserMetadata(userId, {
//         privateMetadata: {
//           ...req.user.privateMetadata,
//           free_usage: free_usage + 1,
//         },
//       });
//     }

//     return res.json({ success: true, content });
//   } catch (error) {
//     console.error("Controller error:", error);
//     return res.status(500).json({ success: false, message: error.message || "Failed to generate article" });
//   }
// };

// export const generateBlogTitle = async (req, res) => {
//   try {
//     const { userId } = req.auth();
//     const { prompt } = req.body;
//     const plan = (req.plan || "").toLowerCase();
//     const free_usage = Number(req.free_usage) || 0;

//     if (!prompt || typeof prompt !== "string") {
//       return res.status(400).json({ success: false, message: "Prompt is required" });
//     }

//     if (plan !== "premium" && free_usage >= 10) {
//       return res.status(429).json({ success: false, message: "Limit reached. Upgrade to continue." });
//     }

//     const response = await AI.chat.completions.create({
//       model: "gemini-2.0-flash",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.7,
//       max_tokens: 100,
//     });

//     const content = response?.choices?.[0]?.message?.content?.trim();
//     if (!content) {
//       return res.status(500).json({ success: false, message: "No title generated" });
//     }

//     await sql`
//       INSERT INTO creations (user_id, prompt, content, type)
//       VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
//     `;

//     if (plan !== "premium") {
//       await clerkClient.users.updateUserMetadata(userId, {
//         privateMetadata: {
//           ...req.user.privateMetadata,
//           free_usage: free_usage + 1,
//         },
//       });
//     }

//     res.json({ success: true, content });
//   } catch (error) {
//     console.error("generateBlogTitle error:", error);
//     res.status(500).json({ success: false, message: error.message || "Failed to generate blog title" });
//   }
// };

// export const generateImage = async (req, res) => {
//   try {
//     const { userId } = req.auth();
//     const { prompt, publish = false } = req.body;
//     const plan = (req.plan || "").toLowerCase();

//     if (plan !== "premium") {
//       return res.status(403).json({ success: false, message: "This feature is only available for premium subscription" });
//     }
//     if (!prompt || typeof prompt !== "string") {
//       return res.status(400).json({ success: false, message: "Prompt is required" });
//     }

//     const formData = new FormData();
//     formData.append("prompt", prompt);

//     const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
//       headers: { "x-api-key": process.env.CLIPDROP_API_KEY, ...formData.getHeaders() },
//       responseType: "arraybuffer",
//     });

//     const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;
//     const { secure_url } = await cloudinary.uploader.upload(base64Image);

//     await sql`
//       INSERT INTO creations (user_id, prompt, content, type, publish)
//       VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${!!publish})
//     `;

//     res.json({ success: true, content: secure_url });
//   } catch (error) {
//     console.error("generateImage error:", error);
//     res.status(500).json({ success: false, message: error.message || "Failed to generate image" });
//   }
// };

// export const removeImageBackground = async (req, res) => {
//   try {
//     const { userId } = req.auth();
//     const image = req.file;
//     const plan = (req.plan || "").toLowerCase();

//     if (plan !== "premium") {
//       return res.status(403).json({ success: false, message: "Feature only for premium users" });
//     }
//     if (!image?.path) {
//       return res.status(400).json({ success: false, message: "Image is required" });
//     }

//     const formData = new FormData();
//     formData.append("image_file", fs.createReadStream(image.path));

//     const response = await axios.post("https://clipdrop-api.co/remove-background/v1", formData, {
//       headers: { "x-api-key": process.env.CLIPDROP_API_KEY, ...formData.getHeaders() },
//       responseType: "arraybuffer",
//     });

//     const base64Image = `data:image/png;base64,${Buffer.from(response.data, "binary").toString("base64")}`;
//     const { secure_url } = await cloudinary.uploader.upload(base64Image);

//     await sql`
//       INSERT INTO creations (user_id, prompt, content, type)
//       VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')
//     `;

//     res.json({ success: true, content: secure_url });
//   } catch (error) {
//     console.error("removeImageBackground error:", error);
//     res.status(500).json({ success: false, message: error.message || "Failed to remove background" });
//   }
// };

// export const removeImageObject = async (req, res) => {
//   try {
//     const { userId } = req.auth();
//     const { object } = req.body;
//     const plan = (req.plan || "").toLowerCase();
//     const image = req.file;

//     if (plan !== "premium") {
//       return res.status(403).json({ success: false, message: "This feature is only available for premium subscription" });
//     }
//     if (!image?.path) {
//       return res.status(400).json({ success: false, message: "Image is required" });
//     }
//     if (!object || typeof object !== "string") {
//       return res.status(400).json({ success: false, message: "Object name is required" });
//     }

//     // Upload the image to Cloudinary
//     const { public_id } = await cloudinary.uploader.upload(image.path);

//     // Apply object removal transformation
//     const imageUrl = cloudinary.url(public_id, {
//       transformation: [{ effect: `gen_remove:${object}` }],
//       resource_type: "image",
//     });

//     // Save to database
//     await sql`
//       INSERT INTO creations (user_id, prompt, content, type)
//       VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')
//     `;

//     res.json({ success: true, content: imageUrl });
//   } catch (error) {
//     console.error("removeImageObject error:", error);
//     res.status(500).json({ success: false, message: error.message || "Failed to remove object" });
//   }
// };

import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// -------------------- Generate Article --------------------
export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(429).json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: length || 800
    });

    const content = response?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return res.status(500).json({ success: false, message: "No content generated" });
    }

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
    console.error("generateArticle error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- Generate Blog Title --------------------
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(429).json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100
    });

    const content = response?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return res.status(500).json({ success: false, message: "No title generated" });
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
    console.error("generateBlogTitle error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- Generate Image --------------------
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium") {
      return res.status(403).json({ success: false, message: "This feature is only available for premium subscription" });
    }
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

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 }
      });
    }

    return res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("generateImage error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- Remove Image Background --------------------
export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (!image) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }
    if (plan !== "premium") {
      return res.status(403).json({ success: false, message: "Feature only for premium users" });
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

// -------------------- Remove Image Object --------------------
export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const plan = req.plan;
    const image = req.file;

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
