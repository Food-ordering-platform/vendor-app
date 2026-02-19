# 🏪 ChowEazy Vendor App

![Expo](https://img.shields.io/badge/Expo-54.0-black?logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.81-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![React Query](https://img.shields.io/badge/TanStack_Query-5.90-FF4154?logo=react-query)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?logo=socket.io)

The official **ChowEazy Vendor App** is a powerful cross-platform application (iOS and Android) built to help restaurant owners and chefs manage their digital storefronts. Built with **React Native** and **Expo**, it provides real-time order management, menu customization, and financial tracking.

---

## ✨ Key Features

- **🔴 Real-Time Order Management:** Implemeneted polling to receive instant order pings and update prep statuses live.
- **🍽️ Menu & Storefront Customization:** Seamless integration with `expo-image-picker` allows vendors to upload high-quality dish and restaurant photos directly from their gallery or camera.
- **📍 Location Configuration:** Utilizes `react-native-google-places-autocomplete` and `react-native-maps` for accurate restaurant address setup and geocoding.
- **🔔 Instant Alerts:** Employs `expo-notifications` and `sonner-native` (in-app toasts) to ensure vendors never miss a new order request.
- **🔒 Secure Operations:** Uses `expo-secure-store` to keep session tokens safely encrypted on-device.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native & Expo (v54) |
| Navigation | Expo Router (`expo-router` v6) & React Navigation |
| Server State | TanStack React Query & Axios |
| Mapping | React Native Maps |
| Real-time | Socket.io Client |
| Validation | Zod |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Detail |
|---|---|
| Node.js | v20+ |
| Expo CLI | Latest (`npm install -g expo-cli`) |
| API Keys | Google Maps & Google Places API Keys |

---

### 1. Clone & Install

```bash
git clone https://github.com/your-org/vendor-app.git
cd vendor-app
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=http://your-local-ip:4000/api
EXPO_PUBLIC_SOCKET_URL=http://your-local-ip:4000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_places_key
```

> ⚠️ **Note:** For local development on physical devices, use your machine's local IP address instead of `localhost`.

### 3. Start the Development Server

```bash
npx expo start
```

### 4. Run on Your Preferred Platform

| Platform | Action |
|---|---|
| Physical Device | Scan the QR code with the **Expo Go** app |
| iOS Simulator | Press `i` in the terminal |
| Android Emulator | Press `a` in the terminal |
| Web Browser | Press `w` in the terminal |

---

## 📦 Build & Deployment

This project is configured for **EAS (Expo Application Services)**.

To build the `APK`/`AAB` for Android or `IPA` for iOS:

```bash
eas build --platform all
```

To export a production web build:

```bash
npx expo export --platform web
```

---

<div align="center">
  Built with ❤️ for the <strong>ChowEazy</strong> Ecosystem
</div>
