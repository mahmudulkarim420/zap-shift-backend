const Review = require('./review.model');

const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ status: 'active' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { name, email, image, comment, rating, designation } = req.body;
    const review = await Review.create({
      name,
      email,
      image,
      comment,
      rating,
      designation
    });
    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReviews,
  createReview
};
