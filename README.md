# Typi - Typing Practice App

A minimalist typing practice application built with Astro.js, Tailwind CSS, Better Auth, and MongoDB.

![Typi Preview](./public/preview.jpg)

## Features

- **Minimalist Design**: Clean, distraction-free interface with dark/light mode
- **Word Highlighting**: Current word is highlighted while typing
- **Colorful Letter Display**: Correct/incorrect letters shown in different colors
- **Error Prevention**: Can't advance until correct key is pressed
- **Time Tracking**: Counts up instead of countdown
- **Anonymous Authentication**: No sign-up required, automatic anonymous sessions
- **Best Score Tracking**: Persistent storage of your best WPM in MongoDB
- **Responsive Design**: Works on all screen sizes with proper word wrapping

## Prerequisites

- Node.js 20+
- Docker and Docker Compose (for MongoDB)

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   cd typi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB with Docker**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - MongoDB on `localhost:27017`
   - Mongo Express (DB Admin UI) on `localhost:8081`

4. **Set up environment variables**

   The `.env` file is already configured for Docker setup:
   ```env
   MONGODB_URI=mongodb://localhost:27017/typi
   AUTH_SECRET=dev-secret-key-change-in-production-12345678
   PUBLIC_APP_URL=http://localhost:4324
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:4321`

## Docker Commands

### Start MongoDB
```bash
docker-compose up -d
```

### Stop MongoDB
```bash
docker-compose down
```

### View MongoDB logs
```bash
docker-compose logs -f mongodb
```

### Access Mongo Express (Database UI)
Open `http://localhost:8081` in your browser
- Username: `admin`
- Password: `admin`

### Remove MongoDB data and start fresh
```bash
docker-compose down -v
docker-compose up -d
```

## Project Structure

```
typi/
├── src/
│   ├── lib/
│   │   ├── auth.ts           # Better Auth server configuration
│   │   └── auth-client.ts    # Better Auth client
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...all].ts  # Better Auth handler
│   │   │   └── score.ts      # WPM score API
│   │   └── index.astro       # Main app page
│   └── styles/
│       └── global.css        # Tailwind styles
├── docker-compose.yml        # MongoDB setup
├── Dockerfile                # App containerization
└── .env                      # Environment variables
```

## How to Play

1. Start typing when the page loads
2. Correct letters turn darker (white in dark mode)
3. The current letter has an underline cursor
4. Wrong keys don't advance - you must press the correct key
5. Use backspace to go back
6. Complete the text to see your final score
7. Press any key to start a new session

## Stats Tracked

- **WPM**: Words per minute (live calculation)
- **Accuracy**: Percentage of correct keystrokes
- **Time**: Elapsed time in seconds
- **Best**: Your highest WPM score (saved to MongoDB)

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `AUTH_SECRET`: Secret key for Better Auth sessions
- `PUBLIC_APP_URL`: Your app's base URL
- `PUBLIC_GA_MEASUREMENT_ID`: (Optional) Google Analytics 4 measurement ID for page and event tracking

## Production Deployment

1. **Update environment variables** in `.env`:
   - Change `AUTH_SECRET` to a secure random string
   - Update `MONGODB_URI` to your production MongoDB instance
   - Set `PUBLIC_APP_URL` to your production domain

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Deploy** using your preferred hosting platform (Vercel, Netlify, etc.)

## Tech Stack

- **Framework**: Astro.js 5.x
- **Styling**: Tailwind CSS 4.x
- **Authentication**: Better Auth with anonymous sessions
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose
- **TypeScript**: Strict mode enabled

## Future Features

- Global leaderboard
- Custom text input
- Difficulty levels
- User profiles (optional)
- Statistics dashboard

## License

MIT
