// Procedural drawing for the sandbox world.
// All graphics are generated with Phaser's Graphics API — no external art needed.

// ---------- Palettes -------------------------------------------------------

export const SKIN_TONES = [0xffd9b3, 0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0x5c3a21];
export const HAIR_COLORS = [0x2c1b0e, 0x6b3e26, 0xb5651d, 0xe2b04a, 0xd94f4f, 0x4f6bd9, 0x8d8d8d, 0xe85ab8];
export const SHIRT_COLORS = [0xff6b6b, 0x4ecdc4, 0xffd93d, 0x6bc36b, 0x9b6bff, 0xff9f43, 0x54a0ff, 0xff7ab8];
export const PANTS_COLORS = [0x2c3e50, 0x34495e, 0x7f5539, 0x16537e, 0x5d3a3a, 0x3d3d3d, 0xff4fa3];
export const SHOE_COLORS = [0xffffff, 0x2b2b2b, 0xff7ab8, 0x54a0ff, 0xff5252];

// Named presets recreating specific kids from photos. Selectable in the
// wardrobe; Elizabeth is the starting character.
export const PRESETS = [
  // Blonde long hair, fair skin, all-pink outfit, white sneakers.
  { name: 'Elizabeth', skin: 0, hair: 3, hairStyle: 1, shirt: 7, pants: 6, shoe: 0, hat: -1 },
  // Ginger short hair, fair skin, blue shirt, dark trousers, dark shoes.
  { name: 'Cristian', skin: 0, hair: 2, hairStyle: 0, shirt: 6, pants: 0, shoe: 1, hat: -1 },
];

// ---------- Character (live container, recolorable) ------------------------

// Builds a modular character as a Phaser container so the wardrobe can
// restyle it live without regenerating textures.
export function buildCharacter(scene, opts = {}) {
  const cfg = Object.assign(
    { skin: 0, hair: 0, shirt: 0, pants: 0, shoe: 1, hat: -1, hairStyle: 0, name: '' },
    opts
  );

  const container = scene.add.container(0, 0);
  const g = scene.add.graphics();
  container.add(g);
  container.setSize(64, 110);

  let facing = 1;

  function redraw() {
    g.clear();
    const skin = SKIN_TONES[cfg.skin];
    const hair = HAIR_COLORS[cfg.hair];
    const shirt = SHIRT_COLORS[cfg.shirt];
    const pants = PANTS_COLORS[cfg.pants];
    const shoe = SHOE_COLORS[cfg.shoe] ?? 0x2b2b2b;

    // Legs
    g.fillStyle(pants, 1);
    g.fillRoundedRect(-16, 50, 12, 34, 5);
    g.fillRoundedRect(4, 50, 12, 34, 5);
    // Shoes
    g.fillStyle(shoe, 1);
    g.fillRoundedRect(-18, 80, 16, 8, 4);
    g.fillRoundedRect(2, 80, 16, 8, 4);

    // Torso / shirt
    g.fillStyle(shirt, 1);
    g.fillRoundedRect(-20, 8, 40, 48, 12);
    // Arms
    g.fillStyle(shirt, 1);
    g.fillRoundedRect(-28, 12, 11, 34, 5);
    g.fillRoundedRect(17, 12, 11, 34, 5);
    // Hands
    g.fillStyle(skin, 1);
    g.fillCircle(-23, 47, 6);
    g.fillCircle(23, 47, 6);

    // Head
    g.fillStyle(skin, 1);
    g.fillCircle(0, -14, 22);

    // Hair styles
    g.fillStyle(hair, 1);
    if (cfg.hairStyle === 0) {
      // short rounded
      g.fillCircle(0, -22, 22);
      g.fillStyle(skin, 1);
      g.fillRect(-22, -16, 44, 18);
    } else if (cfg.hairStyle === 1) {
      // long hair
      g.fillCircle(0, -22, 22);
      g.fillRoundedRect(-24, -22, 12, 44, 6);
      g.fillRoundedRect(12, -22, 12, 44, 6);
      g.fillStyle(skin, 1);
      g.fillRect(-20, -16, 40, 16);
    } else {
      // spiky / mohawk
      for (let i = -3; i <= 3; i++) {
        g.fillTriangle(i * 6 - 4, -28, i * 6 + 4, -28, i * 6, -44);
      }
      g.fillRoundedRect(-20, -30, 40, 12, 4);
      g.fillStyle(skin, 1);
      g.fillRect(-22, -16, 44, 16);
    }

    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-8 * facing, -14, 5);
    g.fillCircle(6 * facing, -14, 5);
    g.fillStyle(0x222222, 1);
    g.fillCircle(-7 * facing, -13, 2.5);
    g.fillCircle(7 * facing, -13, 2.5);
    // Smile
    g.lineStyle(2.5, 0x9c4a3a, 1);
    g.beginPath();
    g.arc(0, -6, 7, 0.15 * Math.PI, 0.85 * Math.PI);
    g.strokePath();

    // Hat (optional)
    if (cfg.hat >= 0) {
      const hatColor = SHIRT_COLORS[cfg.hat];
      g.fillStyle(hatColor, 1);
      g.fillRoundedRect(-24, -34, 48, 8, 4); // brim
      g.fillRoundedRect(-16, -48, 32, 18, 6); // top
    }
  }

  redraw();

  return {
    container,
    cfg,
    setStyle(key, value) {
      cfg[key] = value;
      redraw();
    },
    face(dir) {
      if (dir !== 0 && dir !== facing) {
        facing = dir;
        redraw();
      }
    },
  };
}

