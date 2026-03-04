const express = require('express');
const mqtt = require('mqtt');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const { icons } = require('lucide');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import refactored modules
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const productRoutesModule = require('./routes/productRoutes');
const productRoutes = productRoutesModule.router;
const PRODUCTS = productRoutesModule.PRODUCTS;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST" ,"PUT","PATCH"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT1 || 8228;
const TEAM_ID = "vikings";
// const MQTT_BROKER = "mqtt://157.173.101.159:1883";
const MQTT_BROKER = "mqtt://broker.hivemq.com:1883";
const MONGO_URI = process.env.MONGODB_URI;

// MongoDB Connection
connectDB();

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

// Topics
const TOPIC_STATUS = `rfid/${TEAM_ID}/card/status`;
const TOPIC_BALANCE = `rfid/${TEAM_ID}/card/balance`;
const TOPIC_TOPUP = `rfid/${TEAM_ID}/card/topup`;
const TOPIC_PAYMENT = `rfid/${TEAM_ID}/card/payment`;
const TOPIC_REMOVED = `rfid/${TEAM_ID}/card/removed`;

app.use(authRoutes);
app.use(productRoutes);

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
        });
      }
    }
    
    let payAmount;
    let payDescription;
    if (productId) {
      const product = PRODUCTS.find(p => p.id === productId);
      if (!product) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
      payAmount = product.price;
      payDescription = `Purchase: ${product.name}`;
    } else {
      payAmount = amount;
      payDescription = description || 'Custom payment';
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
