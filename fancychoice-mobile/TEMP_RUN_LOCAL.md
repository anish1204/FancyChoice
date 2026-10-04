# TEMP — Run FancyChoice Mobile Locally / On Your Phone

> Delete/rename this file before production. It exists only to get you running fast.

## 0. What you need
- Backend running: `http://localhost:5000` + `/health` returns OK (you said MongoDB is live — good)
- Node 18+ (`node --version`)
- Phone + laptop on the **same Wi-Fi** (for physical device)
- Expo Go app installed on your phone (Play Store / App Store)

## 1. Install (one time, inside this folder)
```bash
cd fancychoice-mobile
npm install
```

## 2. Point the app at your backend
Open `src/config/constants.js` → set `API_URL`:

| Where you run the app | Set `API_URL` to |
|---|---|
| Android emulator | `http://10.0.2.2:5000/api` (already the default) |
| iOS simulator / web | `http://localhost:5000/api` |
| Physical phone (Expo Go) | `http://YOUR_LAPTOP_LAN_IP:5000/api` e.g. `http://192.168.1.5:5000/api` |

Find your LAN IP:
- Windows: `ipconfig` → IPv4 Address (e.g. 192.168.1.5)
- Mac/Linux: `ifconfig | grep inet`

Backend must listen on all interfaces (default Express does). Allow port 5000 in firewall if phone can't reach it.

## 3. Run it

### Option A — Physical phone (easiest)
```bash
npx expo start
```
- A QR code appears in the terminal.
- Open **Expo Go** on your phone → Scan QR → app loads.
- Same Wi-Fi required. If QR fails, use `npx expo start --tunnel`.

### Option B — Android emulator
```bash
npx expo start --android
```
(Android Studio + emulator must be installed. Uses `10.0.2.2` to reach laptop localhost.)

### Option C — iOS simulator (Mac only)
```bash
npx expo start --ios
```

### Option D — Web (quick sanity check, no phone needed)
```bash
npx expo start --web
```
Opens http://localhost:8081 in browser.

## 4. Seed demo accounts (backend folder, one time)
```bash
cd ../fancychoice-backend
node src/seed/seed.js
```
This creates plans + 2 demo logins (password login on the Login screen → "Use password instead"):
- Admin: `9999999999` / `admin123` → Dashboard, Orders (assign riders), Users (change roles)
- Delivery boy: `8888888888` / `delivery123` → Today (assigned orders), History, Ratings
- Customers: sign up in the app or use OTP login with any `98765432xx` number

## 5. Test the full flow in the app
### Customer (OTP or signup)
1. Login screen → enter `9876543210` → Send OTP
2. Backend console shows OTP (bypass mode) → enter it on OTP screen
   - Or Signup → create account with password → auto-login
3. Home → Plans → pick cycle → Continue → Checkout (order summary + slots + UPI/Card, test mode) → Pay → success screen → View my subscription
4. Subscription tab → Pause / Resume / Cancel
5. Tracking tab → Today + History → Show QR → Rate 5★
6. Profile tab → Add address → check Payments → Logout

### Delivery boy (`8888888888` / `delivery123`, password login)
1. Today tab → assigned orders → Start delivery → **📷 Scan customer QR** (camera opens, point at the QR on the customer's phone → auto-verifies) → Mark delivered
   - No camera (emulator)? Use the manual token field instead.
   - First scan asks for camera permission — allow it. On a standalone build the permission text is pre-configured.
2. History tab → past orders + ratings received
3. Ratings tab → average score + customer reviews
QR round-trip to test with 2 devices: customer login on one (Tracking → Show QR), rider login on the other (Today → Scan).

### Admin (`9999999999` / `admin123`, password login)
1. Dashboard tab → users, subs, today's deliveries, revenue
2. Orders tab → today's orders → Assign/change rider → Force delivered / Mark missed
3. Users tab → search, filter by role, promote any signup to deliveryBoy
NOTE: orders only exist after a customer subscribes, and rider assignment needs the delivery boy account from step 4.

## 6. If something fails
- `Unable to connect / Network Error` → wrong `API_URL`. Phone can't see `localhost` — use LAN IP. Check `http://LAN_IP:5000/health` in phone browser first.
- `Token / 401` → logout and login again (token expired or backend restarted with new JWT_SECRET).
- `Plan not found` → run backend seed: `node src/seed/seed.js` in `fancychoice-backend`.
- Metro cache weirdness → `npx expo start -c`.
- Dependency mismatch → `npx expo install --check` then `npx expo-doctor` if available.

## 7. Quick backend check (from this folder)
```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/plans
```
Both should return JSON. If not, start backend first:
```bash
cd ../fancychoice-backend
npm run dev
```
