# Project Brief: The Getaway Pinball Arcade

## 1. Project Overview
**The Getaway** is a high-octane, retro-modern pinball arcade opening Summer 2026 in Downtown Dublin, CA (6890 Village Parkway, Dublin, CA 94568). The project blends the nostalgic, tactile thrill of classic pinball with a bold, high-contrast digital presence — built to welcome everyone from casual walk-ins to serious competitive players looking for a "night out" destination to play, connect, and unwind.

> Reference: [thegetawaydublin.com](https://thegetawaydublin.com/) — the live (pre-launch, under-construction) site for the real business.

## 2. Brand Identity
- **Name:** The Getaway (Pinball Arcade)
- **Brand Story / Mission:** "The Getaway was born from a simple idea — everyone deserves a place to escape. Chase a high score, compete with friends, or just leave the outside world behind. Come as you are. Leave your worries at the door. This is your Getaway." — the core brand statement, pulled directly from [thegetawaydublin.com](https://thegetawaydublin.com/), and the anchor for all hero/mission copy.
- **Tagline:** This Is Your Getaway. *(primary, from the brand mission statement)*
  - Secondary/marketing tagline: "The High Score Starts Here." — carried over from the earlier design-prototype direction; use for competitive/tournament-flavored moments (Arsenal, Circuit) rather than as the top-level brand line.
- **Personality:** Welcoming and escapist at its core ("come as you are"), expressed through a high-octane, cinematic, retro-arcade visual language. The vibe should feel inclusive and low-pressure first, with bold/competitive energy layered in for players who want it (tournaments, leaderboards).
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
### Primary Nav / Tabs
Match the real site's current top-level navigation (simple and pre-launch-appropriate), rather than the fuller aspirational nav explored in the v1 prototype:
- **Home**
- **Game List**
- **Beverages**

### Home (Current, Live Reference: `thegetawaydublin.com`)
- **Hero:** Logo mark + the brand mission statement ("everyone deserves a place to escape... This is your Getaway.") as the primary above-the-fold content.
- **Contact/Signup:** Lightweight contact form (Name, Email) with copy "Stay tuned for arcade news & special offers!" — this is the main conversion action pre-launch.
- **Footer:** Address (6890 Village Parkway, Dublin, CA 94568) and copyright.
- *Note: the real site is explicitly "under construction" ahead of the Summer/August 2026 opening, so content is intentionally minimal — no machine gallery, events, or membership info live yet.*

### Game List (Tab)
- Full inventory of pinball machines available on location, with the depth/styling explored in the v1 prototype's "The Arsenal / Elite Playfields" (e.g. Godzilla, Jurassic Park, Medieval Madness) — glass cards, difficulty-rating indicators, tags ("NEW", "LEGEND"), and per-machine detail.
- **Planned enhancement:** filtering by manufacturer (Stern, Williams, Bally) and difficulty.

### Beverages (Tab)
- Menu of drinks/beverages served at the arcade (content TBD — not yet published on the live site).
- Should follow the same dark, red-accented visual system as the rest of the site (glass-card menu items, `Space Mono` pricing/labels).

### Future Vision (Aspirational Direction, Reference: `stitch_prototyping/v1`)
Once the arcade is open and the concept matures beyond the current 3-tab site, consider layering in the richer experience explored in the v1 prototype, along with the supporting screens each would need:
- **The Circuit (Events/Tournaments):** Event list (e.g. "Friday Night Flip-Off," "Monthly Match Play — IFPA Sanctioned," "Rookie Rumble") with date blocks, format labels, and quick-navigation rows. *(Planned screen: Tournament Leaderboards — live local player rankings tied to Circuit events.)*
- **Elite Access (Membership):** Tiered membership pitch — Unlimited Play, Tournament Entries, Secret Menu, Exclusive Merch — anchored by a pricing callout ("Starting at $49/mo") and an "Apply for Membership" CTA. *(Planned screen: Membership Portal — account management, billing, and exclusive member content access.)*
- **Find the Vibe (Location):** Map/venue imagery, address and phone contact, social links, paired with the logo lockup. *(Planned screen: Booking Flow — reservation system for tables, lanes, and private events.)*

## 5. Technical Requirements
- **Device Support:** Desktop-first (high-fidelity), fully responsive down to mobile.
- **Interactivity:** Hover/scroll-triggered red glow effects, animated "power meter" style micro-interactions on cards, and real-time event/leaderboard integration.
- **Architecture:** Persistent app shell (fixed header, consistent footer) for seamless navigation across the site.
- **Reference Implementation:** `stitch_prototyping/v1/code.html` and `stitch_prototyping/v1/DESIGN.md` are the current source of truth for layout, component styling, and design tokens going forward.
