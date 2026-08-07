# Project Brief: The Getaway Pinball Arcade

## 1. Project Overview
**The Getaway** is a high-octane, retro-modern pinball arcade located in the Pixel District. The project blends the nostalgic, tactile thrill of classic pinball with a bold, high-contrast digital presence — built for players who take their game seriously and want a premium "night out" destination for play, competition, and community.

## 2. Brand Identity
- **Name:** The Getaway (Pinball Arcade)
- **Tagline:** The High Score Starts Here.
- **Personality:** High-octane, cinematic, competitive, and unapologetically bold.
- **Logo:** A custom wordmark lockup — `THE` set in a small italicized red script above `GETAWAY`, rendered in a bold, speed-slanted red display face with a white keyline outline and a horizontal motion-line beneath it, evoking a "getaway car" streak. The companion tagline lockup pairs the wordmark with a stacked `PINBALL ARCADE` label in a chunky, uppercase block font — both set in the brand's signature red on a transparent/white background.
  - Primary mark: `logo.png` (wordmark only)
  - Tagline lockup: `logo_withtag.png` (wordmark + "PINBALL ARCADE")
  - Usage: Apply the `logo-neon-red` drop-shadow/glow treatment when placed on dark surfaces (header, footer, location section) so the mark reads as if lit from within, consistent with the site's neon signage motif.

## 3. Design System: "High-Octane Arcade" (Red + White)
- **Color Palette:**
  - **Primary / Accent Red:** `#E31B23` — drawn directly from the logo; used for CTAs, glows, highlights, and brand moments.
  - **Secondary:** Pure White `#FFFFFF` — the "high-beam" counterpoint to red, used for secondary actions and high-legibility text.
  - **Surface:** Obsidian Core `#131313` / `#050505` — near-black base that lets red and white "pop."
  - **Structural:** Deep Slate containers (`#1c1b1b`–`#353534` range) for tonal separation without leaving the dark palette.
- **Typography:**
  - **Headlines:** *Anybody* (Bold/Extra-Bold, often italic) — tight negative letter-spacing for a "custom-tuned," high-speed feel.
  - **Body:** *Hanken Grotesk* — clean, geometric, and highly legible against dark surfaces.
  - **Labels/Data:** *Space Mono* — uppercase, wide letter-spacing, used for metadata, chips, and instrumentation-style UI (dates, stats, tags).
- **Visual Style:** Dark mode by default. Depth is built from tonal layers and red light-emission (glows) rather than drop shadows. Glassmorphism (blurred, semi-transparent panels) is used sparingly for cards and overlays. Soft 4px corner radii throughout, occasionally paired with diagonal chamfers on primary buttons for an aerodynamic, "stealth" feel.

## 4. Sitemap & Core Features
### Home (Live Reference: `stitch_prototyping/v1`)
- **Hero:** Full-bleed cinematic hero with logo, brand statement ("The Getaway Revolution"), high-score tagline chip, and primary CTAs (Book a Table, View Machines).
- **The Arsenal / Elite Playfields:** Featured pinball machine gallery (e.g. Godzilla, Jurassic Park, Medieval Madness) presented as glass cards with difficulty-rating indicators, tags ("NEW", "LEGEND"), and a "View Stats" action per machine.
- **The Circuit:** Event/tournament list (e.g. "Friday Night Flip-Off," "Monthly Match Play — IFPA Sanctioned," "Rookie Rumble") with date blocks, format labels, and quick-navigation rows.
- **Elite Access (Membership):** Tiered membership pitch — Unlimited Play, Tournament Entries, Secret Menu, Exclusive Merch — anchored by a pricing callout ("Starting at $49/mo") and an "Apply for Membership" CTA.
- **Find the Vibe (Location):** Map/venue imagery, address and phone contact, social links, paired with the logo lockup.
- **Footer:** Arcade hours, email signup ("Join the Circuit"), and social/contact links.

### Planned Screens
- **Machine Catalog:** Full inventory of 40+ tables with filtering by manufacturer (Stern, Williams, Bally) and difficulty.
- **Tournament Leaderboards:** Live local player rankings tied to The Circuit events.
- **Membership Portal:** Account management, billing, and exclusive member content access.
- **Booking Flow:** Reservation system for tables, lanes, and private events.

## 5. Technical Requirements
- **Device Support:** Desktop-first (high-fidelity), fully responsive down to mobile.
- **Interactivity:** Hover/scroll-triggered red glow effects, animated "power meter" style micro-interactions on cards, and real-time event/leaderboard integration.
- **Architecture:** Persistent app shell (fixed header, consistent footer) for seamless navigation across the site.
- **Reference Implementation:** `stitch_prototyping/v1/code.html` and `stitch_prototyping/v1/DESIGN.md` are the current source of truth for layout, component styling, and design tokens going forward.
