// // import { clerkClient } from "@clerk/express";


// // export const auth = async (req, res, next)=>{
// //     try{
// //         const {userId, has} = await req.auth();
// //         const hasPremiumPlan = await has({plan: 'premium'});

// //         const user = await clerkClient.users.getUser(userId)

// //         if(!hasPremiumPlan && user.privateMetadata.free_usage){
// //             req.free_usage = user.privateMetadata.free_usage
// //         }else{
// //             await clerkClient.users.updateUserMetadata(userId, {
// //                 privateMetadata:{
// //                     free_usage:0
// //                 }
// //             })
// //             req.free_usage = 0;
// //         }
// //         req.plan = hasPremiumPlan ? 'premium' : 'free';
// //         next()
// //     } catch(error){
// //         res.json({success: false, message: error.message})
// //     }
// // }

// import { clerkClient } from "@clerk/express";


// export const auth = async (req, res, next)=>{
//     try{
//         const {userId, has} = await req.auth();
//         const hasPremiumPlan = await has({plan: 'premium'});

//         const user = await clerkClient.users.getUser(userId)

//         if(!hasPremiumPlan && user.privateMetadata.free_usage){
//             req.free_usage = user.privateMetadata.free_usage
//         }else{
//             await clerkClient.users.updateUserMetadata(userId, {
//                 privateMetadata:{
//                     free_usage:0
//                 }
//             })
//             req.free_usage = 0;
//         }
//         req.plan = hasPremiumPlan ? 'premium' : 'free';
//         next()
//     } catch(error){
//         res.json({success: false, message: error.message})
//     }
//     console.log("Resolved plan:", req.plan);

//     console.log("Clerk privateMetadata:", user.privateMetadata);

// }
import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    const { userId } = await req.auth();
    const user = await clerkClient.users.getUser(userId);

    // ✅ Read plan directly from Clerk metadata
    const rawPlan = user.privateMetadata?.plan || "free";
    req.plan = rawPlan.toLowerCase();

    // ✅ Track free usage
    req.free_usage = user.privateMetadata?.free_usage ?? 0;

    // ✅ Debug logs (inside try, so user is defined)
    console.log("Resolved plan:", req.plan);
    console.log("Clerk privateMetadata:", user.privateMetadata);

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ success: false, message: error.message });
  }
};