// ---------- Furniture / decoration items -----------------------------------

// Each entry draws into a graphics object inside a w×h box (origin 0,0).
// Boot generates a texture per item; rooms place them as draggable sprites.
export const ITEMS = [
  {
    key: 'sofa', label: 'Sofá', w: 120, h: 70, room: 'house',
    draw(g) {
      g.fillStyle(0xff6b6b, 1);
      g.fillRoundedRect(0, 20, 120, 50, 12);
      g.fillRoundedRect(0, 0, 18, 50, 8);
      g.fillRoundedRect(102, 0, 18, 50, 8);
      g.fillStyle(0xe85a5a, 1);
      g.fillRoundedRect(22, 8, 35, 28, 8);
      g.fillRoundedRect(63, 8, 35, 28, 8);
    },
  },
  {
    key: 'lamp', label: 'Lámpara', w: 50, h: 110, room: 'house',
    draw(g) {
      g.fillStyle(0x8d6e63, 1);
      g.fillRect(22, 30, 6, 70);
      g.fillStyle(0x5d4037, 1);
      g.fillRoundedRect(10, 96, 30, 8, 4);
      g.fillStyle(0xffe082, 1);
      g.fillTriangle(8, 30, 42, 30, 25, 0);
    },
  },
  {
    key: 'plant', label: 'Planta', w: 60, h: 90, room: 'house',
    draw(g) {
      g.fillStyle(0xd17a3a, 1);
      g.fillRoundedRect(14, 60, 32, 30, 6);
      g.fillStyle(0x4caf50, 1);
      g.fillCircle(30, 40, 22);
      g.fillCircle(16, 50, 14);
      g.fillCircle(44, 50, 14);
      g.fillStyle(0x66bb6a, 1);
      g.fillCircle(30, 30, 14);
    },
  },
  {
    key: 'tv', label: 'TV', w: 100, h: 70, room: 'house',
    draw(g) {
      g.fillStyle(0x263238, 1);
      g.fillRoundedRect(0, 0, 100, 60, 8);
      g.fillStyle(0x4fc3f7, 1);
      g.fillRoundedRect(6, 6, 88, 48, 4);
      g.fillStyle(0x37474f, 1);
      g.fillRect(44, 60, 12, 8);
      g.fillRect(30, 66, 40, 4);
    },
  },
  {
    key: 'bed', label: 'Cama', w: 130, h: 70, room: 'bedroom',
    draw(g) {
      g.fillStyle(0x8d6e63, 1);
      g.fillRoundedRect(0, 10, 130, 55, 8);
      g.fillStyle(0xfff3e0, 1);
      g.fillRoundedRect(6, 26, 118, 34, 6);
      g.fillStyle(0x9b6bff, 1);
      g.fillRoundedRect(6, 26, 50, 34, 6);
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(12, 30, 36, 22, 6);
    },
  },
  {
    key: 'rug', label: 'Alfombra', w: 120, h: 50, room: 'bedroom',
    draw(g) {
      g.fillStyle(0x4ecdc4, 1);
      g.fillEllipse(60, 25, 120, 50);
      g.fillStyle(0x3bb3ab, 1);
      g.fillEllipse(60, 25, 80, 32);
      g.fillStyle(0x9be7e2, 1);
      g.fillEllipse(60, 25, 40, 16);
    },
  },
  {
    key: 'tree', label: 'Árbol', w: 90, h: 120, room: 'park',
    draw(g) {
      g.fillStyle(0x795548, 1);
      g.fillRect(38, 70, 14, 50);
      g.fillStyle(0x43a047, 1);
      g.fillCircle(45, 45, 40);
      g.fillStyle(0x66bb6a, 1);
      g.fillCircle(28, 38, 22);
      g.fillCircle(62, 38, 22);
    },
  },
  {
    key: 'swing', label: 'Columpio', w: 90, h: 110, room: 'park',
    draw(g) {
      g.lineStyle(6, 0x9e9e9e, 1);
      g.beginPath(); g.moveTo(10, 0); g.lineTo(45, 0); g.lineTo(80, 0); g.strokePath();
      g.beginPath(); g.moveTo(10, 0); g.lineTo(0, 100); g.strokePath();
      g.beginPath(); g.moveTo(80, 0); g.lineTo(90, 100); g.strokePath();
      g.lineStyle(3, 0x6d4c41, 1);
      g.beginPath(); g.moveTo(35, 8); g.lineTo(35, 70); g.strokePath();
      g.beginPath(); g.moveTo(55, 8); g.lineTo(55, 70); g.strokePath();
      g.fillStyle(0xff9f43, 1);
      g.fillRoundedRect(28, 70, 34, 8, 3);
    },
  },
  {
    key: 'flower', label: 'Flores', w: 60, h: 70, room: 'park',
    draw(g) {
      g.fillStyle(0x43a047, 1);
      g.fillRect(28, 30, 4, 40);
      const petals = 0xff7ab8;
      g.fillStyle(petals, 1);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        g.fillCircle(30 + Math.cos(a) * 12, 24 + Math.sin(a) * 12, 8);
      }
      g.fillStyle(0xffd93d, 1);
      g.fillCircle(30, 24, 9);
    },
  },
  {
    key: 'cake', label: 'Pastel', w: 70, h: 70, room: 'shop',
    draw(g) {
      g.fillStyle(0xffe0b2, 1);
      g.fillRoundedRect(8, 30, 54, 36, 6);
      g.fillStyle(0xff7ab8, 1);
      g.fillRoundedRect(8, 22, 54, 14, 6);
      g.fillStyle(0xffffff, 1);
      for (let i = 0; i < 5; i++) g.fillCircle(14 + i * 10, 24, 3);
      g.fillStyle(0xffd93d, 1);
      g.fillRect(33, 6, 4, 16);
      g.fillStyle(0xff5252, 1);
      g.fillCircle(35, 6, 4);
    },
  },
  {
    key: 'balloon', label: 'Globo', w: 50, h: 100, room: 'shop',
    draw(g) {
      g.lineStyle(2, 0x9e9e9e, 1);
      g.beginPath(); g.moveTo(25, 55); g.lineTo(25, 100); g.strokePath();
      g.fillStyle(0xff5252, 1);
      g.fillEllipse(25, 30, 44, 54);
      g.fillStyle(0xff8a80, 1);
      g.fillEllipse(18, 22, 12, 18);
      g.fillTriangle(20, 54, 30, 54, 25, 60);
    },
  },
  {
    key: 'ball', label: 'Pelota', w: 56, h: 56, room: 'shop',
    draw(g) {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(28, 28, 26);
      g.fillStyle(0x54a0ff, 1);
      g.fillCircle(28, 28, 26);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(28, 28, 10);
      g.lineStyle(3, 0xffffff, 1);
      g.strokeCircle(28, 28, 20);
    },
  },
  {
    key: 'fridge', label: 'Nevera', w: 64, h: 110, room: 'kitchen',
    draw(g) {
      g.fillStyle(0xeceff1, 1);
      g.fillRoundedRect(4, 0, 56, 108, 8);
      g.fillStyle(0xcfd8dc, 1);
      g.fillRect(4, 52, 56, 4);
      g.fillStyle(0x90a4ae, 1);
      g.fillRoundedRect(50, 12, 5, 28, 2);
      g.fillRoundedRect(50, 62, 5, 28, 2);
    },
  },
  {
    key: 'stove', label: 'Cocina', w: 80, h: 78, room: 'kitchen',
    draw(g) {
      g.fillStyle(0xb0bec5, 1);
      g.fillRoundedRect(0, 20, 80, 58, 6);
      g.fillStyle(0x37474f, 1);
      g.fillRect(10, 34, 60, 38);
      g.fillStyle(0xff7043, 0.6);
      g.fillRect(14, 56, 52, 14);
      g.fillStyle(0x607d8b, 1);
      g.fillRoundedRect(8, 4, 64, 16, 6);
      g.fillStyle(0x263238, 1);
      g.fillCircle(24, 12, 6);
      g.fillCircle(56, 12, 6);
    },
  },
  {
    key: 'fruitbowl', label: 'Frutas', w: 64, h: 52, room: 'kitchen',
    draw(g) {
      g.fillStyle(0x8d6e63, 1);
      g.fillEllipse(32, 36, 56, 22);
      g.fillStyle(0xa1887f, 1);
      g.fillEllipse(32, 32, 50, 16);
      g.fillStyle(0xff5252, 1);
      g.fillCircle(22, 24, 10);
      g.fillStyle(0xffca28, 1);
      g.fillCircle(42, 22, 9);
      g.fillStyle(0x66bb6a, 1);
      g.fillCircle(32, 15, 8);
    },
  },
  {
    key: 'umbrella', label: 'Sombrilla', w: 90, h: 112, room: 'beach',
    draw(g) {
      g.fillStyle(0x8d6e63, 1);
      g.fillRect(43, 40, 4, 72);
      g.fillStyle(0xff5252, 1);
      g.fillTriangle(45, 0, 0, 45, 90, 45);
      g.fillStyle(0xffffff, 1);
      g.fillTriangle(45, 4, 16, 42, 31, 44);
      g.fillTriangle(45, 4, 74, 42, 59, 44);
    },
  },
  {
    key: 'sandcastle', label: 'Castillo', w: 80, h: 80, room: 'beach',
    draw(g) {
      g.fillStyle(0xffd54f, 1);
      g.fillRect(10, 40, 60, 40);
      g.fillRect(8, 26, 14, 54);
      g.fillRect(58, 26, 14, 54);
      g.fillRect(34, 22, 12, 58);
      g.fillStyle(0xffca28, 1);
      g.fillRect(10, 40, 60, 6);
      g.fillStyle(0xff5252, 1);
      g.fillRect(39, 10, 2, 12);
      g.fillTriangle(41, 10, 41, 20, 53, 15);
    },
  },
  {
    key: 'palm', label: 'Palmera', w: 92, h: 120, room: 'beach',
    draw(g) {
      g.fillStyle(0x8d6e63, 1);
      g.fillRect(40, 50, 12, 70);
      g.fillStyle(0x43a047, 1);
      g.fillEllipse(46, 44, 64, 20);
      g.fillEllipse(28, 40, 32, 38);
      g.fillEllipse(64, 40, 32, 38);
      g.fillStyle(0x66bb6a, 1);
      g.fillEllipse(46, 30, 42, 24);
      g.fillStyle(0x795548, 1);
      g.fillCircle(40, 52, 5);
      g.fillCircle(52, 52, 5);
    },
  },
];

