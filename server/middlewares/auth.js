import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    const authData = req.auth;   // ✅ Correct (no function call)

    if (!authData || !authData.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No valid token",
      });
    }

    const { userId, has } = authData;

    const hasPremiumPlan = has ? await has({ plan: "premium" }) : false;

    const user = await clerkClient.users.getUser(userId);

    // Free usage logic
    if (!hasPremiumPlan && user.privateMetadata.free_usage) {
      req.free_usage = user.privateMetadata.free_usage;
    } else {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: 0,
        },
      });

      req.free_usage = 0;
    }

    req.plan = hasPremiumPlan ? "premium" : "free";

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
