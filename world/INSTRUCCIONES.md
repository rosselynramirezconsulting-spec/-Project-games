# Tiny Town — Instrucciones 🌍

Un juego creativo tipo **Toca Boca World**: un mundo abierto para explorar
lugares, decorar habitaciones y vestir personajes. No hay puntos, ni tiempo, ni
forma de perder — solo jugar libremente. Pensado para vivir como **un juego más**
dentro del portal **glitchrushgg.com**.

Incluye dos personajes ya creados a partir de tus fotos: **Elizabeth** y
**Cristian**.

---

## 1. Cómo se juega

- **Pantalla de inicio:** muestra tu personaje; toca **Jugar** para empezar.
- **Mapa del mundo (planeta):** toca un pin para entrar a un lugar
  — 🏠 Casa, 🛏️ Dormitorio, 🍳 Cocina, 🌳 Parque, 🏖️ Playa, 🛍️ Tienda.
- **Caminar:** dentro de un lugar, toca el suelo y el personaje camina hasta ahí.
- **Decorar:** toca un objeto del cajón de abajo para soltarlo en la escena;
  después arrástralo a donde quieras. Arrastra un objeto sobre la 🗑️ para
  borrarlo.
- **Vestir:** toca 👕 para abrir el **Vestidor**. Puedes elegir un personaje listo
  (**Elizabeth** o **Cristian**) o cambiar piel, pelo, peinado, camiseta,
  pantalón, zapatos y gorro. Pulsa **Listo** para guardar.
- **Volver al mapa:** toca 🌍.

Todo lo que construyes se **guarda solo** en el navegador (`localStorage`), así
que al volver encuentras tu mundo igual que lo dejaste.

---

## 2. Probarlo en tu ordenador

El juego usa módulos de JavaScript (`type="module"`), así que necesita un
servidor local (no vale abrir el archivo con doble clic).

```bash
# desde la carpeta que contiene "world"
python3 -m http.server 8080
# abre en el navegador:  http://localhost:8080/world/
```

O con Node:

```bash
npx serve .
# abre  http://localhost:8080/world/
```

> Phaser se carga desde un CDN — **no hay que instalar ni compilar nada**.

---

## 3. Publicarlo en glitchrushgg.com (portal con varios juegos)

Este juego es **autocontenido**: vive entero en la carpeta `world/` y no depende
de los otros juegos del portal. Para añadirlo:

1. Copia la carpeta `world/` dentro de tu sitio, por ejemplo en
   `glitchrushgg.com/world/`.
2. Enlázalo desde tu página de juegos:
   ```html
   <a href="/world/">Tiny Town 🌍</a>
   ```
3. (Opcional) Para incrustarlo dentro de otra página, usa un iframe:
   ```html
   <iframe src="/world/" style="width:100%;height:100%;border:0"></iframe>
   ```

Cada juego del portal puede ir en su propia carpeta (`/noah/`, `/world/`, …) y el
índice principal solo los enlaza. Así no se pisan entre ellos.

### Si usas GitHub Pages
- Sube la carpeta al repositorio.
- El juego quedará disponible en
  `https://<usuario>.github.io/<repo>/world/`.

---

## 4. Convertirlo en App (móvil)

El juego ya incluye un `manifest.webmanifest` y un icono (`icon.svg`), así que es
una **PWA instalable**. Dos caminos:

**A) Instalación directa (PWA, lo más rápido):**
- Abre `https://glitchrushgg.com/world/` en el móvil.
- En el menú del navegador elige **"Añadir a pantalla de inicio"**.
- Se abrirá a pantalla completa como una app, sin barra del navegador.

**B) App nativa para las tiendas (Capacitor):**
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Tiny Town" com.glitchrushgg.tinytown
# copia el contenido de la carpeta "world/" dentro de la carpeta "www"
npx cap add ios
npx cap add android
npx cap open ios      # o android
```
Como todo el arte es procedural y no hay backend, el mismo código funciona tal
cual dentro de la app, sin reescribir nada.

---

## 5. Personajes y cómo añadir más

Los personajes listos están definidos en `src/Draw.js`, en `PRESETS`:

```js
export const PRESETS = [
  { name: 'Elizabeth', skin: 0, hair: 3, hairStyle: 1, shirt: 7, pants: 6, shoe: 0, hat: -1 },
  { name: 'Cristian',  skin: 0, hair: 2, hairStyle: 0, shirt: 6, pants: 0, shoe: 1, hat: -1 },
];
```

Cada número es un índice dentro de las paletas del mismo archivo:
`SKIN_TONES`, `HAIR_COLORS`, `SHIRT_COLORS`, `PANTS_COLORS`, `SHOE_COLORS`.
`hairStyle`: 0 = corto, 1 = largo, 2 = punk. `hat: -1` significa sin gorro.

**Para añadir un personaje nuevo:** copia una línea, cámbiale el `name` y los
índices, y aparecerá automáticamente como botón en el Vestidor.

Elizabeth es el personaje con el que empieza el juego (definido en
`src/Store.js`). Las imágenes `elizabeth.svg` y `cristian.svg` que vienen en este
paquete son una previsualización de cómo se ven los avatares.

---

## 6. Estructura de archivos

```
world/
├── index.html              # Punto de entrada (+ enlace al manifest PWA)
├── style.css               # Diseño móvil a pantalla completa
├── manifest.webmanifest    # Datos para instalar como app
├── icon.svg                # Icono de la app
├── elizabeth.svg           # Previsualización del avatar Elizabeth
├── cristian.svg            # Previsualización del avatar Cristian
├── INSTRUCCIONES.md        # Este archivo
├── README.md               # Resumen en inglés
└── src/
    ├── main.js             # Configuración de Phaser y lista de escenas
    ├── Boot.js             # Genera las texturas de los objetos
    ├── MenuScene.js        # Pantalla de inicio / título
    ├── WorldScene.js       # El mapa / planeta con los lugares
    ├── RoomScene.js        # Sandbox: caminar, soltar y arrastrar objetos
    ├── WardrobeScene.js    # Vestidor y selección de personajes
    ├── Draw.js             # Todo el dibujo procedural + datos (paletas, presets)
    ├── Sound.js            # Efectos de sonido procedurales (Web Audio)
    └── Store.js            # Guardado/carga en localStorage
```

---

## 7. Notas técnicas

- 100% en el navegador, **sin paso de compilación**. Phaser se carga desde CDN.
- **Todo el arte es procedural** (se dibuja en tiempo real con la API de
  gráficos). No descarga imágenes ni audio.
- Probado en Chrome, Firefox y Safari de escritorio y móvil.
- Licencia libre para uso personal, educativo y comercial.
