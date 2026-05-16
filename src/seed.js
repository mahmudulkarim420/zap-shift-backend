const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const dns = require("dns");
const User = require("./modules/users/user.model");
const Warehouse = require("./modules/infrastructure/warehouse.model");
const RiderProfile = require("./modules/riders/rider.model");
const Parcel = require("./modules/parcels/parcel.model");
const TrackingEvent = require("./modules/parcels/tracking.model");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Warehouse.deleteMany();
    await RiderProfile.deleteMany();
    await Parcel.deleteMany();
    await TrackingEvent.deleteMany();
    console.log("🔄 Existing data cleared...");

    const warehouses = await Warehouse.insertMany([
      {
        name: "Dhaka Central Hub",
        district: "Dhaka",
        address: "Tejgaon, Dhaka",
        coveredAreas: ["Mirpur", "Uttara", "Gulshan", "Dhanmondi"],
      },
      {
        name: "Chittagong GEC Hub",
        district: "Chittagong",
        address: "GEC Circle, CTG",
        coveredAreas: ["Agrabad", "Halishahar", "Nasirabad"],
      },
      {
        name: "Sylhet Zindabazar Hub",
        district: "Sylhet",
        address: "Zindabazar, Sylhet",
        coveredAreas: ["Ambarkhana", "Subidbazar"],
      },
    ]);
    console.log("🏢 Warehouses seeded successfully!");

    const adminUser = await User.create({
      clerkId: "user_admin123",
      name: "ZapShift Admin",
      email: "admin@zapshift.com",
      role: "admin",
    });
    const riderUser = await User.create({
      clerkId: "user_rider123",
      name: "Jamil Ahmed (Rider)",
      email: "jamil@zapshift.com",
      role: "rider",
    });
    const customerUser = await User.create({
      clerkId: "user_customer123",
      name: "Mahmudul Karim",
      email: "mahmudul@example.com",
      role: "user",
    });
    console.log("👤 Users (Admin, Rider, Customer) seeded successfully!");

    const riderProfile = await RiderProfile.create({
      userId: riderUser._id,
      age: 24,
      nid: "1998261234567",
      phone: "01711112233",
      preferredWarehouse: "Dhaka Central Hub",
      status: "approved",
      earnings: 450,
    });
    console.log("🚴 Rider profile activated!");

    const parcel1 = await Parcel.create({
      trackingId: "ZS-983201",
      sender: customerUser._id,
      receiver: {
        name: "Anisur Rahman",
        phone: "01999887766",
        address: "Banani Road 11",
        district: "Dhaka",
      },
      type: "Standard",
      weight: 1.5,
      deliveryCharge: 60,
      codAmount: 1500,
      status: "pending",
    });

    const parcel2 = await Parcel.create({
      trackingId: "ZS-104928",
      sender: customerUser._id,
      receiver: {
        name: "Sumaiya Akter",
        phone: "01555443322",
        address: "Halishahar Block-A",
        district: "Chittagong",
      },
      type: "Fragile",
      weight: 0.5,
      deliveryCharge: 150,
      codAmount: 0,
      status: "out_for_delivery",
      assignedRider: riderUser._id,
    });
    console.log("📦 Mock parcels created!");

    await TrackingEvent.insertMany([
      {
        parcelId: parcel1._id,
        status: "pending",
        location: "Sender Location",
        note: "Parcel booking request received.",
      },
      {
        parcelId: parcel2._id,
        status: "pending",
        location: "Sender Location",
        note: "Parcel booking request received.",
      },
      {
        parcelId: parcel2._id,
        status: "accepted",
        location: "Dhaka Central Hub",
        note: "Parcel sorted and accepted by Admin.",
      },
      {
        parcelId: parcel2._id,
        status: "out_for_delivery",
        location: "Chittagong GEC Hub",
        note: "Parcel assigned to rider Jamil Ahmed for final delivery.",
      },
    ]);
    console.log("📍 Tracking timelines generated!");

    console.log("🎉 All default collection data inserted successfully! Database is ready.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
