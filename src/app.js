const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");

const router = require("./modules/auth/auth.routes");
const parcelRouter = require("./modules/parcels/parcel.routes");
const riderRoutes = require("./modules/riders/rider.routes");
const userRoutes = require("./modules/users/user.routes");
const infraRoutes = require("./modules/infrastructure/infra.routes");
const reviewRoutes = require("./modules/reviews/review.routes");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

app.use(cors());
app.use(express.json());

// Main Root Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ZapShift Backend Server is running smoothly!",
    timestamp: new Date(),
  });
});

// Route mounting
app.use("/api/auth", router);
app.use("/api/parcels", parcelRouter);
app.use("/api/riders", riderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/infra', infraRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling middleware (MUST be at the bottom)
app.use((err, req, res, next) => {
  console.error("BACKEND_ERROR:", err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
});

module.exports = app;
