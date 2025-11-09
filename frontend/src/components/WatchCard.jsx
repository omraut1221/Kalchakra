import React, { useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const WatchCard = ({ watch, refresh }) => {
  const { user } = useAuthStore();
  const [status, setStatus] = useState(watch.serviceStatus);

  // Update status (only for admin)
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    try {
      await axios.put(
        `https://kalchakra.onrender.com/api/watch/updateStatus/${watch.billNo}`,
        { status: newStatus },
        { withCredentials: true }
      );

      alert(`Status updated to "${newStatus}" successfully!`);
      refresh(); // reload list
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">{watch.customerName}</h2>
      <p><strong>Bill No:</strong> {watch.billNo}</p>
      <p><strong>Phone:</strong> {watch.customerPhoneNumber}</p>
      <p><strong>Watch Type:</strong> {watch.watchType}</p>
      <p><strong>Brand:</strong> {watch.brand || "N/A"}</p>
      <p><strong>Model:</strong> {watch.model || "N/A"}</p>
      <p><strong>Service Type:</strong> {watch.serviceType}</p>
      <p><strong>Cost:</strong> ₹{watch.cost || "N/A"}</p>
      <p><strong>Status:</strong> {status}</p>

      {/* Show dropdown only for admin */}
      {user?.role === "admin" && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Update Status:
          </label>
          <select
            className="border border-gray-400 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={status}
            onChange={handleStatusChange}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default WatchCard;
