# ES Orders - Full Stack Project

This repository contains both the web application and React Native mobile app for the ES Orders platform.

## Project Structure

```
es-orders/
├── main/              # Web application (React + Vite)
│   ├── src/
│   │   ├── api/       # API functions
│   │   ├── components/# React components
│   │   ├── lib/       # Utilities and contexts
│   │   └── assets/    # Static assets
│   ├── package.json
│   └── vite.config.js
├── app/               # React Native mobile app (Expo)
│   ├── src/
│   │   ├── api/       # API functions (adapted for RN)
│   │   ├── components/# React Native components
│   │   ├── lib/       # Utilities and contexts (adapted for RN)
│   │   └── screens/   # Mobile screens
│   ├── App.js
│   ├── app.json       # Expo configuration
│   └── package.json
└── README.md          # This file
```

## Getting Started

### Web Application (main/)

1. Navigate to the main directory:

   ```bash
   cd main
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Mobile Application (app/)

1. Navigate to the app directory:

   ```bash
   cd app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Expo development server:

   ```bash
   npm start
   ```

4. Use the Expo Go app on your phone to scan the QR code, or:
   -  Press `i` for iOS simulator
   -  Press `a` for Android emulator
   -  Press `w` for web browser

## Features

### Web Application

-  🌐 Responsive web interface
-  🎨 Dark/Light theme support
-  📊 Order management dashboard
-  🔐 Supabase authentication
-  ⚡ Vite for fast development
-  🎯 TailwindCSS for styling

### Mobile Application

-  📱 Cross-platform (iOS, Android, Web)
-  🎨 Dark/Light theme support (system aware)
-  🧭 React Navigation
-  🎯 NativeWind (Tailwind for React Native)
-  🔐 Supabase authentication with AsyncStorage
-  📦 Order management
-  🔄 Pull-to-refresh functionality

## Technology Stack

### Shared Technologies

-  **Frontend Framework**: React 19
-  **Backend**: Supabase (Database, Authentication, Real-time)
-  **Styling**: TailwindCSS / NativeWind
-  **State Management**: React Context API

### Web-Specific

-  **Build Tool**: Vite
-  **Routing**: React Router (if implemented)
-  **Icons**: Lucide React, React Icons

### Mobile-Specific

-  **Platform**: Expo (React Native)
-  **Navigation**: React Navigation
-  **Storage**: AsyncStorage
-  **Icons**: Expo Vector Icons

## Environment Variables

Both projects require environment variables for Supabase:

### Web (.env in main/)

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Mobile (.env in app/)

```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Schema

The application uses Supabase with the following main tables:

-  `users` - User authentication and profiles
-  `orders` - Order data with JSON structure
-  `products` - Product information
-  `product_groups` - Product categorization

## Development Workflow

1. **Web Development**: Work in the `main/` directory
2. **Mobile Development**: Work in the `app/` directory
3. **Shared Logic**: Keep API functions and utilities similar between both platforms
4. **Testing**: Test web changes in browser, mobile changes in Expo Go app

## Deployment

### Web Application

```bash
cd main
npm run build
# Deploy the dist/ folder to your hosting platform
```

### Mobile Application

```bash
cd app
# For development builds
expo build:android
expo build:ios

# For production (EAS Build)
eas build --platform android
eas build --platform ios
```

## Contributing

1. Work on features in separate branches
2. Ensure both web and mobile versions are updated when making shared changes
3. Test thoroughly on both platforms
4. Update documentation for new features

## Scripts Reference

### Web (main/)

-  `npm run dev` - Start development server
-  `npm run build` - Build for production
-  `npm run preview` - Preview production build

### Mobile (app/)

-  `npm start` - Start Expo development server
-  `npm run android` - Run on Android
-  `npm run ios` - Run on iOS
-  `npm run web` - Run on web

## Troubleshooting

### Web Issues

-  Clear browser cache
-  Delete `node_modules` and reinstall
-  Check Vite configuration

### Mobile Issues

-  Clear Expo cache: `expo start --clear`
-  Restart Metro bundler
-  Check Expo configuration in `app.json`
-  Ensure device/emulator is properly connected

## Support

For issues or questions:

1. Check the respective README files in `main/` and `app/` directories
2. Review the troubleshooting sections
3. Check Expo documentation for mobile-specific issues
4. Check Vite documentation for web-specific issues
