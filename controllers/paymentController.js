import Stripe from "stripe";
const stripe = Stripe(
  "sk_test_51QWIkaBBg8UnRcHybzdQ3WnonFAUkN5iAqnI3gqAobKlKihuBCu3VNBSNhvTLkuq0STGS4IUbALRcxbIfSMzS9dS00zFEgn96x"
);
import Payment from "../models/paymentModel.js";

export const createPayment = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const existingPayment = await Payment.findOne({
      userId,
      amount,
      status: "pending",
    });

    if (existingPayment) {
      return res.status(400).json({
        error: "A payment for this user and amount is already in progress.",
        clientSecret: existingPayment.paymentIntentId,
        orderId: existingPayment._id,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      metadata: { userId },
    });

    const order = new Payment({
      userId,
      amount,
      paymentIntentId: paymentIntent.id,
      status: "pending",
    });

    await order.save();
    res.status(201).json({
      message: "Order created successfully",
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handlePaymentWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  console.log("sig", sig, "req", req.body, "typeee", typeof req.body);
  try {
    if (typeof req.body === "string" || Buffer.isBuffer(req.body)) {
      event = stripe.webhooks.constructEvent(
        req.body, 
        sig, 
        "whsec_tdpRJkiDUzG0A6ktfKpmtyT6Fd4lMcTe" 
      );
    } else {
      console.log("notraw");
      return res.status(400).json({ error: "Webhook payload was not raw" });
    }
  } catch (err) {
    console.log("=err", err);

    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log("event.tu", event.type);
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log("paymentIntent", paymentIntent);
    try {
      await Payment.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { status: "success" },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  }

  res.status(200).json({ received: true });
};
