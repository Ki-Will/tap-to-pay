const express = require('express');
const mqtt = require('mqtt');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = 8208;
const TEAM_ID = "team_rdf";
const MQTT_BROKER = "mqtt://157.173.101.159:1883";
const MONGO_URI = process.env.MONGODB_URI;

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Card Schema
const cardSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  holderName: { type: String, required: true },
  balance: { type: Number, default: 0 },
  lastTopup: { type: Number, default: 0 },
  passcode: { type: String, default: null }, // 6-digit passcode (hashed)
  passcodeSet: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Card = mongoose.model('Card', cardSchema);

// Passcode helper functions
async function hashPasscode(passcode) {
  const saltRounds = 10;
  return await bcrypt.hash(passcode, saltRounds);
}

async function verifyPasscode(inputPasscode, hashedPasscode) {
  return await bcrypt.compare(inputPasscode, hashedPasscode);
}

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  uid: { type: String, required: true, index: true },
  holderName: { type: String, required: true },
  type: { type: String, enum: ['topup', 'debit'], default: 'topup' },
  amount: { type: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  description: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Product catalog with categories
const PRODUCTS = [
  // Food & Beverages
  { id: 'coffee', name: 'Coffee', price: 2.50, icon: '☕', category: 'food' },
  { id: 'sandwich', name: 'Sandwich', price: 5.00, icon: '🥪', category: 'food' },
  { id: 'water', name: 'Water Bottle', price: 1.00, icon: '💧', category: 'food' },
  { id: 'snack', name: 'Snack Pack', price: 3.00, icon: '🍿', category: 'food' },
  { id: 'juice', name: 'Fresh Juice', price: 3.50, icon: '🧃', category: 'food' },
  { id: 'salad', name: 'Salad Bowl', price: 6.00, icon: '🥗', category: 'food' },
  
  // Rwandan Local Foods
  { id: 'brochette', name: 'Brochette', price: 4.00, icon: '�串', category: 'rwandan' },
  { id: 'isombe', name: 'Isombe', price: 3.50, icon: '🥬', category: 'rwandan' },
  { id: 'ubugari', name: 'Ubugari', price: 2.00, icon: '🍚', category: 'rwandan' },
  { id: 'sambaza', name: 'Sambaza (Fried)', price: 3.00, icon: '🐟', category: 'rwandan' },
  { id: 'akabenzi', name: 'Akabenzi (Pork)', price: 5.50, icon: '🥓', category: 'rwandan' },
  { id: 'ikivuguto', name: 'Ikivuguto (Yogurt)', price: 1.50, icon: '🥛', category: 'rwandan' },
  { id: 'agatogo', name: 'Agatogo', price: 4.50, icon: '🍲', category: 'rwandan' },
  { id: 'urwagwa', name: 'Urwagwa (Banana Beer)', price: 2.50, icon: '🍺', category: 'rwandan' },
  
  // Snacks & Drinks
  { id: 'fanta', name: 'Fanta', price: 1.20, icon: '🥤', category: 'drinks' },
  { id: 'primus', name: 'Primus Beer', price: 2.00, icon: '🍺', category: 'drinks' },
  { id: 'mutzig', name: 'Mutzig Beer', price: 2.00, icon: '🍺', category: 'drinks' },
  { id: 'inyange-juice', name: 'Inyange Juice', price: 1.50, icon: '🧃', category: 'drinks' },
  { id: 'chips', name: 'Chips', price: 2.50, icon: '🍟', category: 'food' },
  
  // Domain Registration Services
  { id: 'domain-com', name: '.com Domain', price: 12.00, icon: '🌐', category: 'domains' },
  { id: 'domain-net', name: '.net Domain', price: 11.00, icon: '🌐', category: 'domains' },
  { id: 'domain-org', name: '.org Domain', price: 10.00, icon: '🌐', category: 'domains' },
  { id: 'domain-io', name: '.io Domain', price: 35.00, icon: '🌐', category: 'domains' },
  { id: 'domain-dev', name: '.dev Domain', price: 15.00, icon: '🌐', category: 'domains' },
  { id: 'domain-app', name: '.app Domain', price: 18.00, icon: '🌐', category: 'domains' },
  { id: 'domain-ai', name: '.ai Domain', price: 80.00, icon: '🤖', category: 'domains' },
  { id: 'domain-xyz', name: '.xyz Domain', price: 8.00, icon: '🌐', category: 'domains' },
  { id: 'domain-co', name: '.co Domain', price: 25.00, icon: '🌐', category: 'domains' },
  { id: 'domain-rw', name: '.rw Domain', price: 20.00, icon: '🇷🇼', category: 'domains' },
  
  // Digital Services
  { id: 'hosting-basic', name: 'Basic Hosting (1mo)', price: 5.00, icon: '☁️', category: 'services' },
  { id: 'hosting-pro', name: 'Pro Hosting (1mo)', price: 15.00, icon: '☁️', category: 'services' },
  { id: 'ssl-cert', name: 'SSL Certificate', price: 10.00, icon: '🔒', category: 'services' },
  { id: 'email-pro', name: 'Professional Email', price: 8.00, icon: '📧', category: 'services' }
];

// Topics
const TOPIC_STATUS = `rfid/${TEAM_ID}/card/status`;
const TOPIC_BALANCE = `rfid/${TEAM_ID}/card/balance`;
const TOPIC_TOPUP = `rfid/${TEAM_ID}/card/topup`;
const TOPIC_PAYMENT = `rfid/${TEAM_ID}/card/payment`;
const TOPIC_REMOVED = `rfid/${TEAM_ID}/card/removed`;

// MQTT Client Setup
const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker');
  mqttClient.subscribe(TOPIC_STATUS);
  mqttClient.subscribe(TOPIC_BALANCE);
  mqttClient.subscribe(TOPIC_PAYMENT);
  mqttClient.subscribe(TOPIC_REMOVED);
});

