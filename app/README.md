# ES Orders Mobile App

This is the React Native version of the ES Orders web application, built with Expo.

## Features

-  🔐 Authentication with Supabase
-  🎨 Dark/Light theme support
-  📱 Cross-platform (iOS, Android, Web)
-  🎯 NativeWind for styling (Tailwind CSS for React Native)
-  🧭 React Navigation for app navigation
-  📦 Order management
-  📊 Dashboard with analytics

## Setup

### Prerequisites

-  Node.js (v16 or later)
-  npm or yarn
-  Expo CLI: `npm install -g @expo/cli`
-  For iOS development: Xcode (macOS only)
-  For Android development: Android Studio

### Installation

1. Navigate to the app directory:

   ```bash
   cd app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment file and configure it:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:

   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Running the App

1. Start the development server:

   ```bash
   npm start
   ```

2. Run on specific platforms:
   ```bash
   npm run ios      # iOS simulator
   npm run android  # Android emulator
   npm run web      # Web browser
   ```

### Building for Production

1. For Android:

   ```bash
   npm run build:android
   ```

2. For iOS:
   ```bash
   npm run build:ios
   ```

## Project Structure

```
app/
├── src/
│   ├── api/           # API functions
│   ├── components/    # Reusable UI components
│   ├── lib/           # Utility libraries and contexts
│   ├── screens/       # App screens
│   └── assets/        # Images, fonts, etc.
├── App.js             # Main app component
├── app.json           # Expo configuration
├── babel.config.js    # Babel configuration
├── metro.config.js    # Metro bundler configuration
├── tailwind.config.js # Tailwind CSS configuration
└── global.css         # Global styles
```

## Key Technologies

-  **Expo**: React Native development platform
-  **React Navigation**: Navigation library
-  **NativeWind**: Tailwind CSS for React Native
-  **Supabase**: Backend as a Service
-  **AsyncStorage**: Local data storage
-  **React Native Safe Area Context**: Safe area handling

## Environment Variables

Create a `.env` file in the app directory with the following variables:

```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Development Notes

-  The app uses NativeWind for styling, which allows you to use Tailwind CSS classes in React Native
-  Authentication is handled through Supabase with session management
-  The theme system supports both light and dark modes
-  All screens are wrapped with SafeAreaView for proper device handling

## Troubleshooting

1. **Metro bundler issues**: Clear the cache with `npx expo start --clear`
2. **iOS build issues**: Ensure Xcode is properly installed and updated
3. **Android build issues**: Check that Android Studio and SDK are properly configured
4. **NativeWind not working**: Ensure babel.config.js includes the NativeWind plugin

## Contributing

1. Make sure to follow the existing code style
2. Test on both iOS and Android before submitting
3. Update documentation for any new features
4. Follow React Native best practices

## License

This project is part of the ES Orders suite.
