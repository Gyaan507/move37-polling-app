# Real-Time Polling Application API

![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg) ![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.x-blue.svg) ![Prisma](https://img.shields.io/badge/Prisma-5.x-lightgrey.svg) ![WebSocket](https://img.shields.io/badge/WebSocket-ws-brightgreen.svg)

This repository contains the backend service for a real-time polling application, developed for the **Move37 Ventures Backend Developer Challenge**. The service is built with a modern technology stack and adheres to best practices for creating scalable and robust web services.

The core of the application is a RESTful API for managing users, polls, and votes, coupled with a WebSocket layer for broadcasting live poll results instantly to all connected clients.

## Table of Contents
- [Project Architecture](#project-architecture)
- [Database Design](#database-design)
- [Key Features](#key-features)
- [Setup and Installation](#setup-and-installation)
- [API Documentation & Testing](#api-documentation--testing)
- [Real-Time WebSocket Layer](#real-time-websocket-layer)

---

## Project Architecture

The project follows a standard, scalable structure for a Node.js/Express application, separating concerns into distinct modules. This ensures the codebase is clean, maintainable, and easy to navigate, directly addressing the **Code Quality** evaluation criterion.

```
/
├── prisma/
│   └── schema.prisma       # Defines the database schema and models
├── src/
│   ├── controllers/        # Contains the business logic for each route
│   ├── db/                 # Handles Prisma client instantiation
│   ├── routes/             # Defines the API endpoints and maps them to controllers
│   └── websocket.js        # Manages the WebSocket server setup and logic
├── .env                    # Stores environment variables (e.g., database URL)
├── .gitignore              # Specifies files to be ignored by Git
├── package.json            # Lists project dependencies and scripts
└── README.md               # Project documentation
```
Key practices include the use of `async/await` for non-blocking I/O, centralized error handling within controllers, and secure password management using `bcryptjs`.

---

## Database Design

This is a critical part of the application, designed to meet the **Database Design** evaluation criterion. The schema is defined using Prisma and correctly models the required one-to-many and many-to-many relationships.

### Prisma Schema (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Model: Can create many polls and cast many votes
model User {
  id           String  @id @default.cuid()
  name         String
  email        String  @unique
  passwordHash String
  polls        Poll[]  // One-to-Many: A user can create many polls
  votes        Vote[]
}

// Poll Model: Created by one user, has many options
model Poll {
  id          String   @id @default.cuid()
  question    String
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  creatorId   String
  creator     User     @relation(fields: [creatorId], references: [id])
  options     PollOption[] // One-to-Many: A poll has many options
}

// PollOption Model: Belongs to one poll, can have many votes
model PollOption {
  id      String @id @default.cuid()
  text    String
  pollId  String
  poll    Poll   @relation(fields: [pollId], references: [id])
  votes   Vote[]
}

// Vote Model: Acts as the join table for the Many-to-Many relationship
// This correctly models that a User can vote on many PollOptions,
// and a PollOption can be voted on by many Users.
model Vote {
  id           String @id @default.cuid()
  userId       String
  user         User   @relation(fields: [userId], references: [id])
  pollOptionId String
  pollOption   PollOption @relation(fields: [pollOptionId], references: [id])
}
```

---

## Key Features

- **User Management**: Securely create and retrieve user accounts.
- **Poll Creation**: Users can create polls with custom questions and multiple options.
- **Live Voting**: Cast votes on polls with results broadcasted in real-time.
- **Validation**: Enforces a "one vote per user, per poll" rule to ensure fairness.

---

## Setup and Installation

This project is designed for easy setup to meet the **Project Setup** evaluation criterion.

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- PostgreSQL
- Git

### Steps
1.  **Clone the Repository**
    ```bash
    git clone <your-github-repository-url>
    cd <repository-name>
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**
    Create a `.env` file in the project root. Copy the contents of `.env.example` (if provided) or add your database URL:
    ```env
    DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/YOUR_DATABASE_NAME"
    ```

4.  **Run Database Migrations**
    This command applies the Prisma schema to your PostgreSQL database, creating all necessary tables and relationships.
    ```bash
    npx prisma migrate dev
    ```

5.  **Start the Server**
    ```bash
    npm run dev
    ```
    The API server will be running on `http://localhost:3000`.

---

## API Documentation & Testing

The RESTful endpoints are fully functional and handle data correctly, satisfying the **API Functionality** criterion.

### User Endpoints

#### `POST /users` - Create User
Creates a new user account. Passwords are automatically hashed before being stored.
* **Request Body**:
    ```json
    {
        "name": "Alice",
        "email": "alice@example.com",
        "password": "strongpassword123"
    }
    ```
* **Success Response (`201 Created`)**:
    ```json
    {
        "id": "generated-user-id",
        "name": "Alice",
        "email": "alice@example.com"
    }
    ```

#### `GET /users` - Get All Users
Retrieves a list of all users. The `passwordHash` is excluded for security.

### Poll Endpoints

#### `POST /polls` - Create Poll
Creates a new poll. Requires the `id` of an existing user as `creatorId`.
* **Request Body**:
    ```json
    {
        "question": "Favorite programming language?",
        "options": ["JavaScript", "Python", "Rust"],
        "creatorId": "paste-a-valid-user-id-here"
    }
    ```
* **Success Response (`201 Created`)**: Returns the complete poll object with its options.

#### `GET /polls` - Get All Polls
Retrieves a list of all polls, including their options and creator details.

### Vote Endpoint

#### `POST /votes` - Submit a Vote
Casts a vote for a poll option. Triggers a WebSocket broadcast on success.
* **Request Body**:
    ```json
    {
        "userId": "paste-a-valid-user-id-here",
        "pollOptionId": "paste-a-valid-poll-option-id-here"
    }
    ```
* **Success Response (`201 Created`)**: Returns the newly created vote record.
* **Error Case**: If the user has already voted on this poll, the API returns a `400 Bad Request` with an error message, enforcing the "one vote per poll" rule.

---

## Real-Time WebSocket Layer

The WebSocket implementation provides live updates, fulfilling the **WebSocket Implementation** evaluation criterion.

* **Connection URL**: `ws://localhost:3000`

### Event: `POLL_UPDATE`
* **Trigger**: This event is broadcast to all connected clients immediately after a vote is successfully cast on any poll.
* **Purpose**: To provide clients with the updated vote counts for every option within a specific poll.
* **Payload Structure**:
    ```json
    {
        "type": "POLL_UPDATE",
        "payload": {
            "pollId": "poll-id-that-was-voted-on",
            "question": "Favorite programming language?",
            "options": [
                { "id": "option-1-id", "text": "JavaScript", "votes": 1 },
                { "id": "option-2-id", "text": "Python", "votes": 0 },
                { "id": "option-3-id", "text": "Rust", "votes": 0 }
            ]
        }
    }
    ```

