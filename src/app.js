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
const adminRoutes = require("./modules/admin/admin.routes");
const paymentRouter = require("./modules/payments/payment.routes");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const allowedOrigins = [
  "http://localhost:3000",
  "https://zap-shift-frontend.vercel.app",
  process.env.FRONTEND_URL?.replace(/\/$/, ""),
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/infra', infraRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRouter);

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
