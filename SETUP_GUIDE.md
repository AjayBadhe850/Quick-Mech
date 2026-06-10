# QuickMech - Running the Application

## 🚀 Quick Start

### Option 1: Run Both Frontend & Backend (Recommended)

**Terminal 1 - Start the Backend Server:**
```bash
cd /Users/Ajay badhe/Desktop/QuickMech
npm run server
```

Expected output:
```
✅ QuickMech Backend Server running on http://localhost:5000
📍 API Base URL: http://localhost:5000/api
```

**Terminal 2 - Start the React Frontend:**
```bash
cd /Users/Ajay badhe/Desktop/QuickMech
npm start
```

**Frontend Link:** `http://localhost:3000` (React development server)

✅ **API Communication:** Frontend automatically connects to backend at `http://localhost:5000/api`

---

## 📱 Testing OTP Flow

### Step 1: Enter Credentials
- Username: `John Doe` (any name)
- Mobile: `9876543210` (10 digits)

### Step 2: Click "Get OTP"
- Backend receives the request
- Generates 6-digit OTP
- **Displays OTP in console** (for development)
- Shows "OTP sent" message on screen

### Step 3: Check Console
- Open browser DevTools (F12)
- Look in Console tab
- Copy the OTP from message: `🔐 Dev Mode - Your OTP: XXXXXX`

### Step 4: Go to OTP Verification
- Click "Proceed to Verify"
- Go to the OTP Verification page
- Enter the 6-digit OTP
- Click "Verify"

### Step 5: Access Dashboard
- View mechanics
- Access referral program
- All features working!

---

## 🔄 OTP Features

✓ **Send OTP** - Sends to entered mobile number (logs to console)
✓ **5-minute Expiration** - OTP expires after 5 minutes
✓ **Resend OTP** - Request new OTP anytime
✓ **5 Attempts Limit** - Max 5 wrong attempts
✓ **Validation** - Validates 10-digit mobile numbers

---

## 📡 API Endpoints

### Send OTP
```
POST /api/send-otp
Body: { "mobileNumber": "9876543210", "username": "John" }
Response: { "success": true, "message": "OTP sent...", "devOtp": "123456" }
```

### Verify OTP
```
POST /api/verify-otp
Body: { "mobileNumber": "9876543210", "otp": "123456" }
Response: { "success": true, "username": "John" }
```

### Resend OTP
```
POST /api/resend-otp
Body: { "mobileNumber": "9876543210" }
Response: { "success": true, "devOtp": "654321" }
```

---

## 🔌 Production Setup

For production, replace the OTP logic in `server.js` with:

### Option 1: Twilio SMS
```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

await client.messages.create({
  body: `Your QuickMech OTP: ${otp}`,
  from: twilioPhoneNumber,
  to: phoneNumber
});
```

### Option 2: AWS SNS
```javascript
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

await sns.publish({
  Message: `Your QuickMech OTP: ${otp}`,
  PhoneNumber: phoneNumber
}).promise();
```

### Option 3: Firebase
```javascript
const admin = require('firebase-admin');

await admin.auth().sendSignInLinkToEmail(email, {
  url: `${appUrl}/verify?otp=${otp}`,
  handleCodeInApp: true
});
```

---

## 🌐 Frontend Build & Deployment

### Development Links
- **Frontend URL:** `http://localhost:3000` (React Dev Server)
- **Backend URL:** `http://localhost:5000` (Express API)
- **API Endpoints:** `http://localhost:5000/api`
- **GitHub Pages Demo:** `https://AjayBadhe850.github.io/Quick-Mech`

### Production Build
```bash
# Build the React frontend
npm run build

# This creates an optimized build/ folder
```

### Deployment Options

#### Option 1: Deploy Backend Only (Recommended)
Backend server automatically serves the React build folder:
```bash
# Build frontend
npm run build

# Start backend (serves both API + frontend)
npm run server

# Access at: http://localhost:5000
```

#### Option 2: Vercel (Frontend Only)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
vercel

# Update .env to point to backend URL
REACT_APP_API_URL=https://your-backend-api.com
```

#### Option 3: Heroku (Backend)
```bash
# Create Heroku app
heroku create your-app-name

# Deploy
git push heroku main

# Access at: https://your-app-name.herokuapp.com
```

---

## ⚙️ Configuration

Edit `.env` file:
```
REACT_APP_API_URL=http://localhost:5000
PORT=5000
```

---

## 📝 Full User Flow

```
Login Page
  ↓ (Enter username + 10-digit mobile)
  ↓ (Click "Get OTP")
Backend Server
  ↓ (Validates mobile number)
  ↓ (Generates 6-digit OTP)
  ↓ (Logs OTP to console for testing)
  ↓ (Stores OTP for 5 minutes)
Browser Console
  ↓ (Copy OTP from console message)
OTP Verification Page
  ↓ (Enter 6-digit OTP)
  ↓ (Click "Verify")
Dashboard
  ↓ (Browse mechanics, referral program, etc.)
```

---

## 🆘 Troubleshooting

### Error: "Unable to connect to server"
- Make sure backend is running (`npm run server`)
- Check if port 5000 is available
- Verify `.env` file has correct API URL

### Error: "Invalid mobile number"
- Mobile must be exactly 10 digits
- Cannot contain letters or special characters

### Error: "OTP has expired"
- OTP is valid for 5 minutes only
- Click "Resend OTP" to get a new one

### Can't see OTP in Console
- Open DevTools: Press F12
- Go to "Console" tab
- Look for message starting with "🔐 Dev Mode"

---

## 🎉 Features Implemented

✅ Frontend + Backend Integration
✅ Real OTP Generation (6 digits)
✅ Mobile Number Validation (10 digits)
✅ Expiration Handling (5 minutes)
✅ Resend Functionality
✅ Error Handling
✅ Loading States
✅ Success/Error Messages
✅ Full Login Flow
✅ Navigation Between Pages

---

**Happy Testing! 🚀**
