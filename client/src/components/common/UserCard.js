import React from "react";

function UserCard({ user, isInterested, onInterestChange, onMessage }) {
  return (
<<<<<<< HEAD
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
      <p className="font-semibold text-gray-800">
        {user.firstName} {user.lastName}
      </p>
      <p className="text-sm text-gray-500">{user.email}</p>

      <div className="flex gap-3 mt-3">
        {/* Toggle Interested / Not Interested */}
        {isInterested ? (
          <button
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            onClick={() => onInterestChange(user, "not_interested")}
          >
            Not Interested
          </button>
        ) : (
          <button
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
            onClick={() => onInterestChange(user, "interested")}
          >
            Interested
          </button>
        )}

        {/* Message Button */}
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
          onClick={() => onMessage(user)}
=======
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        {user.firstName
          ? `${user.firstName} ${user.lastName || ""}`
          : user.email.split("@")[0]}
      </h3>

      <p className="text-gray-600 text-sm mb-1">
        <strong>Email:</strong> {user.email}
      </p>
      <p className="text-gray-600 text-sm mb-3">
        <strong>Role:</strong> {user.role}
      </p>

      {/* BUTTONS */}
      <div className="flex gap-3 mt-3">
        <button
          onClick={() =>
            onInterestChange(
              user,
              isInterested ? "notInterested" : "interested"
            )
          }
          className={`px-3 py-2 rounded-md text-sm font-medium transition ${
            isInterested
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-yellow-400 text-gray-800 hover:bg-yellow-500"
          }`}
        >
          {isInterested ? "Unmark" : "Interested"}
        </button>

        <button
          onClick={() => onMessage(user)}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
        >
          Message
        </button>
      </div>
    </div>
  );
}

export default UserCard;