# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-08

### Added
- **URL State Sharing** - Share your mixes via URL (e.g., `#rain=0.5&beats=0.8`)
- **Undo/Redo** - Ctrl+Z / Ctrl+Y to undo slider changes
- **Import/Export Presets** - Save and load presets as JSON files
- **Volume Normalization** - Automatic gain reduction when many layers are active
- **Visibility API** - Pauses audio processing when tab is hidden (saves battery)
- **Memory Management** - Proper cleanup of audio nodes on unmount
- **Code Splitting** - Lazy loading for visualizer and control panel
- **Bundle Analyzer** - `npm run analyze` to check bundle size

### Added - Testing
- **Vitest** unit testing framework
- **React Testing Library** for component tests
- **Playwright** E2E testing
- Tests for audio utilities, SeededRandom, and Slider component

### Added - Performance
- Improved service worker with stale-while-revalidate caching
- Separate static and dynamic caches
- Cache expiration for dynamic content
- Manual code splitting for vendor chunks

### Added - Monitoring
- **Sentry** error tracking integration
- **Privacy-friendly analytics** (offline-capable, no personal data)
- Enhanced ErrorBoundary with error reporting
- Performance tracking

### Added - DevOps
- GitHub Actions CI/CD pipeline
- Automated testing on PR and push
- Build artifact management
- Placeholder for preview and production deployments

### Changed
- Enhanced service worker with better caching strategies
- Improved memory management for audio nodes
- Optimized bundle with code splitting

### Fixed
- Memory leaks from audio nodes not being disconnected
- CPU usage when tab is not active

## [0.1.0] - 2024-02-07

### Added
- Initial release of Lofi Mixer
- Procedural audio generation (no samples needed)
- 20+ ambient sound layers
- Musical elements: beats, chords, bass
- 6 built-in presets: Focus, Sleep, Vibe, Storm, Nature, Café
- Custom preset system with localStorage
- Canvas visualizer with 5 modes
- Dynamic day/night backgrounds
- Weather effects (rain, fire, lightning)
- Timer/Pomodoro feature
- Audio recording and download
- Keyboard shortcuts
- PWA support with service worker
- Mobile responsive design
- Accessibility features (ARIA labels, reduced motion)
