# Tiny Town 🌍

A free-play creative sandbox for kids, in the spirit of **Toca Boca World** —
built with [Phaser 3](https://phaser.io/). No scores, no timers, no losing:
just explore places, decorate rooms and dress up your character.

This is a **standalone game** meant to live alongside other games on the
glitchrushgg portal. It has its own entry point (`world/index.html`) and shares
nothing with the other games in this repo.

## How to play

- **Start menu** — title screen with your character; tap **Jugar** to enter.
- **World map** — tap a pin (Casa, Dormitorio, Cocina, Parque, Playa, Tienda) to enter a place.
- **Walk** — tap the floor to send your character there.
- **Decorate** — tap an item in the bottom drawer to drop it in, then drag it
  anywhere. Drag an item onto the 🗑️ to remove it.
- **Dress up** — tap 👕 to open the wardrobe: change skin, hair color & style,
  shirt, pants and hat. Live preview, saved on *Listo*.
- **Back** — tap 🌍 to return to the map.

Everything you build **autosaves** to the browser (`localStorage`), so the world
is exactly how you left it next time.

## Tech

- Pure client-side, **zero build step**. Phaser loads from a CDN.
- **All art is procedural** — drawn at runtime with the Graphics API. No image
  or audio downloads.
- **Installable as an app** — ships a `manifest.webmanifest` + icon, so it can be
  added to a phone home screen (PWA) or wrapped with Capacitor/Cordova without
  changing the code.

## Run locally

ES modules need an HTTP server (not `file://`):

```bash
# from the repo root
python3 -m http.server 8080
# then open http://localhost:8080/world/
```

## File structure

```
world/
├── index.html              # Entry point (+ PWA manifest link)
├── style.css               # Mobile-first, full-bleed layout
├── manifest.webmanifest    # PWA install metadata
├── icon.svg                # App icon
└── src/
    ├── main.js             # Phaser config & scene list
    ├── Boot.js             # Generates item textures
    ├── MenuScene.js        # Title / start screen
    ├── WorldScene.js       # The planet / location map
    ├── RoomScene.js        # Core sandbox: walk, place & drag items
    ├── WardrobeScene.js    # Character customization
    ├── Draw.js             # All procedural drawing + data
    ├── Sound.js            # Procedural Web Audio sound effects
    └── Store.js            # localStorage save/load
```
