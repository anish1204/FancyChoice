# FancyChoice App - Quick Start Guide

Get your FancyChoice roti delivery app running in minutes! 🚀

---

## ⚡ 5-Minute Setup

### Prerequisites
- ✅ Node.js v16+ installed
- ✅ MongoDB running locally or MongoDB Atlas account
- ✅ Expo CLI: `npm install -g expo-cli`
- ✅ iOS Simulator / Android Emulator installed

### Step 1: Clone and Setup Backend

```bash
# Navigate to backend directory
cd fancychoice-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Step 2: Configure `.env`

Edit `fancychoice-backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fancychoice

JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Optional - leave blank for now, set up later
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Step 3: Start Backend

```bash
# Start MongoDB (if not running)
mongosh  # or your MongoDB connection

# In another terminal, start server
npm run dev

# You should see:
# ✅ MongoDB connected successfully
# 🚀 Server running on http://localhost:5000
```

### Step 4: Setup Frontend

```bash
# In new terminal window, go to mobile directory
cd fancychoice-mobile

# Install dependencies
npm install

# Start Expo
expo start
```

### Step 5: Run on Device/Emulator

Press these in the Expo terminal:
- `a` - Android Emulator
- `i` - iOS Simulator
- `w` - Web browser

**That's it!** Your app should now be running. 🎉

---

## 🔌 Testing the App

### 1. Test OTP Login
1. Open the app on emulator
2. Enter any 10-digit phone number (e.g., `9876543210`)
3. Click "Send OTP"
4. Enter any OTP (backend accepts anything for development)
5. You should be logged in!

### 2. Test Subscription Plans
1. After login, go to "Plans" tab
2. Select any plan
3. Fill in address and delivery preferences
4. Proceed to payment (use Stripe test cards in production)

### 3. Test Delivery Tracking
1. Go to "Tracking" tab
2. See today's deliveries
3. View delivery history

---

## 📁 Project Structure Overview

```
fancychoice/
├── fancychoice-backend/          # Node.js + Express
│   ├── src/
│   │   ├── models/               # MongoDB schemas
│   │   ├── routes/               # API endpoints
│   │   ├── middleware/           # Auth, validation
│   │   └── server.js             # Main server
│   └── package.json
│
└── fancychoice-mobile/           # React Native
    ├── src/
    │   ├── screens/              # UI screens
    │   ├── services/             # API calls
    │   ├── store/                # State management
    │   └── config/               # Configuration
    └── package.json
```

---

## 🛠️ Key Technologies

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend | Node.js + Express | 18+ |
| Database | MongoDB | 5+ |
| Frontend | React Native | 0.72 |
| State Mgmt | Zustand | 4+ |
| Navigation | React Navigation | 6+ |
| Testing | Jest | 29+ |

---

## 📚 API Documentation (Quick Reference)

### Authentication

**Send OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"123456"}'
```

### Subscriptions

**Get Plans:**
```bash
curl http://localhost:5000/api/subscriptions/plans
```

**Create Subscription:**
```bash
curl -X POST http://localhost:5000/api/subscriptions/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan":"2-rotis",
    "deliveryTimes":["morning"],
    "paymentMethodId":"..."
  }'
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error: "Port 5000 already in use"**
```bash
# Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

**Error: "MongoDB connection failed"**
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# macOS: brew services start mongodb-community
# Docker: docker run -d -p 27017:27017 mongo:latest
```

### Frontend Won't Start

**Error: "Cannot find module"**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
expo start -c
```

**Error: "API connection failed"**
- Check your IP address: `ifconfig` (macOS) or `ipconfig` (Windows)
- Update `API_URL` in `src/config/constants.js` to your machine's IP
- Example: `http://192.168.1.100:5000/api`

### Emulator Issues

**Android Emulator not starting:**
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_4_API_30
```

**iOS Simulator permissions:**
```bash
# Reset iOS simulator
xcrun simctl erase all
```

---

## 🚀 Next Steps

1. **Setup Payments**
   - Create Stripe account
   - Add keys to `.env`
   - Test with Stripe test cards

2. **Setup SMS/Email**
   - Create Twilio account for OTP
   - Configure email service (Gmail App Password)

3. **Deploy**
   - Push backend to Heroku/Railway
   - Build and publish app via EAS

4. **Add Features**
   - Admin dashboard
   - Delivery boy app
   - Analytics

---

## 📖 Full Documentation

For detailed information, see `DEVELOPMENT_GUIDE.md`:
- Complete API documentation
- Database schema
- Deployment instructions
- Best practices

---

## 💡 Development Tips

1. **Use Postman/Insomnia** to test backend API
2. **React Native Inspector**: Shake device, tap "Debug"
3. **Console Logs**: `console.log()` shows in terminal
4. **Hot Reload**: App auto-reloads on file save
5. **Network Debugging**: Use Redux DevTools or MobX DevTools

---

## 🤝 Common Commands

```bash
# Backend
npm run dev          # Start with auto-reload
npm test            # Run tests
npm run seed        # Seed sample data

# Frontend
expo start          # Start dev server
expo start --android # Start on Android
expo start --ios    # Start on iOS
npm test            # Run tests
```

---

## ❓ FAQ

**Q: Can I use the app without backend?**
A: No, you need the backend running. It handles all business logic and data storage.

**Q: What if I don't have MongoDB?**
A: Use MongoDB Atlas (free tier available): https://www.mongodb.com/cloud/atlas

**Q: Can I skip Stripe/Twilio setup?**
A: For development, yes. Backend has mock implementations. For production, you need real keys.

**Q: How do I change the app colors?**
A: Edit `src/config/constants.js` → `COLORS` object

**Q: Can I build for production now?**
A: Yes! Run `eas build --platform all` (requires EAS account setup)

---

## 📞 Getting Help

1. Check the troubleshooting section above
2. Read `DEVELOPMENT_GUIDE.md`
3. Check backend console for errors
4. Enable debug mode in Expo

---

**Congratulations! You now have a working FancyChoice app! 🎉**

Start building and customize it for your needs!

---

*Last Updated: October 3, 2026*
