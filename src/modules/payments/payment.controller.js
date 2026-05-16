const Payment = require("./payment.model");
const Parcel = require("../parcels/parcel.model");
const TrackingEvent = require("../parcels/tracking.model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const SSLCommerzPayment = require("sslcommerz-lts");

const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required." });
    }

    // Amount must be in cents for Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "bdt",
      payment_method_types: ["card"],
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { parcelId, amount, transactionId } = req.body;
    const userId = req.user._id;

    if (!parcelId || !amount || !transactionId) {
      return res.status(400).json({ success: false, message: "Parcel ID, amount, and transaction ID are required." });
    }

    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }
    
    const payment = await Payment.create({
      parcelId,
      userId,
      amount,
      transactionId,
      paymentMethod: "Stripe Card",
      paymentStatus: "completed"
    });

    // Update Parcel Status
    parcel.status = "paid";
    await parcel.save();

    // Log Tracking Event
    await TrackingEvent.create({
      parcelId: parcel._id,
      status: "paid",
      location: parcel.currentWarehouse || "Billing Center",
      note: `Stripe Payment confirmed. Transaction ID: ${transactionId}`,
    });

    res.status(200).json({
      success: true,
      message: "Payment verified and parcel updated to 'paid'.",
      data: { payment, parcel }
    });
  } catch (error) {
    next(error);
  }
};

const initSSLPayment = async (req, res, next) => {
  try {
    const { parcelId, amount } = req.body;
    const user = req.user;

    if (!parcelId || !amount) {
      return res.status(400).json({ success: false, message: "Parcel ID and amount are required." });
    }

    const tran_id = 'TXN-' + Date.now();
    const data = {
        total_amount: amount,
        currency: 'BDT',
        tran_id: tran_id,
        success_url: `http://localhost:5000/api/payments/ssl-success?parcelId=${parcelId}`,
        fail_url: `http://localhost:5000/api/payments/ssl-fail`,
        cancel_url: `http://localhost:5000/api/payments/ssl-cancel`,
        ipn_url: `http://localhost:5000/api/payments/ssl-ipn`,
        shipping_method: 'Courier',
        product_name: 'Parcel Delivery',
        product_category: 'Logistics',
        product_profile: 'general',
        cus_name: user.name,
        cus_email: user.email,
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_country: 'Bangladesh',
        cus_phone: user.phone || '01700000000',
        ship_name: user.name,
        ship_add1: 'Dhaka',
        ship_city: 'Dhaka',
        ship_country: 'Bangladesh',
        ship_postcode: 1000,
    };

    const sslcz = new SSLCommerzPayment(process.env.STORE_ID, process.env.STORE_PASSWORD, process.env.IS_LIVE === 'true');
    sslcz.init(data).then(apiResponse => {
        let GatewayPageURL = apiResponse.GatewayPageURL;
        res.status(200).json({ success: true, url: GatewayPageURL });
    });
  } catch (error) {
    next(error);
  }
};

const sslSuccess = async (req, res, next) => {
  console.log("SSL_SUCCESS_PAYLOAD:", req.body, "QUERY:", req.query);
  
  try {
    const { parcelId } = req.query;
    const { tran_id, amount, cus_name, card_issuer } = req.body;

    if (!parcelId) {
      console.error("SSL_SUCCESS_ERROR: Missing parcelId in query");
      return res.redirect('http://localhost:3000/dashboard/my-orders?payment=failed');
    }

    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
      console.error(`SSL_SUCCESS_ERROR: Parcel not found for ID: ${parcelId}`);
      return res.redirect('http://localhost:3000/dashboard/my-orders?payment=failed');
    }

    // Create Payment Record
    await Payment.create({
      parcelId: parcelId,
      userId: parcel.sender,
      amount: amount,
      transactionId: tran_id,
      paymentMethod: `SSLCommerz (${card_issuer || 'Local Card'})`,
      paymentStatus: "completed"
    });

    // Update Parcel Status
    parcel.status = "paid";
    await parcel.save();

    // Log Tracking Event
    await TrackingEvent.create({
      parcelId: parcel._id,
      status: "paid",
      location: parcel.currentWarehouse || "Billing Center",
      note: `SSLCommerz Payment confirmed. Transaction ID: ${tran_id}`,
    });

    console.log(`✅ SSLCommerz Payment Success for Parcel: ${parcelId}`);
    return res.redirect('http://localhost:3000/dashboard/my-orders?payment=success');
  } catch (error) {
    console.error("SSL_CALLBACK_ERROR:", error);
    return res.redirect('http://localhost:3000/dashboard/my-orders?payment=failed');
  }
};

const sslFail = (req, res) => {
  res.redirect('http://localhost:3000/dashboard/my-orders?payment=failed');
};

const sslCancel = (req, res) => {
  res.redirect('http://localhost:3000/dashboard/my-orders?payment=cancelled');
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  initSSLPayment,
  sslSuccess,
  sslFail,
  sslCancel
};
