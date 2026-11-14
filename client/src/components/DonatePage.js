import React, { useEffect, useState, useRef, useId } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./DonatePage.css";

const DonatePage = () => {
  const [farmers, setFarmers] = useState([]);
  const [tab, setTab] = useState("ngo");
  const [quantityKg, setQuantityKg] = useState("1.0");
  const [pickupSlot, setPickupSlot] = useState("Today, 5:00 PM - 7:00 PM");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [formError, setFormError] = useState("");

  // Wasted food items state
  const [wastedItems, setWastedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [customItem, setCustomItem] = useState("");
  const [donatedItemIds, setDonatedItemIds] = useState(() => {
    try {
      const saved = localStorage.getItem("greennest_donated_food_items");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const location = useLocation();
  const navigate = useNavigate();
  const scannedFood = location.state?.foodData;
  const modalRef = useRef(null);
  const customInputRef = useRef(null);
  const titleId = useId();

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

  // Fetch farmers list
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const res = await axios.get("/farmers");
        setFarmers(res.data);
      } catch (err) {
        console.error("Error fetching farmers:", err);
      }
    };
    fetchFarmers();
  }, []);

  // Sync tab with scanned item freshness if available
  useEffect(() => {
    setTab(isDiscarded ? "farmer" : "ngo");
  }, [isDiscarded]);

  // Fetch donor's wasted food items
  const fetchWastedItems = async () => {
    setLoadingItems(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/food?wasted=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter out items already marked as donated in local history
      const availableItems = (res.data || []).filter(
        (item) => item.isWasted && !donatedItemIds.includes(item._id)
      );
      setWastedItems(availableItems);
    } catch (err) {
      console.error("Error fetching wasted items:", err);
      setWastedItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Pre-fill custom item if scannedFood is present
  useEffect(() => {
    if (scannedFood?.food_item) {
      setCustomItem(scannedFood.food_item);
    }
  }, [scannedFood]);

  // Keyboard navigation & backdrop click for accessible modal
  useEffect(() => {
    if (!selectedPartner) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closePickupForm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Focus modal container or first input
    setTimeout(() => {
      if (customInputRef.current) {
        customInputRef.current.focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPartner]);

  const handleMessage = (farmerId) => {
    navigate(`/chat/${farmerId}`);
  };

  const changeTab = (nextTab) => {
    setTab(nextTab);
    closePickupForm();
    setConfirmation("");
  };

  const openPickupForm = (partner) => {
    setSelectedPartner(partner);
    setConfirmation("");
    setFormError("");
    fetchWastedItems();

    // Default weight calculation
    if (scannedFood?.food_item) {
      setCustomItem(scannedFood.food_item);
      setQuantityKg("1.0");
    } else {
      setQuantityKg("1.0");
    }
  };

  const closePickupForm = () => {
    setSelectedPartner(null);
    setFormError("");
  };

  // Toggle single item selection
  const handleToggleItem = (itemId) => {
    setSelectedItemIds((prev) => {
      const isSelected = prev.includes(itemId);
      const updated = isSelected ? prev.filter((id) => id !== itemId) : [...prev, itemId];

      // Auto update suggested quantity (approx 0.5 kg per item or min 0.5)
      const count = updated.length;
      if (count > 0) {
        setQuantityKg((count * 0.5).toFixed(1));
      } else if (customItem.trim()) {
        setQuantityKg("1.0");
      }
      return updated;
    });
  };

  // Select all / Deselect all toggle
  const handleToggleAll = () => {
    if (selectedItemIds.length === wastedItems.length) {
      setSelectedItemIds([]);
      if (customItem.trim()) {
        setQuantityKg("1.0");
      }
    } else {
      const allIds = wastedItems.map((item) => item._id);
      setSelectedItemIds(allIds);
      const totalWeight = Math.max(0.5, allIds.length * 0.5).toFixed(1);
      setQuantityKg(totalWeight);
    }
  };

  // Handle pickup request submission
  const handlePickupRequest = async (event) => {
    event.preventDefault();
    setFormError("");

    // Gather selected items
    const selectedNames = wastedItems
      .filter((item) => selectedItemIds.includes(item._id))
      .map((item) => item.name);

    const trimmedCustom = customItem.trim();
    if (trimmedCustom) {
      selectedNames.push(trimmedCustom);
    }

    // Validation: Require at least one item
    if (selectedNames.length === 0) {
      setFormError("Please select at least one wasted item or enter a food item.");
      return;
    }

    const parsedQty = parseFloat(quantityKg);
    if (!parsedQty || parsedQty <= 0) {
      setFormError("Please enter a valid quantity in kg (greater than 0).");
      return;
    }

    const foodNameString = selectedNames.join(", ");
    const action = tab === "ngo" ? "donation scheduled" : "compost pickup requested";

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/donations/requests",
        {
          partnerType: tab,
          partnerId: String(selectedPartner.id),
          partnerName: selectedPartner.name,
          foodItem: foodNameString,
          category: foodCategory,
          quantityKg: parsedQty,
          pickupSlot,
          estimatedPayout: tab === "farmer" ? Number(estimatedPayout) : 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Successfully requested: Mark selected items to avoid duplicate donations
      if (selectedItemIds.length > 0) {
        const updatedDonated = [...new Set([...donatedItemIds, ...selectedItemIds])];
        setDonatedItemIds(updatedDonated);
        try {
          localStorage.setItem("greennest_donated_food_items", JSON.stringify(updatedDonated));
        } catch (e) {
          console.warn("Could not save donated item IDs:", e);
        }
        // Remove from current wasted list view
        setWastedItems((prev) => prev.filter((item) => !selectedItemIds.includes(item._id)));
        setSelectedItemIds([]);
      }

      setConfirmation(
        `✓ ${foodNameString}: ${action} with ${selectedPartner.name} for ${parsedQty} kg at ${pickupSlot}.`
      );
      closePickupForm();
      setCustomItem("");
    } catch (error) {
      console.error("Pickup request error:", error);
      setFormError(error.response?.data?.message || "Could not create the pickup request. Please try again.");
    }
  };

  return (
    <div className="donate-container">
      <div className="donate-header">
        <h2 className="donate-title">Food Redistribution & Compost 🤝</h2>
        <p className="donate-subtitle">
          Connect with verified local NGOs for food rescue or local farmers and compost hubs for organic waste cycling.
        </p>
      </div>

      {scannedFood && (
        <div className="donation-preview">
          <div className="preview-indicator">📦</div>
          <div className="preview-info">
            <span className="preview-label">Scanned Food Ready for Redistribution:</span>
            <strong className="preview-name">{scannedFood.food_item}</strong>
            <span className="preview-meta">
              {scannedFood.estimated_quantity} · {scannedFood.freshness_status} ({scannedFood.category || "General"})
            </span>
          </div>
        </div>
      )}

      {confirmation && (
        <div className="donation-success-banner" role="status" aria-live="polite">
          <span className="success-icon">✓</span>
          <p>{confirmation}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="donate-tabs" role="tablist" aria-label="Food redistribution options">
        <button
          type="button"
          className={`tab-btn ${tab === "ngo" ? "active" : ""}`}
          onClick={() => changeTab("ngo")}
          role="tab"
          aria-selected={tab === "ngo"}
        >
          🍽️ Donate to NGOs
        </button>
        <button
          type="button"
          className={`tab-btn ${tab === "farmer" ? "active" : ""}`}
          onClick={() => changeTab("farmer")}
          role="tab"
          aria-selected={tab === "farmer"}
        >
          🌱 Sell for Compost
        </button>
      </div>

      <p className="donate-path-description">
        {tab === "ngo"
          ? "Wholesome surplus food is routed to nearby shelters and community kitchens to feed those in need."
          : "Expired or non-edible food waste is recycled by farmers into rich organic compost, earning you indicative rewards."}
      </p>

      {/* Partners List */}
      <div className="donation-list">
        {tab === "ngo" ? (
          ngoList.map((ngo) => (
            <div key={ngo.id} className="donation-card">
              <div className="card-top">
                <span className="partner-type">COMMUNITY PARTNER</span>
                <span className="badge free">Free Donation</span>
              </div>
              <h3 className="partner-name">{ngo.name}</h3>
              <p className="partner-detail">📍 {ngo.distanceKm} km away · {ngo.quantityNeeded}</p>
              <p className="partner-detail"><strong>Accepts:</strong> {ngo.accepts.join(", ")}</p>
              <div className="card-actions">
                <button
                  type="button"
                  className="farmer-btn farmer-btn-primary"
                  onClick={() => openPickupForm(ngo)}
                >
                  Schedule Pickup
                </button>
              </div>
            </div>
          ))
        ) : (
          (farmers.length
            ? farmers
            : [
                {
                  id: "compost-point",
                  name: "GreenCycle Compost Center",
                  email: "pickup@greencycle.demo",
                  location: "Nearby collection point",
                },
              ]
          ).map((farmer) => (
            <div key={farmer.id} className="donation-card">
              <div className="card-top">
                <span className="partner-type">COMPOST COLLECTION</span>
                <span className="badge paid">Est. ₹{compostRate}/kg</span>
              </div>
              <h3 className="partner-name">{farmer.name}</h3>
              <p className="partner-detail">📍 {farmer.location || "Nearby collection point"}</p>
              <p className="partner-detail"><strong>Rate:</strong> ₹{compostRate}/kg for organic food waste</p>
              <div className="card-actions">
                <button
                  type="button"
                  className="farmer-btn farmer-btn-primary"
                  onClick={() => openPickupForm(farmer)}
                >
                  Request Pickup
                </button>
                {farmer.id !== "compost-point" && (
                  <button
                    type="button"
                    className="farmer-btn farmer-btn-secondary"
                    onClick={() => handleMessage(farmer.id)}
                  >
                    Message
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {tab === "farmer" && (
        <p className="rate-disclaimer">
          *Rates are indicative per kilogram and finalized upon weigh-in at pickup.
        </p>
      )}

      {/* Accessible Pickup Request Modal */}
      {selectedPartner && (
        <div className="modal-backdrop" onClick={closePickupForm}>
          <div
            className="pickup-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={modalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 id={titleId} className="modal-title">
                  {tab === "ngo" ? "Schedule a Free Donation Pickup" : "Request Compost Waste Pickup"}
                </h3>
                <p className="modal-subtitle">Partner: <strong>{selectedPartner.name}</strong></p>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={closePickupForm}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="modal-error-banner" role="alert">
                <span className="error-icon">⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            <form className="pickup-form" onSubmit={handlePickupRequest}>
              {/* Step 3: Wasted items multi-select checklist */}
              <div className="form-section">
                <div className="section-header-row">
                  <label className="section-label">Select Wasted Items to Include:</label>
                  {wastedItems.length > 0 && (
                    <button
                      type="button"
                      className="select-all-btn"
                      onClick={handleToggleAll}
                    >
                      {selectedItemIds.length === wastedItems.length ? "Deselect All" : "Select All"}
                    </button>
                  )}
                </div>

                {loadingItems ? (
                  <div className="items-loading-box">
                    <span className="spinner">⏳</span> Loading your wasted items...
                  </div>
                ) : wastedItems.length > 0 ? (
                  <div className="wasted-items-checklist" role="group" aria-label="Wasted items">
                    {wastedItems.map((item) => {
                      const isChecked = selectedItemIds.includes(item._id);
                      return (
                        <label
                          key={item._id}
                          className={`wasted-item-row ${isChecked ? "checked" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleItem(item._id)}
                          />
                          <div className="wasted-item-info">
                            <span className="wasted-item-name">{item.name}</span>
                            <span className="wasted-item-meta">
                              {item.category} · Wasted:{" "}
                              {item.wastedAt ? new Date(item.wastedAt).toLocaleDateString() : "Recently"}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="items-empty-box">
                    <span>🍃</span>
                    <p>No wasted items yet. You can type an item below.</p>
                  </div>
                )}
              </div>

              {/* Step 2: Food item text input */}
              <div className="form-group">
                <label htmlFor="custom-food-item" className="field-label">
                  Add another item (optional)
                </label>
                <input
                  id="custom-food-item"
                  ref={customInputRef}
                  type="text"
                  className="form-input"
                  placeholder="e.g., banana peels, stale bread"
                  value={customItem}
                  onChange={(e) => {
                    setCustomItem(e.target.value);
                    if (formError) setFormError("");
                  }}
                />
              </div>

              {/* Quantity (kg) */}
              <div className="form-group">
                <label htmlFor="pickup-quantity" className="field-label">
                  Estimated Total Quantity (kg)
                </label>
                <input
                  id="pickup-quantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  className="form-input"
                  value={quantityKg}
                  onChange={(event) => setQuantityKg(event.target.value)}
                  required
                />
              </div>

              {/* Pickup slot */}
              <div className="form-group">
                <label htmlFor="pickup-slot" className="field-label">
                  Preferred Pickup Time Slot
                </label>
                <select
                  id="pickup-slot"
                  className="form-select"
                  value={pickupSlot}
                  onChange={(event) => setPickupSlot(event.target.value)}
                >
                  <option>Today, 5:00 PM - 7:00 PM</option>
                  <option>Tomorrow, 9:00 AM - 11:00 AM</option>
                  <option>Tomorrow, 4:00 PM - 6:00 PM</option>
                </select>
              </div>

              {/* Estimated Payout for Farmer */}
              {tab === "farmer" && (
                <div className="payout-box">
                  <span className="payout-label">Estimated Payout:</span>
                  <span className="payout-value">₹{estimatedPayout}</span>
                  <span className="payout-rate">(@ ₹{compostRate}/kg)</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="modal-actions">
                <button type="submit" className="farmer-btn farmer-btn-primary">
                  Confirm Pickup
                </button>
                <button
                  type="button"
                  className="farmer-btn farmer-btn-secondary"
                  onClick={closePickupForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonatePage;
