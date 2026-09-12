# Table Stakes Web Frontend

React-based frontend for Table Stakes poker game. Real-time multiplayer with live gameplay UI.

## Features

✅ **User Authentication** — Register, login, persistent sessions
✅ **Room Management** — Browse, create, and join poker rooms
✅ **Live Gameplay** — Real-time table UI with WebSocket updates
✅ **Hand History** — View game log and actions
✅ **Responsive Design** — Works on desktop and mobile
✅ **Beautiful UI** — Poker-themed design with smooth animations

## Tech Stack

- **React 18** — UI library
- **React Router** — Navigation
- **Axios** — HTTP client
- **WebSocket** — Real-time updates

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env` file

```bash
cp .env.example .env
```

Update with your backend URL:

```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=ws://localhost:3000
```

### 3. Start development server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
```

Deploy the `build/` folder to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:3000/api` |
| `REACT_APP_WS_URL` | WebSocket server URL | `ws://localhost:3000` |

## Deployment (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import this repository
4. Set environment variables
5. Deploy

Your app will be live at: `your-project.vercel.app`

## Pages

- `/login` — Authentication (register/login)
- `/` — Room browser and creation
- `/room/:roomCode` — Live poker game

## Components

- `Login` — User registration and login
- `Home` — Browse and create rooms
- `Game` — Main poker table UI

## License

MIT
