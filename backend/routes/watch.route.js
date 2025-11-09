import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/authorize.js";
import {
  addWatchService,
  getAllWatchServices,
  getPendingWatchServices,
  getInProgressWatchServices,
  getCompletedWatchServices,
  getDeliveredWatchServices,
  getWatchServiceByBillNo,
  updateWatchServiceStatus,
  getWatchServicesWithUpcomingEstimation,
  sendDeliveredWatchServicesReport,
  getWatchServiceByPhoneNo,
  deleteWatchService,
} from "../controllers/watch.controller.js";

const router = express.Router();

// ✅ Admin actions
router.post("/newWatchService", verifyToken, isAdmin, addWatchService);
router.put("/updateStatus/:billNo", verifyToken, isAdmin, updateWatchServiceStatus);
router.delete("/deleteWatch/:billNo", verifyToken, isAdmin, deleteWatchService);

// ✅ Admin + Customer view
router.get("/allWatchServices", verifyToken, getAllWatchServices);
router.get("/pendingWatchServices", verifyToken, getPendingWatchServices);
router.get("/inProgressWatchServices", verifyToken, getInProgressWatchServices);
router.get("/completedWatchServices", verifyToken, getCompletedWatchServices);
router.get("/deliveredWatchServices", verifyToken, getDeliveredWatchServices);

// ✅ Search
router.get("/watchService/:billNo", verifyToken, getWatchServiceByBillNo);
router.get("/watchService/phone/:customerPhoneNumber", verifyToken, getWatchServiceByPhoneNo);

// ✅ Reports
router.get("/getUpcomingEstimatedOrders", verifyToken, getWatchServicesWithUpcomingEstimation);
router.get("/deliveredWatches", verifyToken, sendDeliveredWatchServicesReport);

export default router;
