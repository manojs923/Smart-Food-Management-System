import mongoose from "mongoose";

const donationRequestSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    partnerType: { type: String, enum: ["ngo", "farmer"], required: true },
    partnerId: { type: String, required: true },
    partnerName: { type: String, required: true },
    foodItem: { type: String, required: true },
    category: { type: String, required: true },
    quantityKg: { type: Number, min: 0.1, required: true },
    pickupSlot: { type: String, required: true },
    estimatedPayout: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ["requested", "confirmed", "completed", "cancelled"], default: "requested" },
  },
  { timestamps: true }
);

export default mongoose.model("DonationRequest", donationRequestSchema);