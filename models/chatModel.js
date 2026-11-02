import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
<<<<<<< HEAD
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
=======
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  recipientId: {   // ✅ FIXED: MUST MATCH FRONTEND + BACKEND
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
});

export default mongoose.model("Message", messageSchema);