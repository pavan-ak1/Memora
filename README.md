# Memora

Memora is a backend service for storing, managing, and sharing links you want to remember—acting as your digital second brain. Users can securely save links, organize them with tags, and share collections with others.

## Features
- User authentication (JWT-based)
- Add, retrieve, search, and delete personal content (links)
- Tagging and titling of content
- Shareable links for public access to collections
- Secure password storage (bcrypt)

## Tech Stack
- **Node.js** + **Express.js** (API server)
- **TypeScript** (type safety)
- **MongoDB** + **Mongoose** (database & ODM)
- **JWT** (authentication)
- **Zod** (input validation)
- **bcryptjs** (password hashing)
- **dotenv** (environment variables)
- **CORS** (cross-origin requests)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm
- MongoDB instance (local or cloud)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/pavan-ak1/Memora.git
   cd Memora/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1d
   PORT=5000
   ```

### Running the Server
- **Development:**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm run build
  npm start
  ```

The server will start on the port specified in your `.env` (default: 5000).

## Project Structure
```
backend/
  src/
    controllers/    # Route handler logic (auth, content)
    db/             # Database connection
    middleware/     # Express middleware (auth)
    model/          # Mongoose models (User, Content, Link)
    routes/         # API route definitions
    utils/          # Utility functions
    index.ts        # Entry point
  package.json      # Dependencies and scripts
  tsconfig.json     # TypeScript config
```

## API Overview

### Auth Routes (`/api/v1/auth`)
- `POST /signup` — Register a new user
- `POST /signin` — Login and receive JWT

### Content Routes (`/api/v1/contents`)
- `POST /` — Add new content (auth required)
- `GET /` — Get all user content (auth required)
- `GET /title?searchValue=...` — Search content by title (auth required)
- `DELETE /:id` — Delete content by ID (auth required)

### Share Routes (`/api/v1/`)
- `POST /brain/share` — Create or delete a shareable link (auth required)
- `GET /brain/:shareLink` — Get shared content by link

## Authentication
- Uses JWT for stateless authentication.
- Authenticated routes require an `Authorization: Bearer <token>` header.
- Passwords are hashed with bcrypt before storage.

## Database Models
- **User**: username (unique, required), password (hashed, required)
- **Content**: type, link, title, tags (array), user (reference)
- **Link**: hash (unique), user (reference)

## Environment Variables
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for signing JWTs
- `JWT_EXPIRES_IN`: JWT expiration (e.g., `1d`)
- `PORT`: Server port (default: 5000)

## License
[ISC](LICENSE)

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---
For more details, see the source code in each directory. 