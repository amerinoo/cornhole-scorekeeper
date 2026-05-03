# cornhole-scorekeeper

App web para llevar puntuaciones de Cornhole en móvil y pantalla grande.

## Acceso rápido

App publicada: https://amerinoo.github.io/cornhole-scorekeeper/

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Firebase SDK
- Firestore
- Vitest

## Requisitos

- Node.js 20+
- npm 10+

## Publicación rápida

1. Crea un repositorio en GitHub llamado `cornhole-scorekeeper`.
2. Añade el remoto:

```bash
git remote add origin git@github.com:<tu-usuario>/cornhole-scorekeeper.git
```

3. Haz el primer commit y push:

```bash
git add .
git commit -m "Initial app setup"
git push -u origin main
```

4. En GitHub:

- Activa `Settings > Pages > Build and deployment > Source = GitHub Actions`
- Añade los secrets de Firebase indicados abajo

## Configuración

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo `.env.local` a partir de `.env.example`.

3. Arranca el entorno local:

```bash
npm run dev
```

## Scripts

- `npm run dev`: desarrollo local
- `npm run build`: build de producción
- `npm run preview`: previsualización local del build
- `npm run test`: tests unitarios
- `npm run test:watch`: tests en modo watch

## Estructura

```txt
src/
  app/
  components/
  features/
    games/
    players/
    stats/
  firebase/
  models/
  services/
  utils/
```

## Estado actual

Fase 1, Fase 2, Fase 3, Fase 4, Fase 5 y fase extra:

- Scaffold base de Vite + React + TypeScript
- Tailwind configurado
- Routing base y pantalla mínima de partida
- Firebase y Firestore conectados por entorno
- CRUD básico de jugadores
- Creación de partidas 1v1 y 2v2 en Firestore
- Pantalla de partida en tiempo real
- Registro y edición de rondas con recálculo del marcador
- Historial de partidas finalizadas
- Estadísticas globales por jugador y por color
- Pantalla de partidas en curso para continuar una partida activa
- Display mode de solo lectura para TV o proyector
- Workflow de deploy a GitHub Pages con GitHub Actions
- Soporte PWA instalable con manifest e iconos
- Code splitting por rutas y chunks separados de producción
- Modelos TypeScript estrictos
- Lógica pura de puntuación y validación con tests

## Firebase

La app no incluye autenticación ni reglas cerradas todavía. El archivo `.env.local` queda fuera de git y las credenciales reales no deben subirse al repositorio.

## GitHub Pages

El workflow está en [.github/workflows/deploy-pages.yml](./.github/workflows/deploy-pages.yml).

Antes de publicar:

1. Sube el repositorio a GitHub con el nombre `cornhole-scorekeeper`.
2. En GitHub, activa Pages con fuente `GitHub Actions`.
3. Crea estos secrets del repositorio:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

Después, cada push a `main` desplegará la app.

## PWA

La app incluye `manifest.webmanifest`, iconos y `service worker` para poder instalarse en móvil o escritorio.

- En navegadores compatibles se puede añadir a la pantalla de inicio o instalar como app.
- El shell principal queda cacheado para soporte offline básico.
- El contenido dinámico de Firestore sigue dependiendo de red cuando no exista en caché del navegador.

## Rutas profundas

GitHub Pages no resuelve rutas SPA como `/game/:gameId` por sí solo. El proyecto incluye `public/404.html` e hidratación temprana en [index.html](./index.html) para que enlaces profundos y refresh funcionen también en Pages.
