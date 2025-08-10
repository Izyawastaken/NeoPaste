# Sanctum

A modern, blazing-fast Pokémon team sharing platform built with React, TypeScript, and Vite.

## Features

- 🚀 **Blazing Fast Performance** - Optimized with service workers, code splitting, and aggressive caching
- 🎨 **Beautiful UI** - Modern glassmorphic design with dark mode support
- 🎯 **Clean URLs** - SEO-friendly routing with `/view/abc` format
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🔧 **Advanced Features** - Animated sprites, stat calculations, calculator integration
- 🎨 **Customizable** - Accent color picker and theme persistence

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS with glassmorphic effects
- **Database**: Supabase
- **Performance**: Service Workers, Code Splitting, LRU Cache
- **Build Tool**: Vite with SWC

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to GitHub Pages

### Automatic Deployment (Recommended)

1. Push your code to a GitHub repository
2. Go to your repository Settings → Pages
3. Set Source to "GitHub Actions"
4. The workflow will automatically deploy on every push to main branch

### Manual Deployment

1. Build the project: `npm run build`
2. Upload the contents of the `dist` folder to your GitHub Pages repository

## Environment Variables

The app uses Supabase for data storage. Make sure your Supabase credentials are properly configured in the source code.

## Performance Optimizations

- **Service Worker**: Aggressive caching for offline support
- **Code Splitting**: Lazy-loaded components for faster initial load
- **Image Preloading**: Sprites are preloaded for smooth transitions
- **LRU Cache**: Efficient memory management
- **Debouncing/Throttling**: Optimized event handling

## License

Inspired by [Pokepaste](https://pokepast.es) by felixphew.
