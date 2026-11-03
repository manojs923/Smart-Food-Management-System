import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const DonatePage = () => {
  const [farmers, setFarmers] = useState([]);
  const [tab, setTab] = useState("ngo");
  const [quantityKg, setQuantityKg] = useState(1);
  const [pickupSlot, setPickupSlot] = useState("Today, 5:00 PM - 7:00 PM");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const scannedFood = location.state?.foodData;

  const ngoList = [
    {
      id: "green-meals",
      name: "Green Meals Ashram",
      distanceKm: 2.4,
      accepts: ["Fresh produce", "Cooked food"],
      quantityNeeded: "Needs 15 kg today",
    },
    {
      id: "hope-kitchen",
      name: "Hope Community Kitchen",
      distanceKm: 4.1,
      accepts: ["Fruits", "Vegetables", "Packaged food"],
      quantityNeeded: "Needs 8 kg today",
    },
  ];

  const compostRates = {
    Fruits: 3,
    Vegetables: 2.5,
    Dairy: 1.5,
    Grains: 2,
    default: 2,
  };

  const foodCategory = scannedFood?.category || "Other";
  const rateCategory = foodCategory.replace(" Products", "").replace(" & Cereals", "");
  const compostRate = compostRates[rateCategory] || compostRates.default;
  const estimatedPayout = (compostRate * Number(quantityKg || 0)).toFixed(2);
  const isDiscarded = scannedFood?.freshness_status === "Discard";

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/farmers");
        setFarmers(res.data);
      } catch (err) {
        console.error("Error fetching farmers:", err);
      }
    };
    fetchFarmers();
  }, []);

  useEffect(() => {
    setTab(isDiscarded ? "farmer" : "ngo");
  }, [isDiscarded]);

  const handleMessage = (farmerId) => {
    // navigate to chat page in same tab
    navigate(`/chat/${farmerId}`);
  };

  const changeTab = (nextTab) => {
    setTab(nextTab);
    setSelectedPartner(null);
    setConfirmation("");
  };

  const openPickupForm = (partner) => {
    setSelectedPartner(partner);
    setConfirmation("");
  };

  const handlePickupRequest = async (event) => {
    event.preventDefault();
    const foodName = scannedFood?.food_item || "food items";
    const action = tab === "ngo" ? "donation scheduled" : "compost pickup requested";
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/donations/requests", {
        partnerType: tab,
        partnerId: selectedPartner.id,
        partnerName: selectedPartner.name,
        foodItem: foodName,
        category: foodCategory,
        quantityKg: Number(quantityKg),
        pickupSlot,
        estimatedPayout: tab === "farmer" ? estimatedPayout : 0,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setConfirmation(`${foodName}: ${action} with ${selectedPartner.name} for ${quantityKg} kg at ${pickupSlot}.`);
      setSelectedPartner(null);
    } catch (error) {
      console.error("Pickup request error:", error);
      setConfirmation(error.response?.data?.message || "Could not create the pickup request.");
    }
  };

  return (
    <div className="donate-container">
      <h2>Support Our Farmers 🤝</h2>
      {scannedFood && (
        <div className="donation-preview">
          <strong>Food ready to donate: {scannedFood.food_item}</strong>
          <span>{scannedFood.estimated_quantity} · {scannedFood.freshness_status}</span>
        </div>
      )}
      {confirmation && <p className="donation-message">{confirmation}</p>}
      <div className="donate-tabs" role="tablist" aria-label="Food redistribution options">
        <button className={tab === "ngo" ? "active" : ""} onClick={() => changeTab("ngo")} role="tab" aria-selected={tab === "ngo"}>
          🍽️ Donate to NGOs
        </button>
        <button className={tab === "farmer" ? "active" : ""} onClick={() => changeTab("farmer")} role="tab" aria-selected={tab === "farmer"}>
          🌱 Sell for Compost
        </button>
      </div>

      <p className="donate-path-description">
        {tab === "ngo"
          ? "Good food goes to people. Donations are free and pickup can be scheduled with a local partner."
          : "Spoiled food still has value. Collection centers turn it into compost and pay indicative rates by weight."}
      </p>

      <div className="donation-list">
        {tab === "ngo" ? ngoList.map((ngo) => (
          <div key={ngo.id} className="donation-card">
            <div>
              <p className="partner-type">COMMUNITY PARTNER</p>
              <h3>{ngo.name}</h3>
              <p>{ngo.distanceKm} km away · {ngo.quantityNeeded}</p>
              <p>Accepts: {ngo.accepts.join(", ")}</p>
            </div>
            <span className="badge free">Free Donation</span>
            <button className="btn donate-btn" onClick={() => openPickupForm(ngo)}>
              Schedule Pickup
            </button>
          </div>
        )) : (farmers.length ? farmers : [
          { id: "compost-point", name: "GreenCycle Compost Center", email: "pickup@greencycle.demo", location: "Nearby collection point" },
        ]).map((farmer) => (
          <div key={farmer.id} className="donation-card">
            <div>
              <p className="partner-type">COMPOST COLLECTION</p>
              <h3>{farmer.name}</h3>
              <p>{farmer.location || "Nearby collection point"} · Rate: ₹{compostRate}/kg</p>
              <p>Accepts: {foodCategory} and organic food waste</p>
            </div>
            <span className="badge paid">Est. Payout: ₹{estimatedPayout}</span>
            <div className="card-actions">
              <button className="btn donate-btn" onClick={() => openPickupForm(farmer)}>
                Request Pickup
              </button>
              {farmer.id !== "compost-point" && <button className="btn message-btn" onClick={() => handleMessage(farmer.id)}>Message</button>}
            </div>
          </div>
        ))}
      </div>

      {tab === "farmer" && <p className="rate-disclaimer">Rates are indicative and may vary by collection center.</p>}

      {selectedPartner && (
        <div className="pickup-form-wrap">
          <form className="pickup-form" onSubmit={handlePickupRequest}>
            <h3>{tab === "ngo" ? "Schedule a free pickup" : "Request compost pickup"}</h3>
            <p>{selectedPartner.name}</p>
            <label>
              Food item
              <input value={scannedFood?.food_item || "Food item"} readOnly />
            </label>
            <label>
              Quantity (kg)
              <input type="number" min="0.1" step="0.1" value={quantityKg} onChange={(event) => setQuantityKg(event.target.value)} required />
            </label>
            <label>
              Pickup time slot
              <select value={pickupSlot} onChange={(event) => setPickupSlot(event.target.value)}>
                <option>Today, 5:00 PM - 7:00 PM</option>
                <option>Tomorrow, 9:00 AM - 11:00 AM</option>
                <option>Tomorrow, 4:00 PM - 6:00 PM</option>
              </select>
            </label>
            {tab === "farmer" && <strong>Estimated payout: ₹{estimatedPayout}</strong>}
            <div className="card-actions">
              <button className="btn donate-btn" type="submit">Confirm Pickup</button>
              <button className="btn cancel-btn" type="button" onClick={() => setSelectedPartner(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DonatePage;