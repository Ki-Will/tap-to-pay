# IoT RFID Tap-to-Pay System - Team RDF

A complete RFID-based payment system with real-time card management, secure passcode authentication, marketplace shopping, transaction tracking, and a modern Mastercard-styled dashboard interface.

---

## 🌐 **LIVE DEMO**

<div align="center">

#  **[VIEW LIVE APPLICATION ](http://157.173.101.159:9208)**

## **Frontend:** http://157.173.101.159:9208

## **Backend API:** http://157.173.101.159:8208

<br>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-success?style=for-the-badge&logo=google-chrome&logoColor=white&scale=2)](http://157.173.101.159:9208)
[![Backend API](https://img.shields.io/badge/Backend%20API-Running-blue?style=for-the-badge&logo=fastapi&logoColor=white&scale=2)](http://157.173.101.159:8208)
[![Status](https://img.shields.io/badge/Status-Deployed-brightgreen?style=for-the-badge&scale=2)](http://157.173.101.159:9208)

<br>

</div>

---

## 👁️ Features

### 🔐 Security & Authentication
- **Passcode Protection**: 6-digit PIN for all transactions
- **Bcrypt Hashing**: Military-grade password encryption
- **Auto-Submit**: Instant processing after entering passcode
- **Grace Period**: 60 seconds for new card registration, 15 seconds for payments

### 💳 Card Management
- **Real-time RFID Detection**: Instant card recognition via MQTT
- **Mastercard-Styled Cards**: Premium card design with authentic look
- **Cumulative Balance**: Persistent balance across sessions
- **Cardholder Names**: Personalized card management
- **Card Status Tracking**: Real-time presence detection

### 🛒 Marketplace & Shopping
- **Product Catalog**: Food, drinks, Rwandan cuisine, domain names, digital services
- **Category Filtering**: Easy browsing by category
- **Shopping Cart**: Add multiple items with quantity control
- **Real-time Pricing**: Dynamic total calculation
- **Secure Checkout**: Passcode-protected payments

### 📊 Transaction Management
- **Complete History**: All top-ups and purchases tracked
- **Separate Views**: Top-up history and purchase history
- **Transaction Details**: Amount, balance before/after, timestamps
- **MongoDB Persistence**: Reliable data storage
- **Real-time Updates**: Live transaction notifications

### 🎨 Modern Dashboard
- **Glass-morphism Design**: Beautiful, modern UI
- **Role-Based Access**: Admin and user modes
- **Live Statistics**: Real-time system metrics
- **System Monitoring**: MQTT, backend, database status
- **Responsive Layout**: Works on all devices

### 🔄 Real-time Features
- **WebSocket Integration**: Instant updates via Socket.IO
- **Card Presence Detection**: Know when card is on/off reader
- **Grace Period Countdown**: Visual timer for transactions
- **Live Balance Updates**: See changes immediately
- **Payment Notifications**: Instant success/error feedback

## Team Information

- **Team ID**: `team_rdf`
- **Live Application**: http://157.173.101.159:9208
- **VPS Server**: 157.173.101.159
- **Backend Port**: 8208
- **Frontend Port**: 9208
- **MQTT Broker**: 157.173.101.159:1883

## 🔐 Passcode Authentication System

### New Card Registration Flow
1. Scan new RFID card
2. System detects card is not in database
3. User enters card holder name
4. User creates 6-digit passcode
5. Passcode is hashed with bcrypt (10 salt rounds)
6. User has 60 seconds to complete registration
7. Card is saved with encrypted passcode

### Payment Flow
1. User adds items to shopping cart
2. User clicks "Checkout & Pay"
3. Passcode modal appears
4. User enters 6-digit passcode
5. Passcode auto-submits after 6th digit
6. Backend verifies passcode with bcrypt
7. Payment processes if passcode is correct
8. User has 15 seconds grace period after removing card

### Security Features
- **Bcrypt Hashing**: Industry-standard password encryption
- **Salt Rounds**: 10 rounds for optimal security/performance
- **No Plain Text**: Passcodes never stored in plain text
- **Server-Side Verification**: All validation on backend
- **Auto-Submit**: Seamless UX after entering 6 digits
- **Grace Periods**: 60s for registration, 15s for payments

### Passcode Management
- **Set Passcode**: For existing cards without passcode
- **Change Passcode**: Requires old passcode verification
- **Verify Passcode**: Check passcode validity
- **Visual Masking**: Passcode shown as dots (●●●●●●)

## 🛒 Product Catalog

### Food & Beverages
- Coffee ($2.50), Sandwich ($5.00), Water ($1.00)
- Snack Pack ($3.00), Fresh Juice ($3.50), Salad Bowl ($6.00)

### Rwandan Local Foods 🇷🇼
- Brochette ($4.00), Isombe ($3.50), Ubugari ($2.00)
- Sambaza Fried ($3.00), Akabenzi Pork ($5.50)
- Ikivuguto Yogurt ($1.50), Agatogo ($4.50)
- Urwagwa Banana Beer ($2.50)

### Drinks
- Fanta ($1.20), Primus Beer ($2.00), Mutzig Beer ($2.00)
- Inyange Juice ($1.50), Chips ($2.50)

### Domain Registration
- .com ($12), .net ($11), .org ($10), .io ($35)
- .dev ($15), .app ($18), .ai ($80), .xyz ($8)
- .co ($25), .rw ($20)

### Digital Services
- Basic Hosting 1mo ($5), Pro Hosting 1mo ($15)
- SSL Certificate ($10), Professional Email ($8)

## 🎯 User Flows

### First-Time User
1. Select "Normal User" role
2. Scan RFID card
3. Enter name and 6-digit passcode
4. Add funds to card
5. Browse marketplace
6. Add items to cart
7. Checkout with passcode
8. View transaction history

### Returning User
1. Select role (Admin/User)
2. Scan RFID card
3. Card details load automatically
4. Shop or top-up as needed
5. Passcode required for all payments

### Admin User
1. Select "Administrator" role
2. Access all features including settings
3. View system status and statistics
4. Monitor MQTT topics and connections
5. Manage cards and transactions

#### Manual Start:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

**Access locally:**

- Frontend: http://localhost:9208
- Backend: http://localhost:8208

### VPS Deployment

1. **Upload to VPS:**

```bash
scp -r tap-to-pay root@157.173.101.159:/root/
```


3. **Access online:**

- Frontend: http://157.173.101.159:9208
- Backend: http://157.173.101.159:8208

## 📡 MQTT Topics

- `rfid/team_rdf/card/status`: ESP8266 publishes card UID and balance when detected
- `rfid/team_rdf/card/topup`: Backend publishes top-up commands
- `rfid/team_rdf/card/balance`: ESP8266 publishes confirmation of balance update
- `rfid/team_rdf/card/payment`: Backend publishes payment confirmations
- `rfid/team_rdf/card/removed`: ESP8266 publishes when card is removed
- `rfid/team_rdf/device/status`: MQTT Last Will (online/offline)
- `rfid/team_rdf/device/health`: Periodic health metrics (IP, RSSI, Memory)

## ✨ Key Features & Improvements

### 🎨 UI/UX Enhancements
- **Mastercard-Styled Card**: Authentic design with red/orange circles, gold chip
- **Glass-morphism**: Modern, translucent design elements
- **Role-Based Interface**: Separate admin and user experiences
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Feedback**: Instant visual updates for all actions

### 🔒 Security Enhancements
- **Passcode Protection**: 6-digit PIN for all transactions
- **Bcrypt Encryption**: Military-grade password hashing
- **Auto-Submit**: Seamless authentication after 6 digits
- **Grace Periods**: Time-limited transaction windows
- **Card Presence Detection**: Know when card is on/off reader

### 🛒 Shopping Experience
- **40+ Products**: Diverse catalog including local Rwandan items
- **Category Filtering**: Easy navigation by product type
- **Shopping Cart**: Full cart management with quantity controls
- **Real-time Totals**: Dynamic price calculation
- **One-Click Checkout**: Streamlined payment process

### 📊 Transaction Management
- **Complete History**: All transactions logged and viewable
- **Separate Views**: Top-ups and purchases in dedicated sections
- **Detailed Records**: Amount, balance changes, timestamps
- **Real-time Updates**: Live transaction notifications
- **MongoDB Persistence**: Reliable, scalable storage

### 🔄 Real-time Features
- **WebSocket Integration**: Instant bidirectional communication
- **Live Card Detection**: Immediate response to card scans
- **Balance Updates**: Real-time balance synchronization
- **Payment Notifications**: Instant success/error feedback
- **System Monitoring**: Live status of all components

## 🔌 HTTP API Endpoints

### Cards

- `GET /cards` - Get all cards
- `GET /card/:uid` - Get specific card details
- `POST /topup` - Top up a card (requires `uid`, `amount`, `holderName` for new cards, `passcode` for new cards)

### Passcode Management

- `POST /card/:uid/set-passcode` - Set passcode for existing card (requires `passcode`)
- `POST /card/:uid/change-passcode` - Change passcode (requires `oldPasscode`, `newPasscode`)
- `POST /card/:uid/verify-passcode` - Verify passcode (requires `passcode`)

### Payments

- `POST /pay` - Process payment (requires `uid`, `amount`, `description`, `passcode` if card has passcode set)
- `GET /products` - Get product catalog

### Transactions

- `GET /transactions` - Get all transactions (optional `?limit=100`)
- `GET /transactions/:uid` - Get transaction history for specific card

### WebSocket Events

- `card-status` - Emitted when card is detected
- `card-balance` - Emitted when balance is updated
- `card-removed` - Emitted when card is removed from reader
- `payment-success` - Emitted when payment is successful

## 🛠️ Hardware Setup (ESP8266 + RC522)

| RC522 Pin | ESP8266 Pin (NodeMCU) | Function  |
| --------- | --------------------- | --------- |
| 3.3V      | 3V3                   | Power     |
| RST       | D3 (GPIO0)            | Reset     |
| GND       | GND                   | Ground    |
| MISO      | D6 (GPI<br />O12)     | SPI MISO  |
| MOSI      | D7 (GPIO13)           | SPI MOSI  |
| SCK       | D5 (GPIO14)           | SPI Clock |
| SDA (SS)  | D4 (GPIO2)            | SPI SS    |

### Firmware Setup

1. Open `/firmware/iot_rfid_project.ino` in Arduino IDE
2. Update WiFi credentials (`ssid` and `password`)
3. Install required libraries:
   - MFRC522
   - PubSubClient
   - ArduinoJson
4. Upload to ESP8266

## 🎨 Dashboard Features

### Role Selection
- **Admin Mode**: Full access to all features including settings
- **User Mode**: Access to top-up, marketplace, and transaction history

### Sidebar

- Navigation menu (Top Up, Marketplace, Transactions, Settings)
- Real-time system status monitoring
  - MQTT Broker connection
  - Backend server status
  - Database connection
  - WebSocket status
- Team info and uptime counter
- Support contact information

### Main Content

#### Top Up Card Section
- **Mastercard-Styled Card Display**: Premium card design with:
  - Authentic Mastercard red/orange overlapping circles
  - Deep purple-blue gradient background
  - Realistic gold EMV chip
  - Card holder name and balance
  - Passcode status indicator
- **New Card Registration**:
  - Name input field
  - 6-digit passcode setup (60-second grace period)
  - Automatic passcode hashing with bcrypt
- **Top-Up Form**:
  - Quick amount buttons ($5, $10, $20, $50)
  - Custom amount input
  - Real-time balance updates

#### Marketplace Section
- **Product Categories**:
  - All Products
  - Food & Beverages
  - Rwandan Local Foods (Brochette, Isombe, Ubugari, etc.)
  - Drinks (Primus, Mutzig, Inyange Juice)
  - Domain Names (.com, .io, .rw, .ai, etc.)
  - Digital Services (Hosting, SSL, Email)
- **Shopping Cart**:
  - Add/remove items
  - Quantity controls
  - Real-time total calculation
  - Cart badge with item count
- **Secure Checkout**:
  - Passcode modal for authentication
  - Auto-submit after 6 digits
  - Grace period countdown (15 seconds)
  - Instant payment processing

#### Transaction History Section
- **Separate Views**:
  - Top-Up History with green indicators
  - Purchase History with red indicators
- **Transaction Details**:
  - Date and time
  - Card holder name
  - Amount (+ for top-ups, - for purchases)
  - Balance after transaction
  - Description
- **Real-time Updates**: Live transaction notifications

#### Settings Section (Admin Only)
- **System Status Dashboard**:
  - MQTT Broker status
  - Backend server status
  - MongoDB database status
  - WebSocket connection status
- **Overview Statistics**:
  - Total registered cards
  - Total transactions
  - Top-up volume
  - Purchase volume
  - Today's transactions
  - Net card balance
- **System Information**:
  - Application version
  - Team ID
  - Backend URL
  - MQTT broker address
  - Database type
  - WebSocket version
- **MQTT Topic Configuration**: All active topics displayed

## 📊 Database Schema

### Card Collection

```javascript
{
  uid: String (unique, required),
  holderName: String (required),
  balance: Number (default: 0),
  lastTopup: Number (default: 0),
  passcode: String (bcrypt hashed, default: null),
  passcodeSet: Boolean (default: false),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### Transaction Collection

```javascript
{
  uid: String (required, indexed),
  holderName: String (required),
  type: 'topup' | 'debit' (required),
  amount: Number (required),
  balanceBefore: Number (required),
  balanceAfter: Number (required),
  description: String,
  timestamp: Date (default: Date.now)
}
```

### Product Catalog (In-Memory)

```javascript
{
  id: String (unique),
  name: String,
  price: Number,
  icon: String (emoji),
  category: 'food' | 'rwandan' | 'drinks' | 'domains' | 'services'
}
```

## 🔧 Configuration

### Backend (.env)

```env
MONGODB_URI=your_mongodb_connection_string
PORT=8208
```

### Auto-Configuration

The frontend automatically detects the environment:

- **Local**: Uses `localhost:8208`
- **Production**: Uses `157.173.101.159:8208`

No manual configuration needed!

## 🛠️ Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **Socket.IO**: Real-time bidirectional communication
- **Mongoose**: MongoDB object modeling
- **MQTT**: IoT messaging protocol
- **Bcrypt**: Password hashing and encryption
- **Crypto**: Additional security utilities

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with glass-morphism
- **JavaScript (ES6+)**: Interactive functionality
- **Socket.IO Client**: Real-time updates
- **Responsive Design**: Mobile-friendly interface

### Database
- **MongoDB Atlas**: Cloud-hosted NoSQL database
- **Indexed Collections**: Optimized queries
- **Transaction Logging**: Complete audit trail

### Hardware
- **ESP8266**: WiFi-enabled microcontroller
- **MFRC522**: RFID reader module
- **RFID Cards**: 13.56MHz contactless cards

### DevOps
- **PM2**: Process manager for production
- **Git**: Version control
- **VPS Deployment**: Linux server hosting
- **MQTT Broker**: Mosquitto on port 1883

## 📝 PM2 Commands (Production)

```bash
pm2 status                          # View all processes
pm2 logs tap-to-pay-backend        # View backend logs
pm2 logs tap-to-pay-frontend       # View frontend logs
pm2 restart tap-to-pay-backend     # Restart backend
pm2 restart tap-to-pay-frontend    # Restart frontend
pm2 monit                          # Monitor resources
```

## 🐛 Troubleshooting

### Backend Issues

- Check MongoDB connection in `.env`
- Verify port 8208 is available: `lsof -i :8208`
- Check logs: `pm2 logs tap-to-pay-backend`

### Frontend Issues

- Verify backend is running
- Check browser console for errors
- Test backend: `curl http://localhost:8208/cards`

### MQTT Issues

- Verify MQTT broker is running on port 1883
- Check Arduino serial monitor for connection status
- Test MQTT: `telnet 157.173.101.159 1883`

## 📦 Project Structure

```
tap-to-pay/
├── backend/
│   ├── server.js              # Backend API server with passcode auth
│   ├── package.json           # Dependencies (bcrypt, mqtt, mongoose, etc.)
│   └── .env                   # MongoDB connection string
├── frontend/
│   ├── index.html             # Dashboard UI with role selection
│   ├── app.js                 # Frontend logic with passcode handling
│   ├── style.css              # Mastercard-styled design
│   ├── config.js              # Auto environment detection
│   ├── server.js              # Frontend server
│   └── package.json           # Frontend dependencies
├── firmware/
│   └── rfid_topup_arduino.ino # ESP8266 code with card presence detection
├── docs/
│   ├── PASSCODE_SYSTEM_READY.md          # Passcode implementation guide
│   ├── GRACE_PERIOD_UPDATE.md            # Grace period documentation
│   ├── AUTO_SUBMIT_PASSCODE.md           # Auto-submit feature
│   ├── IMPROVED_MASTERCARD_DESIGN.md     # Card styling guide
│   └── IMPLEMENTATION_COMPLETE.md        # Complete implementation docs
├── DEPLOYMENT.md              # Detailed deployment guide
├── deploy.sh                  # VPS deployment script
├── start-local.sh             # Local startup (Linux/Mac)
├── start-local.bat            # Local startup (Windows)
└── README.md                  # This file
```

## 🔐 Security Notes

### Password Security
- **Bcrypt Hashing**: All passcodes hashed with 10 salt rounds
- **No Plain Text**: Passcodes never stored or transmitted in plain text
- **Server-Side Validation**: All authentication on backend
- **Secure Comparison**: Timing-safe password comparison

### Network Security
- MongoDB credentials stored in `.env` (gitignored)
- CORS enabled for development (configure for production)
- Use HTTPS in production (add reverse proxy like Nginx)
- Firewall configured for ports 9208, 8208, 1883

### Data Protection
- Transaction logging for audit trail
- Indexed database queries for performance
- Real-time card presence detection
- Grace period timeouts for security

### Best Practices
- Change default MongoDB credentials
- Use strong WiFi passwords for ESP8266
- Regularly update dependencies
- Monitor system logs for suspicious activity
- Implement rate limiting for API endpoints (recommended)

## 📄 License

MIT
