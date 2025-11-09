import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import {
  sendDeliveredWatchEmailWithAttachment,
  sendDueWatchServicesEmail,
} from "../mailtrap/emails.js";
import { WatchService } from "../models/watch.model.js";
import { User } from "../models/user.model.js";

/* ------------------------ Helper: Get requesting user ------------------------ */
const getRequestingUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return { user: null, errorResponse: true };
    }
    return { user, errorResponse: false };
  } catch (err) {
    console.error("Error fetching user:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching user" });
    return { user: null, errorResponse: true };
  }
};

/* ------------------------ Get watch service by Bill No ------------------------ */
export const getWatchServiceByBillNo = async (req, res) => {
  const { billNo } = req.params;
  try {
    const service = await WatchService.findOne({ billNo });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "No watch service found with the given bill number.",
      });
    }
    const { user, errorResponse } = await getRequestingUser(req, res);
    if (errorResponse) return;
    if (user.role !== "admin" && service.customerEmail !== user.email) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Access denied" });
    }
    res.status(200).json({ success: true, watchService: service });
  } catch (error) {
    console.error("Error retrieving watch service by bill number:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving watch service by bill number.",
      error: error.message,
    });
  }
};

/* ------------------------ Get watch service by Phone ------------------------ */
export const getWatchServiceByPhoneNo = async (req, res) => {
  const { customerPhoneNumber } = req.params;
  try {
    const service = await WatchService.findOne({ customerPhoneNumber });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "No watch service found with the given phone number.",
      });
    }
    const { user, errorResponse } = await getRequestingUser(req, res);
    if (errorResponse) return;
    if (user.role !== "admin" && service.customerEmail !== user.email) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Access denied" });
    }
    res.status(200).json({ success: true, watchService: service });
  } catch (error) {
    console.error("Error retrieving watch service by phone number:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving watch service by phone number.",
      error: error.message,
    });
  }
};

