import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    const { userId } = await req.auth();
    const user = await clerkClient.users.getUser(userId);

    const rawPlan = user.privateMetadata?.plan || "free";
    req.plan = rawPlan.toLowerCase();

      req.free_usage = user.privateMetadata?.free_usage ?? 0;

    console.log("Resolved plan:", req.plan);
    console.log("Clerk privateMetadata:", user.privateMetadata);

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ success: false, message: error.message });
  }
};