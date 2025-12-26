# Flow State

A minimalist, interactive particle-based visualization engine built with Three.js and WebGL. Transform images into mesmerising flow field animations with real-time interactivity.

**[View Live Demo](https://pigeon68.github.io/flow-state/)**

## Features

-  **Image-to-Particle Conversion** - Upload any image or use the default to generate particle systems
-  **Perlin Noise Flow Fields** - Real-time flow field simulation driven by 3D and 4D Perlin noise
-  **Interactive Control** - Mouse-driven particle manipulation with customizable influence radius
-  **Adjustable Parameters** - Fine-tune decay speed, flow frequency, and seed values via intuitive UI
-  **Responsive Design** - Adapts seamlessly to desktop, tablet, and mobile viewports
-  **One-Click Reset** - Regenerate particles with a new random seed instantly

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

```bash
git clone https://github.com/pigeon68/flow-state.git
cd flow-state
npm install
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

The app will open at `http://localhost:8080` (or the next available port).

### Production Build

Generate an optimized production build:

```bash
npm run build
```

Output files are generated in the `docs/` directory for GitHub Pages deployment.

## Usage

1. **Launch the app** - The title screen will display, then transition to the main interface
2. **Choose an image**:
   - Click **"Upload image"** to select your own image (PNG, JPEG)
   - Click **"Use default image"** to start with a sample image
3. **Interact**:
   - **Move mouse** - Influence nearby particles with a customizable flow force
   - Click **"Upload new"** (+ button) - Swap images anytime
   - Click **"Reseed"** (bottom) - Regenerate particles with a new random pattern
4. **Customize** (⚙️ button):
   - **Decay Speed** - Controls how quickly particles fade back to their original positions
   - **Perlin Frequency** - Adjusts the scale of the flow field noise
   - **Other parameters** - Fine-tune the simulation behavior

## Project Structure

```
flow-state/
├── src/
│   ├── index.html              # Entry point with title screen
│   ├── script.js               # Main application logic
│   ├── style.css               # Styling and animations
│   ├── Experience/
│   │   └── World.js            # Three.js world setup
│   ├── Nebula/
│   │   ├── Core.js             # Core engine singleton
│   │   ├── Catalogue.js        # Asset definitions
│   │   ├── Depot.js            # Asset loading and management
│   │   ├── Painter.js          # Rendering pipeline
│   │   ├── Lens.js             # Camera and zoom controls
│   │   ├── Realm.js            # Scene and artwork management
│   │   ├── Art/
│   │   │   ├── Mosaic.js       # Particle system class
│   │   │   └── VectorField.js  # Vector field visualization
│   │   ├── fundamentals/
│   │   │   ├── Bus.js          # Event bus
│   │   │   ├── Clock.js        # Timing utilities
│   │   │   ├── Fetcher.js      # Asset loader
│   │   │   ├── Metrics.js      # Performance metrics
│   │   │   └── Monitor.js      # Debug monitor
│   │   └── shaders/            # GLSL shaders
│   │       ├── currents/       # Flow field shaders
│   │       ├── noise/          # Perlin noise shaders
│   │       └── sprites/        # Particle shaders
│   └── static/                 # Static assets (basis, draco codecs)
├── bundler/                    # Webpack configuration
│   ├── webpack.common.js       # Shared config
│   ├── webpack.dev.js          # Development config
│   └── webpack.prod.js         # Production config
├── docs/                       # Built output (GitHub Pages)
└── package.json                # Dependencies and scripts
```

## Technology Stack

- **Three.js** - 3D graphics and WebGL rendering
- **Webpack 5** - Module bundling and asset management
- **Babel** - JavaScript transpilation
- **GLSL** - Custom shader language for GPU-accelerated effects
- **Tweakpane** - Intuitive parameter UI
- **Perlin Noise** - Procedural noise generation
- **Draco/Basis** - 3D model and texture compression codecs

## Performance

- Particle count automatically scales based on image dimensions (max 800px)
- GPU-accelerated flow field simulation with render-to-texture
- Source maps for development debugging
- Optimized bundle size with code splitting
