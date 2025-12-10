// import express from "express";
// import { clerkClient } from "@clerk/express";
// import { Webhook } from "svix";

// const router = express.Router();

// // Clerk → Webhook → Update user plan
// router.post("/clerk", express.raw({ type: "application/json" }), async (req, res) => {
//   try {
//     const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
//     const event = wh.verify(req.body, req.headers);

//     const eventType = event.type;
//     const data = event.data;

//     // Subscription created / renewed → upgrade
//     if (eventType === "billing.subscription.created" ||
//         eventType === "billing.subscription.updated") {

//       const userId = data?.attributes?.user_id;
//       const planName = data?.attributes?.product?.name?.toLowerCase();

//       console.log("Billing Event:", eventType, "Plan:", planName);

//       await clerkClient.users.updateUserMetadata(userId, {
//         privateMetadata: {
//           plan: planName === "premium" ? "premium" : "free",
//         }
//       });
//     }

//     // Subscription canceled → downgrade
//     if (eventType === "billing.subscription.canceled") {
//       const userId = data?.attributes?.user_id;

//       await clerkClient.users.updateUserMetadata(userId, {
//         privateMetadata: {
//           plan: "free",
//         }
//       });
//     }

//     res.status(200).send("Webhook handled");
//   } catch (err) {
//     console.error("Webhook error", err);
//     res.status(400).send("Webhook error");
//   }
// });

// export default router;
