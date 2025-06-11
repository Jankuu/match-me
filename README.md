# match-me

A full-stack matchmaking and chat application.

## Overview

**match-me** is a web application that allows users to register, log in, find matches, chat in real time, and manage their profiles. The project is split into a React frontend and a Spring Boot backend, communicating via REST APIs and WebSockets.

---

## Features
- User registration and authentication (JWT-based)
- User profile management
- Matchmaking system
- Real-time chat between matched users
- Responsive design for mobile and desktop
- Settings and user preferences

---

## Tech Stack

### Frontend
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (build tool)
- [React Router](https://reactrouter.com/) (routing)
- [Bootstrap](https://getbootstrap.com/) & [React Bootstrap](https://react-bootstrap.github.io/) (UI)
- [Axios](https://axios-http.com/) (HTTP requests)
- [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) (real-time chat)

### Backend
- [Spring Boot](https://spring.io/projects/spring-boot) (v3.4.4)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa) (database access)
- [Spring Security](https://spring.io/projects/spring-security) (authentication)
- [JWT](https://jwt.io/) (token-based auth)
- [WebSocket](https://spring.io/guides/gs/messaging-stomp-websocket/) (real-time communication)
- [PostgreSQL](https://www.postgresql.org/) (database)
- [Hibernate Spatial](https://hibernate.org/spatial/) (geolocation)

---

## Directory Structure

```
match-me/
├── backend/      # Spring Boot backend
│   └── src/
│       └── main/java/com/example/demo/
│           ├── entities/           # JPA entities
│           ├── restControllers/    # REST API controllers
│           ├── webSocket/          # WebSocket config/handlers
│           ├── socketControllers/  # WebSocket controllers
│           ├── repositories/       # Data access layer
│           ├── services/           # Business logic
│           ├── dTOs/               # Data Transfer Objects
│           ├── security/           # Security configuration
│           ├── validators/         # Input validation
│           ├── exceptions/         # Custom exception handling
│           ├── constraints/        # Custom constraints
│           ├── projections/        # JPA projections
│           ├── utilities/          # Utility classes
│           └── DemoApplication.java
├── frontend/     # React frontend
│   └── src/
│       ├── components/             # React components
│       ├── pages/                  # Page components (Login, Register, Chat, etc.)
│       ├── hooks/                  # Custom React hooks
│       ├── utils/                  # Utility functions
│       ├── providers/              # Context providers
│       ├── styles/                 # CSS/SCSS files
│       ├── types/                  # TypeScript type definitions
│       ├── public/                 # Static assets
│       ├── App.tsx                 # Main app logic and routing
│       ├── main.tsx                # Entry point
│       ├── App.css                 # Global styles
│       └── vite-env.d.ts           # Vite environment types
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Java 21
- Maven
- PostgreSQL (running and accessible)

### Backend Setup
1. **Configure Database:**
   - Set your PostgreSQL credentials and database URL in `backend/src/main/resources/application.properties` (create if missing).
2. **Install dependencies & build:**
   ```sh
   cd backend
   mvn clean install
   ```
3. **Run the backend:**
   ```sh
   mvn spring-boot:run
   ```
   The backend will start on [http://localhost:8080](http://localhost:8080).

### Frontend Setup
1. **Install dependencies:**
   ```sh
   cd frontend
   npm install
   ```
2. **Run the frontend:**
   ```sh
   npm run dev
   ```
   The frontend will start on [http://localhost:5173](http://localhost:5173) (default Vite port).

---

## Usage
- Open the frontend URL in your browser.
- Register a new user or log in.
- Set up your profile and start matching!
- Chat with matched users in real time.

---

## Development
- **Frontend:** Edit files in `frontend/src/` and use Vite's hot reload.
- **Backend:** Edit files in `backend/src/main/java/` and restart the Spring Boot server.

---

## License
This project is for educational purposes. Add your license here if needed.

## Environment Variables

### Backend
- Create a file `backend/src/main/resources/application.properties` (or `application.yml`) with the following variables:
  ```
  spring.datasource.url=jdbc:postgresql://localhost:5432/your_database_name
  spring.datasource.username=your_username
  spring.datasource.password=your_password
  spring.jpa.hibernate.ddl-auto=update
  spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
  server.port=8080
  ```

### Frontend
- Create a `.env` file in the `frontend/` directory with the following variables:
  ```
  VITE_API_URL=http://localhost:8080
  VITE_WS_URL=ws://localhost:8080/ws
  ```

## API Documentation

### Backend API Endpoints

- **Authentication:**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Log in and receive a JWT token

- **User Management:**
  - `GET /api/users/me` - Get current user profile
  - `PUT /api/users/me` - Update current user profile
  - `GET /api/users/{id}` - Get user profile by ID

- **Matching:**
  - `GET /api/matches` - Get potential matches
  - `POST /api/matches/{id}/like` - Like a user
  - `POST /api/matches/{id}/dislike` - Dislike a user

- **Chat:**
  - `GET /api/chats` - Get user's chat history
  - `GET /api/chats/{id}/messages` - Get messages for a specific chat
  - `POST /api/chats/{id}/messages` - Send a message in a chat

- **WebSocket:**
  - `/ws` - WebSocket endpoint for real-time chat

