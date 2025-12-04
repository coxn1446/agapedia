# Architecture Documentation

> **IMPORTANT**: Keep this file updated as features are added or architecture changes.

## Last Updated
2025-01-15

## Table of Contents
- [Overview](#overview)
- [Tech Stack Summary](#tech-stack-summary)
- [System Architecture](#system-architecture)
  - [High-Level Diagram](#high-level-diagram)
- [Frontend Architecture](#frontend-architecture)
  - [Component Hierarchy](#component-hierarchy)
  - [State Management](#state-management)
  - [Routing](#routing)
  - [Styling System](#styling-system)
- [Backend Architecture](#backend-architecture)
  - [Request Flow](#request-flow)
  - [Service Layer Pattern](#service-layer-pattern)
  - [Authentication Flow](#authentication-flow)
  - [Real-time Communication](#real-time-communication)
- [Database Architecture](#database-architecture)
  - [Connection Management](#connection-management)
  - [Query Organization](#query-organization)
  - [Schema Documentation](#schema-documentation)
- [API Endpoints](#api-endpoints)
- [Features](#features)
- [Integration Points](#integration-points)
- [Security](#security)
- [Performance Optimizations](#performance-optimizations)
- [Deployment](#deployment)
- [Development Workflow](#development-workflow)
- [Testing Strategy](#testing-strategy)
- [Known Issues & Limitations](#known-issues--limitations)
- [Future Improvements](#future-improvements)
- [Notes](#notes)

## Overview
Agapedia is a Wikimedia-based knowledge platform that functions similarly to Wikipedia. It provides a collaborative environment for creating, editing, and organizing articles in a wiki-style format. The application uses MediaWiki as the backend wiki engine, with a custom React frontend and Express.js API server that proxies requests to MediaWiki's Action API. The system uses PostgreSQL for both Express session storage and MediaWiki wiki content storage.

For detailed tech stack, project structure, and configuration, see `APP_SHELL_PROMPT.md`.

## Tech Stack Summary
- Frontend: React (latest), Redux Toolkit (latest), Tailwind CSS (latest), React Router DOM (latest)
- Backend: Node.js (latest LTS), Express (latest), PostgreSQL (latest)
- Wiki Backend: MediaWiki (PHP/PostgreSQL) - handles all wiki operations, content storage, and WikiText parsing
- Authentication: Passport.js (latest) with MediaWiki authentication integration
- Real-time: Socket.io (latest)
- Cloud: Google Cloud Platform (latest) (Secret Manager, Storage, Cloud SQL)
- Build Tool: Create React App (latest)

## System Architecture

### High-Level Diagram
```
[React Frontend] → [Express API Server] → [MediaWiki Action API] → [MediaWiki (PHP/PostgreSQL)]
                                                      ↓
                                              [PostgreSQL (Sessions & Wiki Data)]
                                                      ↓
                                              [Socket.io]
```

## Frontend Architecture

### Component Hierarchy
```
App
└── BrowserRouter
    └── Routes
        ├── Nav (authenticated only)
        └── Route Components
            ├── Home
            ├── Login
            ├── Register
            ├── Articles (list)
            ├── Article (view)
            ├── ArticleEdit
            ├── ArticleCreate
            ├── ArticleHistory
            └── UserManagement (admin)
```

### State Management
- **Redux Store Structure**:
  - `auth`: Authentication state (user, isAuthenticated, isLoading, error)
  - `global`: Global app state (isLoading, notifications)
  - `article`: Article state (articles list, current article, parsed HTML, revisions, loading, error)

### Routing
- **Public Routes**: `/login`, `/register`
- **Private Routes**: All authenticated routes
  - `/` - Home
  - `/articles` - Article list
  - `/article/create` - Create article
  - `/article/:title` - View article
  - `/article/:title/edit` - Edit article
  - `/article/:title/history` - Revision history
  - `/admin/users` - User management (admin only)
- **Lazy Loading**: All route components are lazy loaded for code splitting

### Styling System
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Theme**: Primary color palette defined in `tailwind.config.js`
- **Custom Animations**: Fade-in and slide-up animations
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Backend Architecture

### Request Flow
```
HTTP Request
  → Express Middleware (CORS, body parsing, sessions, rate limiting)
  → Route Handler
  → MediaWiki Service (API client)
  → MediaWiki Action API
  → MediaWiki (PHP/MySQL)
  → Response (transformed for frontend)
```

### Service Layer Pattern
- **Routes** (`server/routes/`): Handle HTTP, validation, proxy to MediaWiki services
- **Services** (`server/services/`): MediaWiki API client, authentication, business logic
  - `mediawikiService.js`: Core MediaWiki Action API client
  - `mediawikiAuthService.js`: MediaWiki authentication integration
- **Config** (`server/config/`): MediaWiki API configuration

### Authentication Flow
1. User submits credentials via Express API
2. Express authenticates with MediaWiki Action API (`action=login`)
3. MediaWiki returns session cookies and user info
4. Express stores MediaWiki cookies and user info in Express session (PostgreSQL or memory)
5. User object includes MediaWiki groups/rights (sysop for admin, user for regular)
6. Subsequent requests use stored MediaWiki cookies for API calls
7. Express validates MediaWiki session on `/api/auth/me` requests

### Real-time Communication
- Socket.io for real-time features
- Connection tracking and cleanup
- Room-based messaging (to be implemented for collaborative editing)

### MediaWiki API Integration
- **API Client**: `server/services/mediawikiService.js` - Handles all MediaWiki Action API calls
- **Authentication**: MediaWiki login via `action=login`, session cookies stored in Express session
- **API Endpoints Used**:
  - `action=login` - User authentication
  - `action=query` - Query pages, revisions, user info, search
  - `action=edit` - Create/edit pages
  - `action=delete` - Delete pages
  - `action=parse` - Parse WikiText to HTML
  - `action=block` - Block users
  - `action=userrights` - Modify user groups
- **API Proxy Pattern**: Express routes proxy requests to MediaWiki, transform responses for frontend
- **Session Management**: MediaWiki cookies stored in Express session, sent with each API request
- **Error Handling**: MediaWiki API errors caught and transformed to Express-friendly error responses

## Database Architecture

### Database Systems
- **PostgreSQL**: Used by both Express (for session storage) and MediaWiki (for all wiki content, user data, revisions, and metadata)
- **Note**: MediaWiki supports PostgreSQL 10.0+ with PHP `pgsql` extension. While PostgreSQL works well for basic wiki functionality, some MediaWiki extensions may have limited PostgreSQL support.

### Connection Management
- Express: Connection pooling via `pg.Pool` for PostgreSQL (sessions)
- MediaWiki: Uses its own database connection management (PHP/PostgreSQL) for wiki data
- Both can use the same PostgreSQL instance with separate databases, or separate instances
- Health checks with retries
- Graceful shutdown handling
- Separate configs for dev/prod/qa

### Data Storage
- **Wiki Content**: Stored in MediaWiki's PostgreSQL database (pages, revisions, users, etc.)
- **Sessions**: Stored in PostgreSQL (both Express and MediaWiki sessions can use PostgreSQL)
- **Custom Data**: Can be stored in PostgreSQL for Express-specific features
- **Database Organization**: Can use separate databases on same PostgreSQL instance (e.g., `agapedia_sessions` and `agapedia_wiki`) or separate instances

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with MediaWiki (authenticates via MediaWiki Action API)
- `POST /api/auth/register` - User registration (note: MediaWiki API doesn't support user creation, users must be created via MediaWiki web interface)
- `GET /api/auth/google` - Initiate Google OAuth flow (to be implemented)
- `GET /api/auth/google/callback` - Google OAuth callback (to be implemented)
- `GET /api/auth/apple` - Initiate Apple Sign In flow (to be implemented)
- `POST /api/auth/apple/callback` - Apple Sign In callback (to be implemented)
- `POST /api/auth/logout` - Logout from both Express and MediaWiki
- `GET /api/auth/me` - Get current authenticated user (validates MediaWiki session)

### Articles
- `GET /api/articles` - List all articles (proxies to MediaWiki `action=query&list=allpages`)
- `GET /api/articles/search?q=...` - Search articles (proxies to MediaWiki `action=query&list=search`)
- `GET /api/articles/:title` - Get article content (proxies to MediaWiki `action=query&prop=revisions`)
- `GET /api/articles/:title/parse` - Get parsed HTML (proxies to MediaWiki `action=parse`)
- `GET /api/articles/:title/revisions` - Get revision history (proxies to MediaWiki `action=query&prop=revisions`)
- `POST /api/articles` - Create article (authenticated, proxies to MediaWiki `action=edit`)
- `PUT /api/articles/:title` - Edit article (authenticated, proxies to MediaWiki `action=edit`)
- `DELETE /api/articles/:title` - Delete article (admin only, proxies to MediaWiki `action=delete`)

### User Management (Admin)
- `GET /api/users` - List all users (admin only, proxies to MediaWiki `action=query&list=allusers`)
- `GET /api/users/:username` - Get user info and rights
- `PUT /api/users/:username/block` - Block/unblock user (admin only, proxies to MediaWiki `action=block`)
- `PUT /api/users/:username/role` - Modify user groups (admin only, proxies to MediaWiki `action=userrights`)

### Health Check
- `GET /api/health` - Server health check

## Features

### Authentication (MediaWiki Integration)
- **Description**: Full authentication with MediaWiki backend
- **Components**: 
  - `LoginForm` - Login form component
  - `Nav` - Navigation bar with logout and article links
- **Component Organization**: `src/components/Auth/`, `src/components/Nav/`
- **Routes**: `/login`, `/register`
- **State**: `auth` reducer
- **Features**: 
  - Login via MediaWiki Action API
  - Session management (Express + MediaWiki)
  - User role detection (admin/sysop vs regular user)
  - Logout from both systems
- **Backend**: `server/services/mediawikiAuthService.js`, `server/routes/auth.js`
- **Database**: MediaWiki PostgreSQL database for users, PostgreSQL for Express sessions

### Articles (MediaWiki Integration)
- **Description**: Full wiki article functionality via MediaWiki
- **Components**: 
  - `ArticleList` - Display list of all articles
  - `ArticleView` - Display article with parsed HTML
  - `ArticleEditor` - Edit article with WikiText input
  - `ArticleCreate` - Create new article form
  - `RevisionHistory` - Display article revision history
- **Component Organization**: `src/components/Articles/`
- **Routes**: `/articles`, `/article/:title`, `/article/:title/edit`, `/article/create`, `/article/:title/history`
- **State**: `article` reducer
- **Features**: 
  - List all articles
  - View articles with WikiText parsed to HTML
  - Create new articles
  - Edit existing articles
  - View revision history
  - Search articles
  - Delete articles (admin only)
- **Backend**: `server/services/mediawikiService.js`, `server/routes/articles.js`
- **WikiText Parsing**: Handled by MediaWiki `action=parse` API
- **Database**: MediaWiki PostgreSQL database

### User Management (Admin)
- **Description**: Admin interface for managing users
- **Components**: 
  - `UserManagement` - User management interface
- **Component Organization**: `src/routes/UserManagement.js`
- **Routes**: `/admin/users` (admin only)
- **Features**: 
  - List all users
  - Block/unblock users
  - Modify user roles (add/remove sysop group)
- **Backend**: `server/routes/users.js`
- **Database**: MediaWiki PostgreSQL database

## Integration Points

### External Services
- **Google Cloud Secret Manager (latest)**: Secrets management
- **Google Cloud Storage (latest)**: File storage (for article images, etc.)
- **Firebase (latest)**: Push notifications (if needed)
- **Stripe (latest)**: Payments (if needed)
- **Google Places API (latest)**: Location services (if needed)

## Security

### Authentication
- Session-based authentication
- Password hashing with bcrypt (latest)
- OAuth integration (Google, Apple)
- Session stored in database (production/QA) or memory (development)

### Authorization
- Route-level authentication middleware (to be implemented)
- User-based access control (to be implemented)
- Role-based permissions (to be implemented for wiki editing)

### Data Protection
- SQL injection prevention (parameterized queries)
- XSS prevention (CSP headers)
- CSRF protection (sameSite cookies)
- Rate limiting

## Performance Optimizations

### Frontend
- Code splitting by routes
- Lazy loading components
- Image optimization (to be implemented)
- Redux state normalization

### Backend
- Database connection pooling
- Query optimization
- Compression middleware (to be added)
- Rate limiting

## Deployment

### Environment Setup
- **Development**: Local environment
  - Local PostgreSQL database
  - Local file storage
  - Environment variables from `.env` file
- **QA**: Staging/QA environment (mirrors production)
  - Google Cloud Platform (App Engine, latest)
  - Cloud SQL (PostgreSQL, latest) - separate instance from production
  - Cloud Storage (latest) - separate bucket from production
  - Secret Manager (latest) - QA-specific secrets
  - QA-specific domain/URL
- **Production**: Google Cloud Platform (App Engine, latest)
  - Database: Cloud SQL (PostgreSQL, latest)
  - Storage: Google Cloud Storage (latest)
  - Secrets: Google Cloud Secret Manager (latest)

### QA Environment

#### Purpose
The QA environment serves as a staging environment that mirrors production for:
- Pre-production testing
- Client/stakeholder demos
- Integration testing with external services
- Performance testing
- User acceptance testing (UAT)

#### QA Environment Setup
1. **Create QA App Engine Service**:
   - Separate App Engine service for QA (e.g., `qa-service`)
   - QA-specific configuration in `app-qa.yaml`
   - QA-specific environment variables

2. **Database Setup**:
   - Create separate Cloud SQL instance for QA
   - Use same schema as production (sync from production or migrations)
   - Use test data (anonymized production data or synthetic data)
   - Regular database snapshots from production for realistic testing

3. **Storage Setup**:
   - Create separate Cloud Storage bucket for QA (e.g., `agapedia-qa-storage`)
   - Separate folders for different asset types
   - Test data/images separate from production

4. **Secrets Management**:
   - Create QA-specific secrets in Google Cloud Secret Manager
   - Use test API keys for external services (Stripe test mode, etc.)
   - QA-specific OAuth credentials (if applicable)
   - QA-specific Firebase project (recommended)

5. **Configuration**:
   - QA-specific CORS origins
   - QA-specific rate limiting (may be more lenient)
   - QA-specific logging levels (more verbose for debugging)

### Deployment Checklist

#### Pre-Production Deployment (via QA)
- [ ] Feature tested and approved in QA environment
- [ ] All QA tests passing
- [ ] Stakeholder approval received (if required)
- [ ] Database migrations tested in QA
- [ ] Performance tested in QA
- [ ] Security review completed (if applicable)
- [ ] Rollback plan documented

#### Production Deployment
- [ ] QA environment verified and stable
- [ ] Production secrets updated in Secret Manager
- [ ] Database backup created (if migrations included)
- [ ] Build tested locally
- [ ] Deploy to production
- [ ] Post-deployment verification
- [ ] Monitor logs and metrics
- [ ] Verify critical user paths

### Build Process
1. `npm run build` - Build React app
2. Deploy to QA environment for testing
3. After QA approval, deploy to production
4. Database migrations (if needed) - test in QA first

## Development Workflow

### Adding a New Feature
1. Create route file in `server/routes/`
2. Create service file in `server/services/`
3. Create query file in `server/queries/`
4. Create Redux reducer in `src/store/` (if needed)
5. Create components in `src/components/[Feature]/`
6. Add route in `src/components/App.js`
7. Update documentation (this file and DATABASE_SCHEMA.md)
8. Add tests

### Database Changes
1. Make database change
2. **IMMEDIATELY update DATABASE_SCHEMA.md**
3. Update queries if needed
4. Test thoroughly

## Testing Strategy

### Unit Tests
- Component tests
- Service tests
- Utility function tests

### Integration Tests
- API endpoint tests
- Database query tests

### Test Files Location
- `src/tests/` - Frontend tests
- `server/tests/` - Backend tests (if applicable)

## Known Issues & Limitations

- Authentication is not yet implemented (shell only)
- Database schema is not yet defined
- No wiki-specific features implemented yet

## Future Improvements

- Implement user authentication
- Design and implement database schema for articles, revisions, categories
- Build article creation and editing interface
- Implement wiki markup parser
- Add search functionality
- Implement user roles and permissions
- Add article history and revision tracking
- Implement categories and tagging system

## Notes

- This is an app shell with no business logic yet
- All routes and services are placeholder implementations
- Database connection is configured but schema is not yet defined
- The app is ready for feature development

