import express from "express";
<<<<<<< HEAD
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
=======
import Donation from "../models/Donation.js";

const router = express.Router();

// Add Donation Record
router.post("/add", async (req, res) => {
  try {
    const { farmerId, foodId, foodName } = req.body;

    const donation = new Donation({
      farmerId,
      foodId,
      foodName,
      donatedAt: new Date()
    });

    await donation.save();

    res.status(201).json({ message: "Donation saved", donation });
  } catch (err) {
    console.error("Donation API Error:", err);
    res.status(500).json({ message: "Failed to save donation" });
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
  }
});

export default router;