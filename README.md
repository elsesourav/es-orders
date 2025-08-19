# ES Orders 📦

A modern, voice-enabled order management system built with React and Vite. Features advanced voice control, multi-language support (English/Bengali), and a sleek dark/light mode interface.

![ES Orders](./src/assets/icon.png)

## ✨ Features

### 🎯 Core Functionality
- **Order Management**: Browse and manage orders with detailed product information
- **User Authentication**: Secure login/signup system with user profiles
- **Real-time Search**: Fast order search and filtering capabilities
- **Responsive Design**: Mobile-first approach with modern UI components

### 🎤 Voice Control
- **Voice Recognition**: Advanced speech recognition using Vosk
- **Voice Commands**: Navigate through orders using natural voice commands
- **Text-to-Speech**: Audio feedback for better accessibility
- **Customizable Settings**: Toggle voice features on/off

### 🌐 Internationalization
- **Multi-language Support**: English and Bengali language options
- **Dynamic Translation**: Real-time language switching
- **Localized Content**: Full UI translation support

### 🎨 Modern UI
- **Dark/Light Mode**: Seamless theme switching
- **Modern Components**: Clean, accessible design components
- **Floating Modals**: Beautiful authentication and dialog modals
- **Smooth Animations**: Enhanced user experience with CSS animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/elsesourav/es-orders.git
   cd es-orders
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.sample .env
   # Edit .env file with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### Voice & Audio
- **Vosk** - Open-source speech recognition
- **Web Speech API** - Text-to-speech functionality
- **Audio Processing** - Real-time voice command handling

### State Management
- **React Context** - Global state management
- **Local Storage** - Persistent user preferences
- **Custom Hooks** - Reusable stateful logic

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Vite PWA** - Progressive web app features

## 📁 Project Structure

```
es-orders/
├── src/
│   ├── api/              # API integration layer
│   ├── assets/           # Static assets (images, models)
│   ├── components/       # React components
│   │   ├── inputs/       # Form input components
│   │   ├── login/        # Authentication components
│   │   └── orders/       # Order-related components
│   ├── lib/              # Utility libraries and contexts
│   └── index.jsx         # Application entry point
├── models/               # Vosk speech recognition models
├── public/               # Public static files
├── .env.sample           # Environment variables template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.js        # Vite configuration
└── README.md            # Project documentation
```

## 🎛️ Configuration

### Environment Variables
Create a `.env` file based on `.env.sample`:

```env
# API Configuration
VITE_API_URL=your_api_url_here
VITE_APP_TITLE=ES Orders

# Feature Flags
VITE_ENABLE_VOICE=true
VITE_ENABLE_ANALYTICS=false
```

### Voice Recognition Setup
1. Download Vosk models (included in `/models` directory)
2. Ensure microphone permissions are granted
3. Configure voice settings in the Settings page

## 🔧 Customization

### Adding New Languages
1. Update `src/lib/translations.json`
2. Add language option in `useLanguage` hook
3. Update language selector component

### Theming
- Modify `tailwind.config.js` for color schemes
- Update CSS custom properties for dark/light modes
- Customize component styles in respective files

### Voice Commands
- Edit `src/lib/vosk.js` for new command patterns
- Update recognition logic in `VoiceControl` component
- Add new TTS responses for feedback

## 🎯 Usage

### Basic Navigation
- Use the bottom navigation to switch between pages
- Toggle dark/light mode from the settings page
- Change language preference in settings

### Voice Control
1. Enable voice features in Settings
2. Click the microphone button to start listening
3. Use natural commands like:
   - "Next order"
   - "Previous order"
   - "Go to settings"
   - "Select order 5"

### Order Management
- Browse orders with pagination
- View detailed order information
- Search orders by various criteria
- Export order data (if implemented)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📋 Requirements

### System Requirements
- Modern web browser with ES6+ support
- Microphone access for voice features
- Internet connection for initial setup

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🐛 Troubleshooting

### Common Issues

**Voice recognition not working:**
- Check microphone permissions
- Ensure Vosk models are loaded
- Verify browser compatibility

**Build errors:**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify environment variables

**Styling issues:**
- Rebuild Tailwind CSS
- Check for conflicting CSS
- Verify dark/light mode configuration

## 📚 API Documentation

### Authentication
```javascript
// Sign in
const result = await signIn(username, password);

// Sign up
const result = await signUp({name, username, password});

// Logout
logout();
```

### Orders
```javascript
// Fetch orders
const orders = await fetchOrders(params);

// Get order details
const order = await getOrderById(id);
```

## 🔒 Security

- Environment variables for sensitive data
- Secure authentication flow
- Input validation and sanitization
- HTTPS enforcement in production

## 📈 Performance

- Code splitting with React.lazy
- Image optimization and caching
- Efficient state management
- Bundle size optimization

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interface
- Mobile voice recognition support
- PWA capabilities

## 🌟 Roadmap

- [ ] Offline mode support
- [ ] Advanced analytics dashboard
- [ ] Export functionality
- [ ] Email notifications
- [ ] Multi-user collaboration
- [ ] API integration improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sourav Barui** (elsesourav)

- Email: [elsesourav@gmail.com](mailto:elsesourav@gmail.com)
- GitHub: [@elsesourav](https://github.com/elsesourav)
- Facebook: [elsesourav](https://facebook.com/elsesourav)
- Twitter: [@elsesourav](https://x.com/elsesourav)
- LinkedIn: [elsesourav](https://linkedin.com/in/elsesourav)

## 🙏 Acknowledgments

- [Vosk](https://alphacephei.com/vosk/) for speech recognition
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for beautiful icons
- [Vite](https://vitejs.dev/) for the amazing build tool
- Open source community for inspiration and support

## 💝 Support

If you found this project helpful, please give it a ⭐ on GitHub!

For support, email elsesourav@gmail.com or open an issue on GitHub.

---

**Happy coding! 🚀**
