# Style Prompt & Technical Specs

## Canvas
- **Width**: 1920
- **Height**: 1080
- **Safe Padding**:
  - Left: 120px
  - Right: 120px
  - Top: 100px
  - Bottom: 100px

## Layout
- Content should stay within safe padding.
- Use flex column layout.
- Vertical spacing between elements: 24–40px.
- Align: left or center depending on composition.

## Typography
- **Font Family URL**: [Iosevka Charon Mono](https://fonts.google.com/specimen/Iosevka+Charon+Mono)

## Font Sizes
- **Title**: 64–80px (bold, line-height: 1.1)
- **Subtitle**: 36–44px (semi-bold, line-height: 1.3)
- **Description**: 24–28px (regular, line-height: 1.5)

## Color Modes

### Light Mode
- **Background**: `#FFFFFF`
- **Text Primary**: `#111111`
- **Text Secondary**: `#555555`
- **Theme Color**: `#4F46E5` (used for accents, highlights, buttons)

### Dark Mode
- **Background**: `#0F172A`
- **Text Primary**: `#F9FAFB`
- **Text Secondary**: `#CBD5F5`
- **Theme Color**: `#6366F1`

## Design System
- Use theme color sparingly for emphasis.
- Maintain strong contrast for readability.
- Avoid placing text near edges outside padding.
- Optional subtle gradients using theme color (10–20% opacity).

## Animation Guidelines
- Fade + slight translateY (20–40px).
- Duration: 20–40 frames.
- Use ease-out for entrances, ease-in for exits.