/* ------------------------ Update watch status ------------------------ */
export const updateWatchServiceStatus = async (req, res) => {
  const { billNo } = req.params;
  const { status } = req.body;
  const allowed = ["Pending", "In Progress", "Completed", "Delivered"];
  if (!allowed.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status value" });
  }
  try {
    const { user, errorResponse } = await getRequestingUser(req, res);
    if (errorResponse) return;
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: Admins only" });
    }
    const updated = await WatchService.findOneAndUpdate(
      { billNo },
      { serviceStatus: status },
      { new: true }
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Watch service not found" });
    res.status(200).json({
      success: true,
      message: `Status updated to '${status}' successfully!`,
      watchService: updated,
    });
  } catch (error) {
    console.error("Error updating watch status:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* ------------------------ Get all watch services ------------------------ */
export const getAllWatchServices = async (req, res) => {
  try {
    const { user, errorResponse } = await getRequestingUser(req, res);
    if (errorResponse) return;
    const services =
      user.role === "admin"
        ? await WatchService.find()
        : await WatchService.find({ customerEmail: user.email });
    res.status(200).json({ success: true, services });
  } catch (error) {
    console.error("Error retrieving watch services:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ------------------------ Filter by Status ------------------------ */
export const getPendingWatchServices = async (req, res) => {
  try {
    const { user } = await getRequestingUser(req, res);
    const query = { serviceStatus: "Pending" };
    if (user.role !== "admin") query.customerEmail = user.email;
    const services = await WatchService.find(query);
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getInProgressWatchServices = async (req, res) => {
  try {
    const { user } = await getRequestingUser(req, res);
    const query = { serviceStatus: "In Progress" };
    if (user.role !== "admin") query.customerEmail = user.email;
    const services = await WatchService.find(query);
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getCompletedWatchServices = async (req, res) => {
  try {
    const { user } = await getRequestingUser(req, res);
    const query = { serviceStatus: "Completed" };
    if (user.role !== "admin") query.customerEmail = user.email;
    const services = await WatchService.find(query);
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getDeliveredWatchServices = async (req, res) => {
  try {
    const { user } = await getRequestingUser(req, res);
    const query = { serviceStatus: "Delivered" };
    if (user.role !== "admin") query.customerEmail = user.email;
    const services = await WatchService.find(query);
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ------------------------ Add new watch (Admin only) ------------------------ */
export const addWatchService = async (req, res) => {
  const {
    billNo,
    customerName,
    customerEmail,
    customerPhoneNumber,
    watchType,
    brand,
    model,
    serviceType,
    estimatedCompletionDate,
    cost,
    description,
  } = req.body;
  try {
    const { user, errorResponse } = await getRequestingUser(req, res);
    if (errorResponse) return;
    if (user.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "Admins only can add services" });

    const exists = await WatchService.findOne({ billNo });
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "Bill No already exists" });

    const newWatch = new WatchService({
      billNo,
      customerName,
      customerEmail,
      customerPhoneNumber,
      watchType,
      brand,
      model,
      serviceType,
      estimatedCompletionDate,
      cost,
      description,
      serviceStatus: "Pending",
    });
    await newWatch.save();
    res
      .status(201)
      .json({ success: true, message: "Watch added successfully!", newWatch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ------------------------ Delete watch (Admin only) ------------------------ */
export const deleteWatchService = async (req, res) => {
  const { billNo } = req.params;
  try {
    const { user, errorResponse } = await getRequestingUser(req, res);
    if (errorResponse) return;
    if (user.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "Admins only can delete" });

    const deleted = await WatchService.findOneAndDelete({ billNo });
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Watch not found" });

    res.status(200).json({
      success: true,
      message: `Watch with Bill No ${billNo} deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ------------------------ Upcoming Estimation Report ------------------------ */
export const getWatchServicesWithUpcomingEstimation = async (req, res) => {
  try {
    const { user } = await getRequestingUser(req, res);
    const query = { serviceStatus: { $in: ["Pending", "In Progress"] } };
    if (user.role !== "admin") query.customerEmail = user.email;

    const services = await WatchService.find(query);
    const serviceDetails = services.map((s) => ({
      billNo: s.billNo,
      customerPhoneNumber: s.customerPhoneNumber,
      description: s.description,
      estimatedCompletionDate: s.estimatedCompletionDate,
    }));

    const email = process.env.ADMIN_EMAIL;
    await sendDueWatchServicesEmail(email, serviceDetails);
    res.status(200).json({
      success: true,
      message: "Upcoming estimation email sent successfully!",
      serviceDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ------------------------ Delivered Watch Report ------------------------ */
export const sendDeliveredWatchServicesReport = async (req, res) => {
  try {
    const { user } = await getRequestingUser(req, res);
    if (user.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "Admins only can send reports" });

    const services = await WatchService.find({ serviceStatus: "Delivered" });
    if (!services.length)
      return res
        .status(404)
        .json({ success: false, message: "No delivered watches found" });

    const doc = new PDFDocument();
    const filePath = path.resolve("./delivered_watch_services_report.pdf");
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(16).text("Delivered Watch Services Report", { align: "center" });
    doc.moveDown();
    services.forEach((s, i) => {
      doc.text(`Service #${i + 1}`);
      doc.text(`Bill No: ${s.billNo}`);
      doc.text(`Customer: ${s.customerName}`);
      doc.text(`Status: ${s.serviceStatus}`);
      doc.moveDown();
    });
    doc.end();

    stream.on("finish", async () => {
      const email = process.env.ADMIN_EMAIL;
      await sendDeliveredWatchEmailWithAttachment(
        email,
        "Delivered Watch Services Report",
        "<p>Attached is the delivered watch report.</p>",
        filePath
      );
      fs.unlinkSync(filePath);
      await WatchService.deleteMany({ serviceStatus: "Delivered" });
      res.status(200).json({
        success: true,
        message:
          "Delivered watch report sent successfully and records cleared.",
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
