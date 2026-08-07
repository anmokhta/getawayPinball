---
name: High-Octane Arcade (Red + White)
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e7bdb8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#ae8883'
  outline-variant: '#5d3f3c'
  surface-tint: '#ffb4ac'
  primary: '#ffb4ac'
  on-primary: '#690006'
  primary-container: '#e31b23'
  on-primary-container: '#fff9f8'
  inverse-primary: '#c00015'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#747373'
  on-tertiary-container: '#fdfaf9'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ac'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000d'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Anybody
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Anybody
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Anybody
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Anybody
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-lg:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
---

## Brand & Style

This design system channels the high-energy, cinematic adrenaline of arcade racing and retro-modern gaming. It is built for speed, precision, and impact, targeting an audience that values performance and bold aesthetics.

The visual style is a fusion of **Vaporwave-Noir** and **High-Contrast Modernism**. It utilizes deep, "obsidian" surfaces to create a sense of infinite depth, allowing the primary red and secondary white elements to "pop" with aggressive clarity. The emotional response is one of urgency, excitement, and premium power. Every interaction should feel like a high-speed maneuver—sharp, responsive, and visually stimulating.

## Colors

The palette is anchored by a triad of high-intensity tones:

- **Primary Red (#E31B23):** Derived from the "The Getaway" logo, this color is used for call-to-actions, critical highlights, and "velocity" glows. It represents energy and the "redline" of a tachometer.
- **Pure White (#FFFFFF):** Used for maximum legibility and as a secondary accent. It serves as the "high-beam" light against the dark background.
- **Obsidian Core (#050505):** The fundamental surface color. It is a near-black that provides the canvas for light-based effects.
- **Deep Slate (#1A1A1A):** Used for container backgrounds and structural elements to provide subtle tonal separation from the base obsidian.

All "glow" effects should utilize the primary red at varying opacities (20-40%) to simulate light emission against the dark UI.

## Typography

The typography system utilizes a tiered font strategy to balance impact with technical precision.

- **Headlines:** Feature **Anybody**, leveraging its variable-width and expressive nature. Use Bold and Extra-Bold weights with an *italic* slant to convey movement and speed. Negative letter-spacing is essential for large display text to create a "custom-tuned" look.
- **Body:** Uses **Hanken Grotesk** for superior readability in long-form technical descriptions and UI copy. It provides a clean, geometric contrast to the aggressive headlines.
- **Labels:** Powered by **Space Mono** to mimic instrumentation, data readouts, and digital cockpit displays. Always uppercase with generous letter-spacing to reinforce the technical, hardware-inspired look.
- **Scaling:** Large display types scale aggressively for mobile to maintain the "big screen" arcade feel.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with a strict 2px baseline for tighter technical density.

- **Grid:** A 12-column grid is used for desktop, transitioning to 4 columns for mobile. 
- **Rhythm:** Spacing follows a tight geometric progression (2, 4, 8, 12, 16, 24, 32, 48, 64).
- **Safe Areas:** Large internal paddings within containers are used to emphasize the "floating" nature of the UI elements. 
- **Reflow:** On mobile, side-by-side elements stack vertically, and horizontal scrolling is permitted for data-heavy "leaderboard" style lists.

## Elevation & Depth

Depth in this design system is created through **Tonal Layers** and **Light Emission** rather than traditional shadows.

- **Z-0 (Base):** The obsidian surface (#050505).
- **Z-1 (Plates):** Containers using #1A1A1A with a 1px solid border of #FFFFFF at 10% opacity.
- **Z-2 (Active):** Elements that are interactive or "hot" emit a red glow. This is achieved using a multi-layered outer glow: a sharp 2px red stroke followed by a soft 16-24px red blur at 30% opacity.
- **Glassmorphism:** Use sparingly for overlays (modals/drawers) with a 20px backdrop blur and a red-tinted semi-transparent fill.

## Shapes

The shape language is **Soft (1)**, incorporating subtle 0.25rem (4px) corner radii.

To reflect the industrial nature of high-performance machinery, corners are kept mostly tight. The 4px rounding mimics the machined finish of arcade hardware. For primary action buttons, combine this soft radius with **diagonal chamfers** (clipped corners) at 45-degree angles to add a "stealth" aerodynamic aesthetic.

## Components

- **Buttons:** Primary buttons feature a solid #E31B23 fill with **Space Mono** white uppercase text. On hover, the button should trigger a red outer glow. Secondary buttons use a white 1px border with no fill.
- **Chips/Badges:** Small rectangular blocks with soft 4px corners, solid red backgrounds, and white text, used for status indicators like "LIVE" or "NEW RECORD."
- **Input Fields:** Obsidian backgrounds with a 1px bottom-border only (#FFFFFF at 40%). When focused, the border turns primary red and emits a subtle glow.
- **Cards:** Soft-cornered obsidian blocks with a 1px #1A1A1A border. Titles should be Anybody Italic.
- **Lists/Leaderboards:** Zebra-striping using obsidian and deep slate. Use primary red for rank numbers (1st, 2nd, 3rd) to denote hierarchy.
- **Progress Bars:** Solid white tracks with a primary red "glow" fill that pulses during loading states.