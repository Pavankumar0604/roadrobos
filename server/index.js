const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Endpoint 1: Create Order
app.post('/api/order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'Amount and currency are required' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (e.g., paise), ensuring it's an integer
      currency,
      receipt: receipt || `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    // Attempt to extract a meaningful error message from the Razorpay error object
    const errorMessage = error.error && error.error.description ? error.error.description : 'Failed to create order due to server issue.';
    res.status(500).json({ error: errorMessage, details: error });
  }
});

// Endpoint 2: Verify Payment
app.post('/api/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required fields for verification' });
    }

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest === razorpay_signature) {
      // Payment is successful
      res.json({ status: 'success', message: 'Payment verified successfully' });
    } else {
      // Payment verification failed
      res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).send('Server Error');
  }
});

// Generate Application Number - Format: RR'S0054, RR'S0055, etc.
let appNumberCounter = 54; // Start from 0054

app.get('/api/generate-application-number', (req, res) => {
  const paddedNumber = String(appNumberCounter++).padStart(4, '0');
  const appNumber = `RR'S${paddedNumber}`;
  res.json({ applicationNumber: appNumber });
});

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});