// ---------- Room backgrounds (drawn directly into a scene) -----------------

export const LOCATIONS = [
  { key: 'house', name: 'Casa', wall: 0xffe0b2, floor: 0xd7a86e, accent: 0xff6b6b },
  { key: 'bedroom', name: 'Dormitorio', wall: 0xd1c4e9, floor: 0xb39ddb, accent: 0x9b6bff },
  { key: 'kitchen', name: 'Cocina', wall: 0xfff9c4, floor: 0xbcaaa4, accent: 0xff7043 },
  { key: 'park', name: 'Parque', wall: 0x90caf9, floor: 0x81c784, accent: 0x43a047 },
  { key: 'beach', name: 'Playa', wall: 0x80d8ff, floor: 0xffe082, accent: 0x29b6f6 },
  { key: 'shop', name: 'Tienda', wall: 0xffccbc, floor: 0xffab91, accent: 0xff9f43 },
];

// Draws the static backdrop for a location into the given graphics object.
export function drawRoom(g, loc, width, height) {
  const floorY = height * 0.62;
  g.clear();
  // Wall / sky
  g.fillStyle(loc.wall, 1);
  g.fillRect(0, 0, width, floorY);
  // Floor / ground
  g.fillStyle(loc.floor, 1);
  g.fillRect(0, floorY, width, height - floorY);

  if (loc.key === 'park' || loc.key === 'beach') {
    // Sun + clouds
    g.fillStyle(0xfff176, 1);
    g.fillCircle(width - 50, 70, 34);
    g.fillStyle(0xffffff, 0.9);
    g.fillEllipse(80, 80, 90, 40);
    g.fillEllipse(140, 70, 70, 34);
  } else {
    // Window
    g.fillStyle(0x4fc3f7, 1);
    g.fillRoundedRect(width / 2 - 60, 60, 120, 90, 10);
    g.lineStyle(6, 0xffffff, 1);
    g.strokeRoundedRect(width / 2 - 60, 60, 120, 90, 10);
    g.beginPath();
    g.moveTo(width / 2, 60); g.lineTo(width / 2, 150);
    g.moveTo(width / 2 - 60, 105); g.lineTo(width / 2 + 60, 105);
    g.strokePath();
    g.fillStyle(0xfff176, 1);
    g.fillCircle(width / 2 + 30, 90, 16);
  }
  // Floor edge line
  g.lineStyle(4, 0x000000, 0.08);
  g.beginPath();
  g.moveTo(0, floorY); g.lineTo(width, floorY);
  g.strokePath();

  return floorY;
}

// ---------- World map planet ----------------------------------------------

export function drawPlanet(g, cx, cy, r) {
  g.fillStyle(0x6ec6f0, 1);
  g.fillCircle(cx, cy, r);
  // Land blobs
  g.fillStyle(0x7bd389, 1);
  g.fillEllipse(cx - r * 0.3, cy - r * 0.2, r * 0.8, r * 0.5);
  g.fillEllipse(cx + r * 0.35, cy + r * 0.25, r * 0.7, r * 0.45);
  g.fillEllipse(cx + r * 0.1, cy - r * 0.45, r * 0.5, r * 0.3);
  g.fillStyle(0x5bbf6b, 1);
  g.fillEllipse(cx - r * 0.4, cy + r * 0.35, r * 0.4, r * 0.25);
  // Shine
  g.fillStyle(0xffffff, 0.18);
  g.fillEllipse(cx - r * 0.35, cy - r * 0.4, r * 0.5, r * 0.3);
}
