---
name: Neon Velocity
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c5c9ac'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#8e9378'
  outline-variant: '#444933'
  surface-tint: '#aed500'
  primary: '#ffffff'
  on-primary: '#293500'
  primary-container: '#c7f300'
  on-primary-container: '#576c00'
  inverse-primary: '#526600'
  secondary: '#ffb1c3'
  on-secondary: '#66002c'
  secondary-container: '#ff4b89'
  on-secondary-container: '#590026'
  tertiary: '#ffffff'
  on-tertiary: '#002388'
  tertiary-container: '#dde1ff'
  on-tertiary-container: '#1f51f6'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c7f300'
  primary-fixed-dim: '#aed500'
  on-primary-fixed: '#171e00'
  on-primary-fixed-variant: '#3d4d00'
  secondary-fixed: '#ffd9e0'
  secondary-fixed-dim: '#ffb1c3'
  on-secondary-fixed: '#3f0019'
  on-secondary-fixed-variant: '#8f0041'
  tertiary-fixed: '#dde1ff'
  tertiary-fixed-dim: '#b8c3ff'
  on-tertiary-fixed: '#001356'
  on-tertiary-fixed-variant: '#0035be'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-lg:
    fontFamily: Anybody
    fontSize: 72px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Anybody
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Anybody
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Anybody
    fontSize: 24px
    fontWeight: '700'
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
    lineHeight: '1.6'
  label-sm:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system draws from the high-energy, immersive atmosphere of a vintage pinball arcade, reimagined through a modern, premium lens. The aesthetic is a fusion of **Glassmorphism** and **Retro-Futurism**, utilizing deep, layered obsidian surfaces that allow vibrant neon light to bleed through and define the interface.

The target audience seeks an "after-dark" digital experience that feels nostalgic yet technically sophisticated. The UI should evoke a sense of kinetic energy, mimicking the flash and flow of a pinball machine. Every interaction should feel like a "power-up," utilizing high-contrast visuals and light-emitting properties to guide the user's eye across the dark canvas.

## Colors
The palette is built on a foundation of absolute blacks and deep charcoals to maximize the "pop" of the accent colors.

- **Primary (Cyber Lime):** Used for critical actions, success states, and primary brand moments. It mimics the glow of radioactive elements.
- **Secondary (Hot Pink):** Used for playful highlights, notifications, and secondary interactive elements.
- **Tertiary (Cobalt Blue):** Used for information depth, links, and background glows to provide a cooling contrast to the warmer neons.
- **Neutrals:** A range of ultra-dark greys with subtle blue undertones to maintain a "night mode" aesthetic without losing surface definition.

## Typography
The typography system uses a high-contrast pairing to balance arcade personality with functional legibility.

- **Headlines:** Uses a wide, variable font to echo the bold, impactful signage of 80s arcade cabinets. It should be typeset with tight tracking.
- **Body:** A clean, contemporary sans-serif ensures that even in a dark, high-contrast environment, long-form content remains effortless to read.
- **Data/Labels:** A monospaced font is used for secondary metadata, UI labels, and "score-like" data points to lean into the technical, machine-driven aesthetic.

## Layout & Spacing
The layout follows a **Fluid Grid** model with generous margins to create a "cinematic" feel. Elements are arranged with a 12-column system on desktop, collapsing to 4 columns on mobile. 

Whitespace (or "Blackspace") is used aggressively to separate interactive "zones." The rhythm is based on an 8px base unit. Components often use "optical padding" where the glow effect of the border extends beyond the hit area, requiring slightly larger gutters than standard flat designs to prevent visual clutter.

## Elevation & Depth
Depth is created through **Light Emission** rather than shadows. 

1.  **Background:** The base layer is `#050505`.
2.  **Surface:** Elevated cards use a semi-transparent background (`rgba(22, 22, 26, 0.7)`) with a `backdrop-filter: blur(12px)`.
3.  **Luminescence:** Instead of drop shadows, higher-elevation items use "Outer Glows"—low-opacity box-shadows that match the color of the element's border (e.g., a 10px blurred Cyber Lime glow for a primary button).
4.  **Borders:** Use 1px solid strokes with 0.3 opacity for inactive states, and 1.5px strokes with full color saturation for active/hover states to simulate a tube-light turning on.

## Shapes
The shape language is "Soft" but structured. While the primary aesthetic is technical, slight rounding on corners (`4px` to `12px`) prevents the UI from feeling overly aggressive or "Brutalist." 

Interactive elements like buttons and input fields utilize the `rounded-lg` (8px) setting. Circular shapes are reserved exclusively for avatars and specific "bumper" style buttons that mimic physical pinball components.

## Components
- **Buttons:** Primary buttons feature a solid Cyber Lime background with black text. On hover, they emit a 15px spread glow of the same color. Secondary buttons are "Ghost" style with a neon border.
- **Glass Cards:** Use a 1px border with a gradient stroke (from neutral to a primary accent). The background must blur whatever is behind it to maintain readability.
- **Chips:** Small, pill-shaped badges with `Space Mono` text. They should look like digital readouts or small light indicators.
- **Inputs:** Darker than the surface background with a bottom-only border that "lights up" (changes color and thickens) when focused.
- **Progress Bars:** Designed to look like "Power Meters." Use a gradient from Tertiary (Blue) to Primary (Lime) to show completion.
- **Toggle Switches:** Designed to look like physical rocker switches found on arcade cabinets, utilizing high-contrast "On" states.