# Navidad 2025 - Blue Pure Loyalty Codebase Guide

## Project Overview

**Bluenavidad25** is an interactive Christmas experience combining Vue 3, Canvas animations, and external APIs. It's a progressive "postal card" animation that flips to reveal an interactive photo-to-cookie generator.

### Architecture

```
Frontend (Vue 3) → Image Sequence Canvas → User Interaction (Galletizate Modal)
                      ↓                                  ↓
                Scroll Progress              Physics Gallery (Matter.js)
                      ↓                                  ↓
              Audio Sync + Overlays           API: galletizate.ealbinu.workers.dev
```

## Key Components

### 1. **Image Sequence Playback** (`ImageSequence` class)
- Loads 214 AVIF frames (frame_0.avif to frame_213.avif)
- Renders frames to Canvas based on scroll progress (0.0 to 1.0)
- Scaling: Maintains aspect ratio, fits height, centers horizontally
- **Critical**: Uses `img.complete` check before rendering to avoid rendering unloaded images

### 2. **Visual Effects**
- **Snow**: Continuous particles falling with random drift
- **Fireworks**: Auto-spawn when scroll > 63% (0.7 × 0.9 phase), triggered by `fireworks.active = true`
- Both use Canvas with `requestAnimationFrame` for smooth animation

### 3. **3D Flip Animation** (CSS/Vue)
- `.flip-wrapper` rotates 180° on Y-axis when `hasStarted = true`
- Dual-sided card: loader front → postal content back
- Postal card contains sequence canvas + overlays (logo, text)
- **Scroll progression**: 0-90% for video playback, 90%+ for Galletizate section

### 4. **Smooth Scrolling** (Lenis Library)
- Custom easing: `1.001 - Math.pow(2, -10 * t)`
- Disabled initially (`lenis.stop()`), unlocked after "Iniciar" button
- Triggers `updateScroll()` which syncs all progress-dependent elements

### 5. **Cookie Physics Gallery** (Matter.js)
- Only initializes when modal opens (lazy init)
- Cookies are circular bodies with `restitution: 0.6`
- User's cookie gets golden glow border
- Auto-polls `/all` endpoint every 10 seconds for new cookies
- Mouse constraint enables drag interactions

### 6. **Audio Player**
- Loads `assets/musicbg.mp3`, loops automatically
- Fixed position (top-right), styled with backdrop blur
- Syncs with UI: play button toggle controls audio state
- Separate oven sound (8s) plays when cookie is generated

## Data Flow

### Scroll Progress Chain
```
lenis.on('scroll') → updateScroll(scrollTop) → scrollProgress.ref → 
  ├─ Compute: showText1, showText2, showLogo, showGalletizateButton
  ├─ Update: sequenceManager.render(progress)
  ├─ Slide postal up, slide galletizate in
  └─ Trigger fireworks if > 0.63
```

### Image Upload to Cookie
```
handleFileUpload() → userPhoto.value (base64) →
  sendImage() → POST to galletizate endpoint →
  Response: { rembg_url, ... } →
  ├─ Display result
  ├─ Play oven sound
  └─ Add to physics gallery (500ms delay)
```

## Integration Points

### External APIs
- **Galletizate Worker**: `https://galletizate.ealbinu.workers.dev/`
  - `POST /` with `{ image_base64 }` → returns `{ rembg_url }`
  - `GET /all` → returns array of `{ url, ... }` (all generated cookies)

### Asset Dependencies
- Frames: `assets/frames/frame_0.avif` to `frame_213.avif` (214 total)
- Audio: `assets/musicbg.mp3`, `assets/oven.mp3`
- SVG: `assets/BluePureLoyalty.svg`, `assets/bcircle.svg`

## Development Patterns

### Vue Reactivity
- `ref()` for mutable values (strings, booleans, numbers)
- `computed()` for derived state (visibility flags based on `scrollProgress`)
- Side effects in `onMounted()` / `onUnmounted()` (canvas setup, event listeners)

### Canvas Rendering
- Always check `img.complete` before drawing
- Clear canvas with `ctx.clearRect(0, 0, width, height)`
- Use `requestAnimationFrame()` for continuous updates, not `setInterval()`
- Handle retina displays: `mouse.pixelRatio = window.devicePixelRatio`

### Responsive Design
- Tailwind + custom CSS; uses `@tailwind` directives
- Fixed overlays positioned absolutely within `.postal-scene`
- Canvas resize handlers on `window.resize` event
- Mobile: Hide mouse wheel icon, show animated hand gesture

## Debugging Tips

**Loading Progress**: Check browser console for frame load warnings; frames load asynchronously
**Audio Issues**: Audio play may be blocked by browser policy; wrapped in `.catch()`
**Physics Performance**: Cookie count affects frame rate; `destroy()` method clears physics engine
**Scroll Sync**: Verify `lenis.stop()` releases on `startExperience()` and scroll events fire correctly

## Common Tasks

| Task | Location | Notes |
|------|----------|-------|
| Adjust frame count | `ImageSequence.frameCount = 214` | Must match actual files |
| Change overlay timing | `showText1/2`, `showLogo` computed values | Trigger at scroll thresholds (0.0-1.0) |
| Modify physics | `CookiePhysics.addCookie()` params | Restitution/friction/density affect behavior |
| Update colors/fonts | `css/style.css`, `css/audio.css` | Tailwind config in HTML `<script>` |
| Switch audio file | `initAudio()`: change `'assets/musicbg.mp3'` path | Must be valid audio format |
