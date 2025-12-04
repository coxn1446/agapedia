# Agapedia

A Wikimedia-based knowledge platform that functions similarly to Wikipedia. This is a collaborative wiki platform built with React, Express.js, and PostgreSQL.

## Tech Stack

- **Frontend**: React, Redux Toolkit, Tailwind CSS, React Router DOM
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: Passport.js (Local, Google OAuth, Apple Sign In)
- **Real-time**: Socket.io
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js (latest LTS)
- PostgreSQL (latest)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd agapedia
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
NODE_ENV=development
REACT_APP_DB_host=localhost
REACT_APP_DB_port=5432
REACT_APP_DB_user=postgres
REACT_APP_DB_password=postgres
REACT_APP_DB_database=agapedia
REACT_APP_SESSION_SECRET=your-secret-key-here
```

4. Set up the database:
```bash
# Create the database
createdb agapedia

# Database schema will be added as features are developed
```

5. Start the development server:
```bash
# Terminal 1: Start the backend server
npm run server:dev

# Terminal 2: Start the React dev server
npm run start:dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
agapedia/
├── server/              # Backend server code
│   ├── config/          # Configuration files
│   ├── db/              # Database connection
│   ├── loaders/         # Express and Passport loaders
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── queries/         # SQL queries
│   └── socket/          # Socket.io setup
├── src/                 # Frontend React code
│   ├── components/      # React components
│   ├── routes/          # Route components
│   ├── store/           # Redux store
│   ├── helpers/         # Helper functions
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   └── tests/           # Test files
├── public/              # Static assets
├── serverIndex.js       # Server entry point
└── package.json         # Dependencies and scripts
```

## Available Scripts

- `npm start` - Start production server
- `npm run start:dev` - Start React dev server with HTTPS
- `npm run server:dev` - Start server with nodemon
- `npm run build` - Build for production
- `npm test` - Run tests

## Documentation

- `ARCHITECTURE.md` - Architecture documentation
- `DATABASE_SCHEMA.md` - Database schema documentation
- `TESTING_GUIDELINES.md` - Testing guidelines and best practices
- `APP_SHELL_PROMPT.md` - App shell generation prompt (for reference)

## Development

This is currently an app shell with no business logic. The structure is in place and ready for feature development.

### Adding Features

1. Create route file in `server/routes/`
2. Create service file in `server/services/`
3. Create query file in `server/queries/`
4. Create Redux reducer in `src/store/` (if needed)
5. Create components in `src/components/[Feature]/`
6. Add route in `src/components/App.js`
7. Update documentation

### Database Changes

**IMPORTANT**: Always update `DATABASE_SCHEMA.md` immediately after making any database changes.

## Testing

Run tests with:
```bash
npm test
```

See `TESTING_GUIDELINES.md` for testing best practices.

## Deployment

See `ARCHITECTURE.md` for deployment procedures and QA environment setup.

## License

[Add your license here]

## Contributing

[Add contributing guidelines here]

