import express from "express";
import DonationRequest from "../models/donationRequest.js";

const router = express.Router();

router.post("/requests", async (req, res) => {
  try {
    const {
      partnerType,
      partnerId,
      partnerName,
      foodItem,
      category,
      quantityKg,
      pickupSlot,
    } = req.body;

    const parsedQuantity = Number(quantityKg);
    const allowedPartnerTypes = ["ngo", "farmer"];
    const validStrings = [partnerId, partnerName, foodItem, category, pickupSlot].every(
      (value) => typeof value === "string" && value.trim().length > 0
    );

    if (
      !allowedPartnerTypes.includes(partnerType) ||
      !validStrings ||
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity < 0.1 ||
      parsedQuantity > 10000
    ) {
      return res.status(400).json({ message: "Missing pickup request details" });
    }

    const compostRates = { Fruits: 3, Vegetables: 2.5, Dairy: 1.5, Grains: 2, default: 2 };
    const rateCategory = category.replace(" Products", "").replace(" & Cereals", "");
    const estimatedPayout = partnerType === "farmer"
      ? Number((parsedQuantity * (compostRates[rateCategory] || compostRates.default)).toFixed(2))
      : 0;

    const request = await DonationRequest.create({
      donorId: req.user.userId,
      partnerType,
      partnerId: String(partnerId),
      partnerName,
      foodItem,
      category,
      quantityKg: parsedQuantity,
      pickupSlot,
      estimatedPayout: partnerType === "farmer" ? Number(estimatedPayout || 0) : 0,
    });

    res.status(201).json({ message: "Pickup request created", request });
  } catch (error) {
    console.error("Donation request error:", error);
    res.status(500).json({ message: "Failed to create pickup request" });
  }
});

export default router;