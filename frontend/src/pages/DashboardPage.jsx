import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LogOut,
  User,
  Mail,
  Calendar,
  Clock as LastLogin,
  Watch as WatchIcon,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { formatDate } from "../utils/date";

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const [watches, setWatches] = useState([]);
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase();
  const API_URL="https://kalchakra.onrender.com";

  const handleLogout = () => logout();

  // ✅ Fetch all watch services (admin only)
  const fetchWatches = async () => {
    try {
      const res = await axios.get(
        `https://kalchakra.onrender.com/api/watch/allWatchServices`,
        { withCredentials: true }
      );
      setWatches(res.data.services || []);
    } catch (error) {
      console.error("Error fetching watches:", error);
    }
  };

  // ✅ Update status (admin only)
  const handleStatusChange = async (billNo, newStatus) => {
    try {
      await axios.put(
        `https://kalchakra.onrender.com/api/watch/updateStatus/${billNo}`,
        { status: newStatus },
        { withCredentials: true }
      );
      fetchWatches();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // ✅ Delete watch service (admin only)
  const handleDeleteWatch = async (billNo) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Watch Bill No: ${billNo}?`
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://kalchakra.onrender.com/api/watch/deleteWatch/${billNo}`,
        { withCredentials: true }
      );
      alert(`Watch with Bill No ${billNo} deleted successfully.`);
      fetchWatches();
    } catch (error) {
      console.error("Error deleting watch:", error);
      alert("Failed to delete watch. Please try again.");
    }
  };

  useEffect(() => {
    if (user?.email?.toLowerCase() === ADMIN_EMAIL) {
      fetchWatches();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/kalchakra-logo.png"
              alt="Kalchakra Logo"
              className="h-14 w-14 object-contain"
            />
            <span className="text-2xl font-bold text-black">Kalchakra</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gold hover:text-gold/80 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-gold">
          Dashboard
        </h2>

        {/* PROFILE + ACTIVITY */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gold mb-4">
              Profile Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <p className="text-gray-700">Name: {user.name}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <p className="text-gray-700">Email: {user.email}</p>
              </div>
            </div>
          </div>

          {/* Account Activity */}
          <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gold mb-4">
              Account Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <p className="text-gray-700">
                  <span className="font-semibold">Joined: </span>
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <LastLogin className="h-5 w-5 text-gray-400" />
                <p className="text-gray-700">
                  <span className="font-semibold">Last Login: </span>
                  {formatDate(user.lastLogin)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ MANAGE WATCH SERVICES (Admin only) */}
        {user?.email?.toLowerCase() === ADMIN_EMAIL && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center text-gold mb-6 flex justify-center items-center space-x-2">
              <WatchIcon className="h-6 w-6 text-gold" />
              <span>Manage Watch Services</span>
            </h3>

            {watches.length === 0 ? (
              <p className="text-center text-gray-600">
                No watch services available.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 shadow-md rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left border">Bill No</th>
                      <th className="px-4 py-2 text-left border">
                        Customer Details
                      </th>
                      <th className="px-4 py-2 text-left border">
                        Estimated Completion
                      </th>
                      <th className="px-4 py-2 text-left border">Description</th>
                      <th className="px-4 py-2 text-left border">Status</th>
                      <th className="px-4 py-2 text-left border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watches.map((watch) => (
                      <tr key={watch.billNo} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 border">{watch.billNo}</td>
                        <td className="px-4 py-3 border">
                          <p><strong>Name:</strong> {watch.customerName}</p>
                          <p><strong>Phone:</strong> {watch.customerPhoneNumber}</p>
                          <p><strong>Service:</strong> {watch.serviceType}</p>
                          <p><strong>Cost:</strong> ₹{watch.cost}</p>
                        </td>
                        <td className="px-4 py-3 border">
                          {watch.estimatedCompletionDate
                            ? new Date(
                                watch.estimatedCompletionDate
                              ).toLocaleDateString("en-GB")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 border">
                          {watch.description || "No description"}
                        </td>

                        {/* ✅ STATUS DROPDOWN */}
                        <td className="px-4 py-3 border bg-blue-100 text-center">
                          <select
                            value={watch.serviceStatus}
                            onChange={(e) =>
                              handleStatusChange(watch.billNo, e.target.value)
                            }
                            className="border border-gray-400 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>

                        {/* 🗑 DELETE BUTTON */}
                        <td className="px-4 py-3 border text-center">
                          <button
                            onClick={() => handleDeleteWatch(watch.billNo)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full flex items-center justify-center mx-auto transition duration-200"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ✅ BUTTONS */}
        <div className="mt-12 flex justify-center space-x-4">
          {/* Only Admin can see Add Watch */}
          {user?.email?.toLowerCase() === ADMIN_EMAIL && (
            <Link
              to="/add-watch"
              className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
              Add Watch
            </Link>
          )}

          {/* Everyone can see Track Watch */}
          <Link
            to="/track-watch"
            className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-8 rounded-full border-2 border-black transition duration-300 ease-in-out transform hover:scale-105"
          >
            Track Watch
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Kalchakra. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