mqttClient.on('message', (topic, message) => {
  console.log(`Received message on ${topic}: ${message.toString()}`);
  try {
    const payload = JSON.parse(message.toString());

    if (topic === TOPIC_STATUS) {
      io.emit('card-status', payload);
    } else if (topic === TOPIC_BALANCE) {
      io.emit('card-balance', payload);
    } else if (topic === TOPIC_PAYMENT) {
      io.emit('payment-result', payload);
    } else if (topic === TOPIC_REMOVED) {
      io.emit('card-removed', payload);
    }
  } catch (err) {
    console.error('Failed to parse MQTT message:', err);
  }
});

// HTTP Endpoints
app.post('/topup', async (req, res) => {
  const { uid, amount, holderName, passcode } = req.body;

  if (!uid || amount === undefined) {
    return res.status(400).json({ error: 'UID and amount are required' });
  }

  try {
    // Find or create card
    let card = await Card.findOne({ uid });
    const balanceBefore = card ? card.balance : 0;

    if (!card) {
      if (!holderName) {
        return res.status(400).json({ error: 'Holder name is required for new cards' });
      }
      
      // For new cards, passcode is required
      if (!passcode || !/^\d{6}$/.test(passcode)) {
        return res.status(400).json({ error: 'A 6-digit passcode is required for new cards' });
      }
      
      // Hash the passcode
      const hashedPasscode = await hashPasscode(passcode);
      
      card = new Card({ 
        uid, 
        holderName, 
        balance: amount, 
        lastTopup: amount,
        passcode: hashedPasscode,
        passcodeSet: true
      });
    } else {
      // Cumulative topup: add to existing balance
      card.balance += amount;
      card.lastTopup = amount;
      card.updatedAt = Date.now();
    }

    await card.save();

    // Create transaction record
    const transaction = new Transaction({
      uid: card.uid,
      holderName: card.holderName,
      type: 'topup',
      amount: amount,
      balanceBefore: balanceBefore,
      balanceAfter: card.balance,
      description: `Top-up of $${amount.toFixed(2)}`
    });
    await transaction.save();

    // Publish to MQTT with updated balance
    const payload = JSON.stringify({ uid, amount: card.balance });
    mqttClient.publish(TOPIC_TOPUP, payload, (err) => {
      if (err) {
        console.error('Failed to publish topup:', err);
        return res.status(500).json({ error: 'Failed to publish topup command' });
      }
      console.log(`Published topup for ${uid} (${card.holderName}): ${card.balance}`);
    });

    res.json({
      success: true,
      message: 'Topup successful',
      card: {
        uid: card.uid,
        holderName: card.holderName,
        balance: card.balance,
        lastTopup: card.lastTopup
      },
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        balanceAfter: transaction.balanceAfter,
        timestamp: transaction.timestamp
      }
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Payment / Debit endpoint
app.post('/pay', async (req, res) => {
  const { uid, productId, amount, description, passcode } = req.body;

  if (!uid || (!productId && amount === undefined)) {
    return res.status(400).json({ error: 'UID and product or amount are required' });
  }

  try {
    // Find card first to check passcode requirement
    const card = await Card.findOne({ uid });
    if (!card) {
      return res.status(404).json({ error: 'Card not found. Please top up first.' });
    }
    
    // Verify passcode if set
    if (card.passcodeSet) {
      if (!passcode) {
        return res.status(401).json({ 
          error: 'Passcode required for this card',
          passcodeRequired: true
        });
      }
      
      const isValid = await verifyPasscode(passcode, card.passcode);
      if (!isValid) {
        return res.status(401).json({ 
          error: 'Incorrect passcode',
          passcodeRequired: true
        });
      }
    }
    
    // Resolve amount from product catalog or use direct amount
    let payAmount = amount;
    let payDescription = description || 'Payment';

    if (productId) {
      const product = PRODUCTS.find(p => p.id === productId);
      if (!product) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
      payAmount = product.price;
      payDescription = `Purchase: ${product.name}`;
    }

    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    // Check sufficient balance
    if (card.balance < payAmount) {
      return res.status(400).json({
        error: 'Insufficient balance',
        currentBalance: card.balance,
        required: payAmount,
        shortfall: payAmount - card.balance
      });
    }

    const balanceBefore = card.balance;

    // Deduct amount
    card.balance -= payAmount;
    card.updatedAt = Date.now();
    await card.save();

    // Create transaction record
    const transaction = new Transaction({
      uid: card.uid,
      holderName: card.holderName,
      type: 'debit',
      amount: payAmount,
      balanceBefore: balanceBefore,
      balanceAfter: card.balance,
      description: payDescription
    });
    await transaction.save();

    // Publish to MQTT so ESP8266 updates
    const payload = JSON.stringify({
      uid,
      amount: card.balance,
      deducted: payAmount,
      description: payDescription,
      status: 'success'
    });
    mqttClient.publish(TOPIC_PAYMENT, payload, (err) => {
      if (err) {
        console.error('Failed to publish payment:', err);
      }
      console.log(`Published payment for ${uid} (${card.holderName}): -$${payAmount.toFixed(2)}, balance: $${card.balance.toFixed(2)}`);
    });

    // Emit real-time update via WebSocket
    io.emit('payment-success', {
      uid: card.uid,
      holderName: card.holderName,
      amount: payAmount,
      balanceBefore,
      balanceAfter: card.balance,
      description: payDescription,
      timestamp: transaction.timestamp
    });

    res.json({
      success: true,
      message: 'Payment successful',
      card: {
        uid: card.uid,
        holderName: card.holderName,
        balance: card.balance
      },
      transaction: {
        id: transaction._id,
        type: 'debit',
        amount: payAmount,
        balanceBefore,
        balanceAfter: card.balance,
        description: payDescription,
        timestamp: transaction.timestamp
      }
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Products catalog endpoint
app.get('/products', (req, res) => {
  res.json(PRODUCTS);
});

// Set passcode for a card
app.post('/card/:uid/set-passcode', async (req, res) => {
  const { passcode } = req.body;
  
  if (!passcode || !/^\d{6}$/.test(passcode)) {
    return res.status(400).json({ error: 'Passcode must be exactly 6 digits' });
  }
  
  try {
    const card = await Card.findOne({ uid: req.params.uid });
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    if (card.passcodeSet) {
      return res.status(400).json({ error: 'Passcode already set. Use change-passcode endpoint to update.' });
    }
    
    card.passcode = await hashPasscode(passcode);
    card.passcodeSet = true;
    card.updatedAt = Date.now();
    await card.save();
    
    res.json({ 
      success: true, 
      message: 'Passcode set successfully',
      passcodeSet: true
    });
  } catch (err) {
    console.error('Set passcode error:', err);
    res.status(500).json({ error: 'Failed to set passcode' });
  }
});

// Change passcode (requires old passcode)
app.post('/card/:uid/change-passcode', async (req, res) => {
  const { oldPasscode, newPasscode } = req.body;
  
  if (!oldPasscode || !newPasscode) {
    return res.status(400).json({ error: 'Both old and new passcodes are required' });
  }
  
  if (!/^\d{6}$/.test(newPasscode)) {
    return res.status(400).json({ error: 'New passcode must be exactly 6 digits' });
  }
  
  try {
    const card = await Card.findOne({ uid: req.params.uid });
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    if (!card.passcodeSet) {
      return res.status(400).json({ error: 'No passcode set. Use set-passcode endpoint first.' });
    }
    
    const isValid = await verifyPasscode(oldPasscode, card.passcode);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect old passcode' });
    }
    
    card.passcode = await hashPasscode(newPasscode);
    card.updatedAt = Date.now();
    await card.save();
    
    res.json({ 
      success: true, 
      message: 'Passcode changed successfully'
    });
  } catch (err) {
    console.error('Change passcode error:', err);
    res.status(500).json({ error: 'Failed to change passcode' });
  }
});

// Verify passcode
app.post('/card/:uid/verify-passcode', async (req, res) => {
  const { passcode } = req.body;
  
  if (!passcode || !/^\d{6}$/.test(passcode)) {
    return res.status(400).json({ error: 'Passcode must be exactly 6 digits', valid: false });
  }
  
  try {
    const card = await Card.findOne({ uid: req.params.uid });
    if (!card) {
      return res.status(404).json({ error: 'Card not found', valid: false });
    }
    
    if (!card.passcodeSet) {
      return res.status(400).json({ error: 'No passcode set for this card', valid: false });
    }
    
    const isValid = await verifyPasscode(passcode, card.passcode);
    
    if (isValid) {
      res.json({ 
        success: true, 
        valid: true,
        message: 'Passcode verified'
      });
    } else {
      res.status(401).json({ 
        error: 'Incorrect passcode', 
        valid: false 
      });
    }
  } catch (err) {
    console.error('Verify passcode error:', err);
    res.status(500).json({ error: 'Failed to verify passcode', valid: false });
  }
});

// Get card details
app.get('/card/:uid', async (req, res) => {
  try {
    const card = await Card.findOne({ uid: req.params.uid });
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(card);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Get all cards
app.get('/cards', async (req, res) => {
  try {
    const cards = await Card.find().sort({ updatedAt: -1 });
    res.json(cards);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Get transaction history for a specific card
app.get('/transactions/:uid', async (req, res) => {
  try {
    const transactions = await Transaction.find({ uid: req.params.uid })
      .sort({ timestamp: -1 })
      .limit(50); // Limit to last 50 transactions
    res.json(transactions);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Get all transactions (optional - for admin view)
app.get('/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const transactions = await Transaction.find()
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(transactions);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Socket connectivity
io.on('connection', (socket) => {
  console.log('User connected to the dashboard');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`Access from: http://157.173.101.159:${PORT}`);
});
