# Gynx

Gynx is a real-time multiplayer maze arena game built with TypeScript, Phaser, and WebSockets. Players move through a generated maze, fire projectiles, and try to eliminate opponents while surviving until only one player remains.

## Features

- Real-time multiplayer gameplay over WebSockets
- Procedurally generated maze arena
- Player movement and projectile shooting
- Health-based combat and elimination flow
- Win/lose end-of-match states
- Client-server architecture for synchronized gameplay

## Tech Stack

- Frontend: TypeScript, Phaser,
- Backend: Node.js, WebSockets
- Game state: Server-authoritative updates for movement and combat

## Project Structure

```bash
.
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.*
├── server/
│   ├── src/
│   └── package.json
├── shared/
├── package.json
└── README.md
```

## Getting Started

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Start the server

From the `server` directory:

```bash
node src/networking/server.js
```

### 3. Start the client

From the `client` directory:

```bash
npm run dev
```

Then open the local Vite URL in your browser.

## Controls

- Move: WASD or Arrow Keys
- Shoot: Spacebar

## Notes

- The client currently connects to the local WebSocket server at `ws://localhost:8000`.
- To allow players on other machines to connect, update the client WebSocket URL to your public IP or a tunnel endpoint.
- The server is the authority for multiplayer timing, gameplay state, and win/loss resolution.
