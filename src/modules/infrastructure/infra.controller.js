const Review = require("./warehouse.model");

const getCoverage = async (req, res, next) => {
  try {
    const hubs = [
      {
        id: 1,
        district: "Dhaka",
        zone: "Central Hub",
        areas: ["Mirpur", "Uttara", "Dhanmondi", "Gulshan"],
      },
      {
        id: 2,
        district: "Chittagong",
        zone: "Agrabad Hub",
        areas: ["Halishahar", "Nasirabad", "GEC"],
      },
      { id: 3, district: "Sylhet", zone: "Zindabazar Hub", areas: ["Ambarkhana", "Subidbazar"] },
    ];
    res.status(200).json({ success: true, hubs });
  } catch (error) {
    next(error);
  }
};

const calculateEstimate = async (req, res, next) => {
  try {
    const { weight, destination, type } = req.query;

    if (!weight || !destination) {
      return res
        .status(400)
        .json({ success: false, message: "Weight and destination are required" });
    }

    let baseCharge = destination.toLowerCase() === "dhaka" ? 60 : 120;
    let weightCost = Math.ceil(Number(weight)) * 20;
    let specialCharge =
      type?.toLowerCase() === "fragile" || type?.toLowerCase() === "liquid" ? 30 : 0;

    const totalEstimate = baseCharge + weightCost + specialCharge;

    res.status(200).json({
      success: true,
      breakdown: { baseCharge, weightCost, specialCharge },
      totalEstimate,
    });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { name, rating, comment } = req.body;
    const review = await Review.create({ name, rating, comment });
    res.status(201).json({ success: true, message: "Thank you for your review!", review });
  } catch (error) {
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(6);
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCoverage,
  calculateEstimate,
  createReview,
  getReviews,
};
