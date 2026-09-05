# `machines-new-arrivals.json` — data & image sources

This file documents where every field in `data/machines-new-arrivals.json` came from, since JSON itself can't hold comments. It is **not** wired into any page — it's a standalone data deliverable.

## Data sources

All 23 machines were verified against the **Internet Pinball Database (IPDB)** at [ipdb.org](https://www.ipdb.org) for name, manufacturer, and year (IPDB blocks automated fetching via Cloudflare, so lookups were done by direct navigation/search, not scraping). The **key that mattered most** for nearly every modern title is the exact **trim/edition name** — Pro, Premium, and LE versions of the same game are cataloged as distinct machines with their own IDs, and sometimes even different backglass art or titles. Manufacturer + year were used to disambiguate re-themes and anniversary variants.

| Machine | Manufacturer | Year | IPDB # | Identifying key(s) used |
|---|---|---|---|---|
| The Addams Family | Bally (built by Midway) | 1992 | [#20](https://www.ipdb.org/machine.cgi?id=20) | Base edition only — no trim variants existed in 1992 |
| Aerosmith (Pro) | Stern Pinball | 2017 | [#6370](https://www.ipdb.org/machine.cgi?id=6370) | "Pro" — distinct from Aerosmith LE/Premium |
| Avengers: Infinity Quest (Pro) | Stern Pinball | 2020 | [#6754](https://www.ipdb.org/machine.cgi?id=6754) | "Pro" edition of the *Infinity Quest* release (not the earlier 2016 "Avengers" or "Age of Ultron" titles) |
| Batman '66 (Premium) | Stern Pinball | 2016 | [#6354](https://www.ipdb.org/machine.cgi?id=6354) | No Pro edition was ever made of this title, so "Premium" is effectively the base/only trim |
| Black Knight: Sword of Rage (Pro) | Stern Pinball | 2019 | [#6567](https://www.ipdb.org/machine.cgi?id=6567) | "Pro" — distinct from BKSOR Premium/LE |
| Deadpool (Premium) | Stern Pinball | 2018 | [#6559](https://www.ipdb.org/machine.cgi?id=6559) | "Premium" — distinct from Deadpool Pro/LE |
| Elvira's House of Horrors (Blood Red Kiss Edition) | Stern Pinball | 2023 | *not yet listed* (base Premium/LE is [#6596](https://www.ipdb.org/machine.cgi?id=6596)) | "Blood Red Kiss" is a later monochrome/red-sparkle run of the same game; confirmed via Stern's press release since IPDB hasn't split out a dedicated entry for it |
| Foo Fighters (Pro) | Stern Pinball | 2023 | [#7071](https://www.ipdb.org/machine.cgi?id=7071) | "Pro" — distinct from Foo Fighters Premium/LE |
| Godzilla (70th Anniversary Premium Edition) | Stern Pinball | 2024 | *not yet listed* (base Godzilla Premium is [#6841](https://www.ipdb.org/machine.cgi?id=6841)) | Official monochrome/black-and-white Premium-tier run released for Godzilla's 70th anniversary; confirmed via Stern's press release |
| Godzilla (Pro) | Stern Pinball | 2021 | [#6841](https://www.ipdb.org/machine.cgi?id=6841) | "Pro" — distinct from Godzilla Premium/LE |
| James Bond 007 (Pro) | Stern Pinball | 2022 | [#6896](https://www.ipdb.org/machine.cgi?id=6896) | "Pro" — the physical cabinet's backglass/translite art actually reads **"DR. NO"** (themed around the first Bond film), not "James Bond 007" |
| Jaws (Pro) | Stern Pinball | 2024 | *not yet listed* | Confirmed as a real, shipped 2024 Stern release via manufacturer materials — no IPDB entry yet at time of writing |
| Jurassic Park (Pro) | Stern Pinball | 2019 | [#6573](https://www.ipdb.org/machine.cgi?id=6573) | "Pro" — distinct from Jurassic Park Premium/LE |
| King Kong: Myth of Terror Island (Premium) | Stern Pinball | 2025 | *not yet listed* | Newly released 2025 title; confirmed via manufacturer materials — no IPDB entry yet |
| Pokémon (Premium) | Stern Pinball | 2026 | *not yet listed* | Newly released 2026 title; confirmed via manufacturer materials — no IPDB entry yet |
| Rush (Pro) | Stern Pinball | 2022 | [#6844](https://www.ipdb.org/machine.cgi?id=6844) | "Pro" — distinct from Rush Premium/LE |
| The Simpsons Pinball Party | Stern Pinball | 2003 | [#4674](https://www.ipdb.org/machine.cgi?id=4674) | Base edition only |
| South Park | Sega Pinball | 1999 | [#4444](https://www.ipdb.org/machine.cgi?id=4444) | The only Sega-made title in this list. `manufacturerSlug` is set to `sega` for accuracy, but note that the live site's filter pills (`machines/index.html`) currently only cover Stern/Williams/Bally — this entry won't match any filter until a Sega pill is added (out of scope for this data-only deliverable) |
| Spider-Man (Vault Edition) | Stern Pinball | 2016 | [#6328](https://www.ipdb.org/machine.cgi?id=6328) | "Vault Edition" — a reissue of the original 2007 Spider-Man ruleset/art, cataloged separately from that original release |
| Star Wars (Pro) | Stern Pinball | 2017 | [#6428](https://www.ipdb.org/machine.cgi?id=6428) | "Pro" — specifically the original 2017 **photo-real** art package, not the 2019 "Comic Art" re-issue (which is a separate IPDB entry) |
| The Getaway: High Speed II | Williams | 1992 | [#1000](https://www.ipdb.org/machine.cgi?id=1000) | Base edition only |
| Venom (Pro) | Stern Pinball | 2023 | [#7064](https://www.ipdb.org/machine.cgi?id=7064) | "Pro" — distinct from Venom Premium/LE |
| World Cup Soccer '94 | Bally (built by Midway) | 1994 | [#2811](https://www.ipdb.org/machine.cgi?id=2811) | Nicknamed "Dog Soccer" after mascot Striker the World Cup Pup — confirmed as the real machine, not a fictional/obscure variant |

## Image sources (translites)

Per request, `image` is each machine's **translite** — the backlit backbox marquee art (technically distinct from an old-style painted "backglass," though every database and most of the community use the terms interchangeably; every game on this list is new enough to use a true translite).

All 23 images are hotlinked from **[opdb.org](https://opdb.org)** (the Open Pinball Database — the same database that powers Match Play Events), at `img.opdb.org`. This host is CORS-friendly, requires no auth, and isn't behind Cloudflare bot-protection (unlike IPDB/Pinside, which have the best-curated translite scans but block automated fetching entirely).

Two sourcing methods were used, depending on whether OPDB's own contributors had labeled their uploads:

**Explicitly labeled "Backglass" or "Translite" photos** (used as-is, no visual check needed):

| Machine | OPDB machine page | Image caption |
|---|---|---|
| The Addams Family | [opdb.org/machines/170](https://opdb.org/machines/170) | "Backglass" |
| Aerosmith (Pro) | [opdb.org/machines/2098](https://opdb.org/machines/2098) | "Backglass" |
| Black Knight: Sword of Rage (Pro) | [opdb.org/machines/2143](https://opdb.org/machines/2143) | "Backglass" |
| Deadpool (Premium) | [opdb.org/machines/2124](https://opdb.org/machines/2124) | "Backglass" |
| Jurassic Park (Pro) | [opdb.org/machines/2149](https://opdb.org/machines/2149) | "Backglass" |
| Spider-Man (Vault Edition) | [opdb.org/machines/2031](https://opdb.org/machines/2031) | "Backglass" |
| Star Wars (Pro) | [opdb.org/machines/2090](https://opdb.org/machines/2090) | "Translite" |
| The Getaway: High Speed II | [opdb.org/machines/1588](https://opdb.org/machines/1588) | "Backglass" |
| World Cup Soccer '94 | [opdb.org/machines/903](https://opdb.org/machines/903) | "Backglass" |

**Generically labeled "Image" photos** (OPDB contributors didn't type these, so every candidate photo on the machine's page was downloaded and visually inspected to confirm it actually showed translite/backbox marquee art — not a cabinet, playfield, or apron shot — before selecting one):

| Machine | OPDB machine page | Visual confirmation |
|---|---|---|
| Avengers: Infinity Quest (Pro) | [opdb.org/machines/2169](https://opdb.org/machines/2169) | Only 1 photo available; confirmed as backbox art (team + Thanos logo composition) |
| Batman '66 (Premium) | [opdb.org/machines/2021](https://opdb.org/machines/2021) | 4 candidates; picked the one clearly showing the backbox "BATMAN" logo w/ Robin and villains |
| Elvira's House of Horrors (Blood Red Kiss Edition) | [opdb.org/machines/2152](https://opdb.org/machines/2152) (shared "family" page — Elvira's LE/Premium/Blood Red Kiss/Signature/40th are all cataloged as aliases of one base machine) | Selected the alias/photo specifically tagged "Blood Red Kiss" on that page; confirmed red-and-black monochrome art matching Stern's press photos |
| Foo Fighters (Pro) | [opdb.org/machines/2245](https://opdb.org/machines/2245) | Only 1 photo available; confirmed as backbox art (band + van composition) |
| Godzilla (70th Anniversary Premium Edition) | [opdb.org/machines/2210](https://opdb.org/machines/2210) (shared page w/ Godzilla LE/Premium aliases) | Selected the alias/photo tagged "70th Anniversary"; confirmed monochrome black-and-white Japanese-poster-style art |
| Godzilla (Pro) | [opdb.org/machines/2209](https://opdb.org/machines/2209) | 2 candidates; picked the full-color backbox composition (vs. the other, a playfield shot) |
| James Bond 007 (Pro) | [opdb.org/machines/2240](https://opdb.org/machines/2240) | 2 candidates; picked the "DR. NO" movie-poster-style backbox art (the other was a playfield shot) |
| Jaws (Pro) | [opdb.org/machines/2270](https://opdb.org/machines/2270) | 2 candidates; picked the classic "JAWS" poster-style backbox art (the other was a playfield shot) |
| King Kong: Myth of Terror Island (Premium) | [opdb.org/machines/2407](https://opdb.org/machines/2407) (shared page w/ LE alias) | Selected the alias/photo tagged "Premium"; confirmed backbox art with full "KING KONG: MYTH OF TERROR ISLAND" logo |
| Pokémon (Premium) | [opdb.org/machines/2462](https://opdb.org/machines/2462) (shared page w/ LE alias) | Selected the alias/photo tagged "Premium"; confirmed backbox art with Pikachu + starter Pokémon composition |
| Rush (Pro) | [opdb.org/machines/2219](https://opdb.org/machines/2219) | 3 candidates; picked the "RUSH" logo + owl backbox art (the other two were a cabinet side and playfield shot) |
| The Simpsons Pinball Party | [opdb.org/machines/2003](https://opdb.org/machines/2003) | 3 candidates; picked the full-cast "Pinball Party" logo backbox art (the other two were playfield/cabinet shots) |
| Venom (Pro) | [opdb.org/machines/2261](https://opdb.org/machines/2261) | 3 candidates; picked the "VENOM" logo backbox art featuring Carnage (the other two were a playfield and cabinet-side shot) |

All 23 final image URLs were spot-checked with a direct request to confirm they return `200 OK` with an `image/jpeg` content type before being committed to the JSON file.

### Fallback plan (not needed)

The original plan allowed for falling back to official Stern-hosted product photography (`wp.sternpinball.com`) if OPDB had no usable translite photo for a given title. In practice, OPDB had at least one usable image for every single machine on this list, so no fallback images were needed.
