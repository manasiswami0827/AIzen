import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import axios from "axios";
import FormData from 'form-data'
// import { createRequire } from "module";

// const require = createRequire(import.meta.url);
// const pdf = require("pdf-parse");

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res)=>{

    try{
        const {userId} = req.auth();
        const {prompt, length} =req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >=10){
            return res.json({success: false, message: "Limit reached. Upgrade to continue."})
        }

        const response = await AI.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        {
            role: "user",
            content: prompt,
        },
    ],
    temperature:0.7,
    max_tokens:length,
});

const content = response.choices[0].message.content

await sql` INSERT INTO Creations (user_id, prompt, content, type)
VALUES(${userId}, ${prompt}, ${content}, 'article')`;

if(plan !== 'premium'){
    await clerkClient.users.updateUserMetadata(userId,{
        privateMetadata:{
            free_usage: free_usage + 1
        }
    })
}
    res.json({success:true, content})

    }catch(error){
        console.log(error.message)
        res.json({success: false, message:error.message})
    }
}

export const generateBlogTitle = async (req, res)=>{

    try{
        const {userId} = req.auth();
        const {prompt} =req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >=10){
            return res.json({success: false, message: "Limit reached. Upgrade to continue."})
        }

        const response = await AI.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [{role: "user",content: prompt,}],
    temperature:0.7,
    max_tokens:100,
});

const content = response.choices[0].message.content

await sql` INSERT INTO Creations (user_id, prompt, content, type)
VALUES(${userId}, ${prompt}, ${content}, 'blog-title')`;

if(plan !== 'premium'){
    await clerkClient.users.updateUserMetadata(userId,{
        privateMetadata:{
            free_usage: free_usage + 1
        }
    })
}
    res.json({success:true, content})

    }catch(error){
        console.log(error.message)
        res.json({success: false, message:error.message})
    }
}

// export const generateImage = async (req, res)=>{

//     try{
//         const {userId} = req.auth();
//         const {prompt, publish} =req.body;
//         const plan = req.plan;
       
//         if(plan !== 'premium'){
//             return res.json({success: false, message: "This feature is only awailalbe for premium subscription"})
//         }

//         const FormData = new FormData()
//         FormData.append('prompt', prompt)
//         const {data}= await axios.post("https://clipdrop-api.co/text-to-image/v1",FormData,{
//             headers:{'x-api-key': process.env.CLIPDROP_API_KEY},
//             responseType: "arraybuffer"
//         })

//         const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`

//        const {secure_url} = await cloudinary.uploader.upload(base64Image)

// await sql` INSERT INTO Creations (user_id, prompt, content, type,publish)
// VALUES(${userId}, ${prompt}, ${content}, 'image', ${publish ?? false})`;

// res.json({success:true, content:secure_url})

// if(plan !== 'premium'){
//     await clerkClient.users.updateUserMetadata(userId,{
//         privateMetadata:{
//             free_usage: free_usage + 1
//         }
//     })
// }
//     res.json({success:true, content})

//     }catch(error){
//         console.log(error.message)
//         res.json({success: false, message:error.message})
//     }
// }
export const generateImage = async (req, res) => {

  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== 'premium') {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscription"
      });
    }

    const formData = new FormData();
    formData.append('prompt', prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer"
      }
    );

    const base64Image = `data:image/png;base64,${Buffer
      .from(data, 'binary')
      .toString('base64')}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    // REQUIRED FIX ✅ (content -> secure_url)
    await sql`
      INSERT INTO Creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    // REQUIRED FIX ✅ (define free_usage safely)
    if (plan !== 'premium') {
      const free_usage =
        req.user?.privateMetadata?.free_usage || 0;

      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1
        }
      });
    }

    // REQUIRED FIX ✅ (only one response + correct variable)
    res.json({ success: true, content: secure_url });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};



// export const removeImageBackground = async (req, res)=>{

//     try{
//         const {userId} = req.auth();
//         const image =req.file;
//         const plan = req.plan;
       
//         if(plan !== 'premium'){
//             return res.json({success: false, message: "This feature is only available for premium subscription"})
//         }

//         if (!image) {
//             return res.json({ success: false, message: "Image file is required" });
//         }
        

//        const {secure_url} = await cloudinary.uploader.upload(image.path, {
//         transformation : [
//             {
//                 effect: 'background_removal',
//                 background_removal: 'remove_the_background'
//             }
//         ]
//        })

// await sql` INSERT INTO Creations (user_id, prompt, content, type)
// VALUES(${userId},'Remove background from image', ${secure_url}, 'image')`;

// res.json({success:true, content: secure_url})

