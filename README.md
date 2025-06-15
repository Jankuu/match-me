# match-me

A full-stack matchmaking and chat application aimed at gamers.

## Features
- User registration and authentication (JWT-based)
- Profile creation with interests and preferences.
- Matchmaking logic based on biographical data, users' played video games, and location.
- Real-time chat between matched users

## Tech Stack

### Frontend
- React + TypeScript + Vite
- React Router, Bootstrap, Axios
- WebSockets for real-time chat

### Backend
- Spring Boot (v3.4.4)
- Spring Data JPA, Spring Security
- JWT, WebSocket
- PostgreSQL with Hibernate Spatial

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
│           ├── utilities/          # Utility classes
│           └── DemoApplication.java
├── frontend/     # React frontend
│   └── src/
│       ├── components/             # React components
│       ├── pages/                  # Page components (Login, Register, Chat, etc.)
│       ├── hooks/                  # Custom React hooks
│       ├── utils/                  # Utility functions
│       ├── providers/              # Context providers
│       ├── styles/                 # CSS files
│       ├── types/                  # TypeScript type definitions
│       ├── public/                 # Static assets
│       ├── App.tsx                 # Main app logic and routing
│       ├── main.tsx                # Entry point
│       └── App.css                 # Global styles
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- Java 21
- Maven
- PostgreSQL

### Backend Setup
1. Configure database in `backend/src/main/resources/application.properties`:
   ```
   spring.datasource.url=jdbc:postgresql://localhost:5432/match_me
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   ```
2. Run the backend:
   ```sh
   cd backend
   mvn spring-boot:run
   ```
   The backend will start on [http://localhost:8080](http://localhost:8080).

### Frontend Setup
1. Install dependencies:
   ```sh
   cd frontend
   npm install
   ```
2. Run the frontend:
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


## Environment Variables

### Backend
- Create a file `backend/src/main/resources/application.properties` with the following variables:
  ```
  spring.datasource.url=jdbc:postgresql://localhost:5432/your_database_name
  spring.datasource.username=your_username
  spring.datasource.password=your_password
  spring.jpa.hibernate.ddl-auto=update
  spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
  server.port=8080
  
  jwt.secret=put-whatever-you-want-here-for-jwt-encryption
  ```

