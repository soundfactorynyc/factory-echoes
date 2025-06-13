# 🎵 Sound Factory - Mobile Live Stream App

A modern, mobile-first live streaming application built with Astro, featuring TikTok-style interactions, real-time chat, and immersive WebGL backgrounds.

## ✨ Features

### 🎭 **Interactive Components**
- **Floating Player**: Draggable, resizable video player with touch support
- **Grid Overlay**: Feature-rich overlay with quick access to app functions
- **Theme Selector**: Switch between Dark, Pink, and Jet Black themes
- **Status Bar**: Mobile-style status bar with live clock
- **Live Chat**: Real-time chat with auto-messages and user interactions

### 🎨 **Visual Experience**
- **WebGL Background**: Animated, theme-responsive backgrounds (space, clouds, grid)
- **Touch Optimized**: 44px minimum touch targets, ripple effects
- **Smooth Animations**: CSS transitions and keyframe animations
- **Mobile First**: Responsive design optimized for mobile devices
- **Custom Themes**: Multiple visual themes with instant switching

### 🛠 **Technical Features**
- **Nanostores**: Reactive state management with persistence
- **TypeScript**: Full type safety throughout the codebase
- **Modern CSS**: CSS variables, grid layouts, flexbox
- **Astro Framework**: Static site generation with island architecture
- **PWA Ready**: Service worker support and offline capabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo>
cd sound-factory-astro

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # Reusable Astro components
│   ├── StatusBar.astro  # Mobile status bar
│   ├── Header.astro     # App header with branding
│   ├── LiveStream.astro # Main stream component
│   ├── Chat.astro       # Interactive chat
│   ├── FloatingPlayer.astro # Draggable video player
│   ├── GridOverlay.astro    # Feature grid overlay
│   ├── GridItem.astro   # Individual grid items
│   └── ThemeSelector.astro  # Theme switching
├── layouts/
│   └── Layout.astro     # Base layout template
├── pages/
│   └── index.astro      # Main application page
├── scripts/
│   ├── stores/          # State management
│   │   ├── appStore.ts     # Main app state
│   │   ├── notificationStore.ts # Notification system
│   │   └── eventBus.ts     # Event communication
│   └── webgl-background.ts # WebGL background renderer
└── styles/
    ├── global.css       # Global styles and utilities
    ├── themes.css       # Theme definitions
    └── animations.css   # Animation keyframes
```

## 🎮 Component Guide

### StatusBar
```astro
<StatusBar />
```
Mobile-style status bar with live clock and system icons.

### Header
```astro
<Header />
```
App branding with "SOUND FACTORY" logo and live indicator.

### LiveStream
```astro
<LiveStream initialViewers={1247} />
```
Main streaming component with viewer count and controls.

### Chat
```astro
<Chat />
```
Interactive chat with auto-messages and user input.

### FloatingPlayer
```astro
<FloatingPlayer client:load />
```
Draggable video player (requires client-side hydration).

### GridOverlay
```astro
<GridOverlay client:load />
```
Feature grid with app functions (requires client-side hydration).

### ThemeSelector
```astro
<ThemeSelector client:load />
```
Theme switching component (requires client-side hydration).

## 🎨 Themes

### Dark Theme (Default)
- Space background with stars and nebula
- Dark color palette
- Blue accent colors

### Pink Theme
- Dreamy cloud background
- Pink and magenta gradients
- Soft, ethereal feel

### Jet Black Theme
- Minimal black background
- Subtle grid pattern
- High contrast design

## 🛠 State Management

### App Store (`appStore.ts`)
```typescript
import { appStore, toggleGridOverlay } from '../scripts/stores/appStore';

// Read state
const state = appStore.get();

// Update state
appStore.setKey('theme', 'pink');

// Use helpers
toggleGridOverlay();
```

### Persistent Settings
```typescript
import { persistentSettings } from '../scripts/stores/appStore';

// Auto-saved to localStorage
persistentSettings.setKey('theme', 'dark');
```

### Notifications
```typescript
import { notify } from '../scripts/stores/notificationStore';

notify('🎵 Welcome to Sound Factory!');
notify('Theme changed!', 2000); // Custom duration
```

## 🎯 Performance

### Optimizations
- **Static Generation**: Pre-rendered at build time
- **Island Architecture**: Minimal JavaScript hydration
- **CSS Variables**: Efficient theme switching
- **WebGL**: Hardware-accelerated backgrounds
- **Lazy Loading**: Components load when needed

### Bundle Size
- **Base**: ~50KB gzipped
- **WebGL**: ~15KB additional
- **Stores**: ~5KB additional

## 📱 Mobile Features

### Touch Support
- **44px minimum touch targets**
- **Touch feedback with ripple effects**
- **Swipe gestures for navigation**
- **Prevent bounce scrolling on iOS**

### Responsive Design
- **Mobile-first approach**
- **Flexible grid layouts**
- **Optimized for portrait orientation**
- **Touch-optimized interactions**

## 🔧 Development

### Environment Variables
Create `.env` file for customization:
```env
# Owncast server URL for live streaming
PUBLIC_OWNCAST_URL=https://stream.soundfactorynyc.com

# Optional: Analytics tracking
PUBLIC_ANALYTICS_ID=your-analytics-id

# Optional: API endpoints
PUBLIC_API_URL=https://live.soundfactorynyc.com

# Development settings
DEV_HOST=localhost
DEV_PORT=3000
```

Copy `.env.example` to `.env` and configure your settings:
```bash
cp .env.example .env
```

### Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run check      # Type checking
npm run format     # Format code with Prettier
```

## 🚀 Deployment

### Static Hosting
Build generates static files in `dist/`:
```bash
npm run build
```

### Supported Platforms
- **Vercel**: Zero-config deployment
- **Netlify**: Drag and drop deployment
- **GitHub Pages**: Static hosting
- **Any CDN**: Standard HTML/CSS/JS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use Prettier for formatting
- Follow TypeScript best practices
- Write semantic HTML
- Use CSS custom properties
- Document component props

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Astro**: Amazing static site generator
- **Nanostores**: Lightweight state management
- **WebGL**: Hardware-accelerated graphics
- **CSS Grid**: Modern layout system

---

Built with ❤️ for the live streaming community.
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