//     }catch(error){
//         console.log(error.message)
//         res.json({success: false, message:error.message})
//     }
// }

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const {object} = req.body;
    const image = req.file;
    const plan = req.plan;

    if (!image) return res.json({ success: false, message: "Image is required" });
    if (plan !== 'premium') return res.json({ success: false, message: "Feature only for premium users" });

    // 1️⃣ Prepare ClipDrop API
    const formData = new FormData();
    formData.append('image_file', fs.createReadStream(image.path));

    // 2️⃣ Send to ClipDrop Remove Background
    const response = await axios.post(
      'https://clipdrop-api.co/remove-background/v1',
      formData,
      {
        headers: {
          'x-api-key': process.env.CLIPDROP_API_KEY,
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer'
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;

    // 3️⃣ Upload result to Cloudinary for storage
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    // 4️⃣ Save to database
    await sql`
      INSERT INTO Creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')
    `;

    res.json({ success: true, content: secure_url });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const plan = req.plan;
    const image = req.file;

    // REQUIRED FIX ✅
    if (!image) {
      return res.json({ success: false, message: "Image is required" });
    }

    if (!object) {
      return res.json({ success: false, message: "Object name is required" });
    }

    if (plan !== 'premium') {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscription"
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    
    const imageUrl = cloudinary.url(public_id, {
      transformation: [
        { effect: `gen_remove:${object}` }
      ],
      resource_type: 'image'
    });

    await sql`
      INSERT INTO Creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')
    `;

    res.json({ success: true, content: imageUrl });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// export const removeImageObject = async (req, res) => {
//   try {
//     const { userId } = req.auth();
//     const { object } = req.body;
//     const image = req.file;

//     if (!image) {
//       return res.json({ success: false, message: "Image is required" });
//     }

//     if (!object) {
//       return res.json({ success: false, message: "Object name is required" });
//     }

//     // 1. Send image to ClipDrop
//     const formData = new FormData();
//     formData.append("image_file", fs.createReadStream(image.path));
//     formData.append("mask", object); // object to remove

//     const response = await axios.post(
//       "https://clipdrop-api.co/remove-object/v1",
//       formData,
//       {
//         headers: {
//           ...formData.getHeaders(),
//           "x-api-key": process.env.CLIPDROP_API_KEY
//         },
//         responseType: "arraybuffer"
//       }
//     );

//     // 2. Save temp file
//     const outputPath = `removed_${Date.now()}.png`;
//     fs.writeFileSync(outputPath, response.data);

//     // 3. Upload result to Cloudinary
//     const result = await cloudinary.uploader.upload(outputPath, {
//       folder: "ai-edits"
//     });

//     // 4. Save to DB
//     await sql`
//       INSERT INTO Creations (user_id, prompt, content, type)
//       VALUES (${userId}, ${`Removed ${object} from image`}, ${result.secure_url}, 'image')
//     `;

//     // 5. Clean up
//     fs.unlinkSync(outputPath);
//     fs.unlinkSync(image.path);

//     res.json({ success: true, content: result.secure_url });

//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// };

// export const removeImageObject = async (req, res) => {
//   try {
//     const { userId } = req.auth();
//     const image = req.file;
//     const { object } = req.body;
//     const plan = req.plan;

//     if (!image) return res.json({ success: false, message: "Image is required" });
//     if (!object) return res.json({ success: false, message: "Object name is required" });
//     if (plan !== 'premium') return res.json({ success: false, message: "Feature only for premium users" });

//     // 1️⃣ Prepare ClipDrop API
//     const formData = new FormData();
//     formData.append('image_file', fs.createReadStream(image.path));
//     formData.append('object', object); // object to remove

//     // 2️⃣ Send to ClipDrop Remove Object
//     const response = await axios.post(
//       'https://clipdrop-api.co/remove-object/v1',
//       formData,
//       {
//         headers: {
//           'x-api-key': process.env.CLIPDROP_API_KEY,
//           ...formData.getHeaders()
//         },
//         responseType: 'arraybuffer'
//       }
//     );

//     const base64Image = `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;

//     // 3️⃣ Upload result to Cloudinary for storage
//     const { secure_url } = await cloudinary.uploader.upload(base64Image);

//     // 4️⃣ Save to database
//     await sql`
//       INSERT INTO Creations (user_id, prompt, content, type)
//       VALUES (${userId}, ${`Removed ${object} from image`}, ${secure_url}, 'image')
//     `;

//     res.json({ success: true, content: secure_url });

//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// };

// export const resumeReview = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.json({ success: false, message: "PDF is required" });
//     }

//     const dataBuffer = fs.readFileSync(req.file.path);
//     const data = await pdf(dataBuffer);

//     console.log(data.text);  // ✅ THIS WORKS
//     res.json({ success: true, text: data.text });

//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// };

// export const resumeReview = async (req, res)=>{

//     try{
//         const {userId} = req.auth();
//         const resume =req.file;
//         const plan = req.plan;
       
//         if(plan !== 'premium'){
//             return res.json({success: false, message: "This feature is only awailable for premium subscription"})
//         }

//          if (!resume) {
//             return res.json({ success: false, message: "Resume file is required" });
//         }

//         if(resume.size > 5 * 1024 * 1024){
//             return res.json({success: false, message: " Resume file size exceeds allowed size (5MB). "})
//         }
//         if (resume.mimetype !== 'application/pdf') {
//             return res.json({ success: false, message: "Only PDF files are allowed" });
//         }

//         const dataBuffer = fs.readFileSync(resume.path)
        
//         const pdfData = await pdf(dataBuffer)

//         const prompt = `Review the following reume and provide constructive feedback on its strengths, weaknesses,
//          and areas for improvement. Resume Content:\n\n${pdfData.text}`

//           const response = await AI.chat.completions.create({
//     model: "gemini-2.0-flash",
//     messages: [{ role: "user", content: prompt,}],
//     temperature:0.7,
//     max_tokens:1000,
// });

// const content = response.choices[0].message.content


// await sql` INSERT INTO Creations (user_id, prompt, content, type)
// VALUES(${userId},'review the uploaded resume', ${content}, 'resume-review')`;

// res.json({success:true, content})

//     }catch(error){
//         console.log(error.message)
//         res.json({success: false, message:error.message})
//     }
// }