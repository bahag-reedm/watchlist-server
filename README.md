# Movie Watchlist API — Backend

A RESTful API built with Express.js for managing a personal movie watchlist. Supports user authentication (JWT), CRUD operations on watchlists, movie search via TMDB, and user comments/ratings.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database:** PostgreSQL
- **ORM:** Sequelize 6
- **Auth:** JSON Web Tokens (jsonwebtoken + bcryptjs)
- **External API:** [The Movie Database (TMDB)](https://www.themoviedb.org/)

## Prerequisites

- Node.js (v18+)
- PostgreSQL database
- TMDB API key ([get one here](https://developer.themoviedb.org/docs/getting-started))

## Getting Started

### 1. Clone the repository

```bash
git clone <your-backend-repo-url>
cd watchlist-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
PORT=3000

DB_NAME=your_db_name
DB_PASS=your_db_password
DB_PORT=5432
DB_HOST=localhost
DB_DIALECT=postgres

JWT_SECRET=your_jwt_secret

TMDB_BEARER_TOKEN=your_tmdb_api_key
```

### 4. Set up the database

Create a PostgreSQL database matching your `DB_NAME`, then start the server — Sequelize will auto-sync the tables.

### 5. Start the server

```bash
node index.js
```

The server runs at `http://localhost:3000`.

## API Endpoints

### Authentication

| Method | Endpoint             | Auth | Description          |
|--------|----------------------|------|----------------------|
| POST   | `/api/auth/register` | No   | Register a new user  |
| POST   | `/api/auth/login`    | No   | Login & receive JWT  |

### Movies / Watchlist

| Method | Endpoint                       | Auth | Description                     |
|--------|--------------------------------|------|---------------------------------|
| GET    | `/api/movies/search?q=<query>` | Yes  | Search movies via TMDB          |
| POST   | `/api/movies/add-to-watchlist`  | Yes  | Add a movie to your watchlist   |
| GET    | `/api/movies/watchlist`         | Yes  | Get your full watchlist         |
| PATCH  | `/api/movies/:id`              | Yes  | Toggle watched status           |
| DELETE | `/api/movies/:id`              | Yes  | Remove from watchlist           |

### Comments

| Method | Endpoint                  | Auth | Description                        |
|--------|---------------------------|------|------------------------------------|
| POST   | `/api/comments`           | Yes  | Add a comment & rating to a movie  |
| GET    | `/api/comments/:movieId`  | Yes  | Get all comments for a movie       |
| DELETE | `/api/comments/:id`       | Yes  | Delete a comment                   |

### Authentication Header

All protected routes require a JWT in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens expire after **2 days**.

## Database Models

### Users
| Field    | Type   | Notes                    |
|----------|--------|--------------------------|
| id       | INT    | Primary key, auto-increment |
| username | STRING | Required                 |
| email    | STRING | Required, unique         |
| password | STRING | Required, bcrypt hashed  |

### Movies
| Field          | Type    | Notes                          |
|----------------|---------|--------------------------------|
| id             | INT     | Primary key, auto-increment    |
| tmdb_id        | INT     | Unique, links to TMDB          |
| name           | STRING  | Required                       |
| poster_url     | STRING  | Required                       |
| genre          | STRING  | Comma-separated                |
| runtime        | INT     | In minutes                     |
| overall_rating | INT     | 1–10 scale                     |

### WatchList
| Field    | Type    | Notes                         |
|----------|---------|-------------------------------|
| id       | INT     | Primary key, auto-increment   |
| user_id  | INT     | FK → Users                    |
| movie_id | INT     | FK → Movies                   |
| watched  | BOOLEAN | Default: false                |

### Comments
| Field    | Type | Notes                       |
|----------|------|-----------------------------|
| id       | INT  | Primary key, auto-increment |
| user_id  | INT  | FK → Users                  |
| movie_id | INT  | FK → Movies                 |
| comment  | TEXT | Required                    |
| rating   | INT  | Optional, 1–10              |

## Project Structure

```
watchlist-backend/
├── index.js             # Entry point, Express server setup
├── controllers/         # Route handler logic
├── routes/              # Route definitions
├── models/              # Sequelize models
├── middleware/           # JWT auth middleware
├── db/                  # Database connection config
├── .env.example         # Environment variables template
└── package.json
```
