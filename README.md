# Gym CRM Mobile App

A complete React Native mobile application for Gym CRM management system built with Expo. This app connects to your existing Spring Boot backend.

## Features

- 🔐 **Authentication** - Login and Signup with JWT tokens
- 📊 **Dashboard** - View gym statistics and quick actions
- 👥 **Members** - View and manage gym members
- ✅ **Attendance** - Check-in/Check-out functionality
- 💳 **Memberships** - View membership plans
- 📈 **Progress Tracking** - Track fitness progress
- 💰 **Payments** - View payment history
- 🏋️ **Trainers** - View trainer information

## Tech Stack

- React Native (Expo)
- TypeScript
- React Navigation
- Axios
- React Native Paper (UI Components)
- Expo SecureStore (Token storage)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your phone or Android/iOS emulator

### Installation

```bash
cd gym-mobile
npm install
```

### Configure API URL

Edit `src/utils/constants.ts` and change the API base URL to match your backend:

```typescript
export const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8080/gym';
```

**Important:** Use your computer's IP address instead of `localhost` for mobile access. Find your IP with:
- Mac: `ipconfig getifaddr en0`
- Windows: `ipconfig` (look for IPv4 Address)

### Start Development Server

```bash
npx expo start
```

### Run on Android/iOS

- Scan the QR code with Expo Go app (iOS/Android)
- Press `a` for Android emulator
- Press `i` for iOS simulator

## Project Structure

```
gym-mobile/
├── App.tsx                    # Main app entry point
├── app.json                   # Expo configuration
├── babel.config.js            # Babel configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
├── src/
│   ├── api/
│   │   └── api.ts             # Axios instance with auth interceptors
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── navigation/
│   │   ├── AppNavigator.tsx   # Navigation setup
│   │   └── types.ts           # Navigation types
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── members/
│   │   │   ├── MembersScreen.tsx
│   │   │   └── MemberDetailScreen.tsx
│   │   ├── attendance/
│   │   │   └── AttendanceScreen.tsx
│   │   ├── memberships/
│   │   │   └── MembershipsScreen.tsx
│   │   ├── progress/
│   │   │   └── ProgressScreen.tsx
│   │   ├── payments/
│   │   │   └── PaymentsScreen.tsx
│   │   └── trainers/
│   │       └── TrainersScreen.tsx
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── utils/
│       └── constants.ts       # API configuration
└── README.md
```

## API Configuration

The app connects to your existing Spring Boot backend. Update `src/utils/constants.ts`:

```typescript
export const API_BASE_URL = 'http://your-backend-url.com/gym';
```

### Default Endpoints Used

- Auth: `/gym/auth/login`, `/gym/auth/register`
- Members: `/gym/members/all`, `/gym/members/{id}`
- Trainers: `/gym/trainers/all`
- Memberships: `/gym/membership-plans`
- Attendance: `/gym/attendance/checkin`, `/gym/attendance/checkout`
- Payments: `/gym/payments`
- Progress: `/gym/progress`
- Dashboard: `/gym/members/dashborad/summary`

## Running with Backend

1. **Start your Spring Boot backend** (port 8080)
2. **Start the mobile app**:
   ```bash
   cd gym-mobile
   npm install
   npx expo start
   ```
3. **Access on mobile**: Use your computer's IP address in the API URL

## Troubleshooting

### Connection Issues
- Ensure backend is running on the correct port
- Use computer's IP address, not localhost
- Check firewall settings

### TypeScript Errors
- Run `npm install` to install all dependencies
- TypeScript errors in editor will resolve after first build

## License

MIT

