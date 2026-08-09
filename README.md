# ReelVault 🎬

A full-stack short-video sharing platform built with **React, Node.js, Express.js, MongoDB, and Socket.IO**. ReelVault allows users to authenticate, create and participate in groups, share reels, interact through comments, and communicate through real-time group messaging.

## 🚀 Features

### Authentication & Authorization

* User registration and login
* JWT-based authentication
* Password hashing with bcrypt
* Protected API routes using authentication middleware
* Role/permission-based authorization for protected operations

### Reel Sharing

* Upload and share short-form videos
* Cloud-based video storage using Cloudinary
* Reel metadata persisted in MongoDB
* Like/comment and interaction functionality
* Group-based reel sharing

### Groups

* Create and manage groups
* Add and manage group members
* Share reels within groups
* Group-specific content and communication

### Real-Time Messaging

* Real-time group chat using **Socket.IO**
* Instant message delivery without polling
* Persistent message storage using MongoDB
* Group-based communication channels

### Backend APIs

* RESTful API architecture using Express.js
* Modular routing and controller structure
* Middleware-based authentication and authorization
* MongoDB schema design using Mongoose
* Centralized backend configuration and error handling

---

## 🏗️ Architecture

```text
                    ┌──────────────────┐
                    │   React Client   │
                    │                  │
                    │  UI / API Calls  │
                    │  Socket.IO       │
                    └────────┬─────────┘
                             │
                  HTTP / WebSocket
                             │
                             ▼
                    ┌──────────────────┐
                    │ Node.js +        │
                    │ Express.js       │
                    │                  │
                    │ Routes           │
                    │ Controllers      │
                    │ Middleware       │
                    └───────┬──────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
        ┌─────────────────┐    ┌─────────────────┐
        │    MongoDB      │    │   Cloudinary    │
        │                 │    │                 │
        │ Users           │    │ Video Storage   │
        │ Groups          │    │ Media Delivery  │
        │ Reels           │    │                 │
        │ Messages        │    └─────────────────┘
        │ Comments        │
        └─────────────────┘

              Socket.IO
                  │
                  ▼
        Real-Time Group Chat
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* CSS
* Socket.IO Client

### Backend

* Node.js
* Express.js
* Socket.IO
* JWT
* bcrypt
* Multer

### Database & Storage

* MongoDB
* Mongoose
* Cloudinary

### Development Tools

* Git & GitHub
* Postman
* VS Code
* npm

---

## 📂 Project Structure

```text
ReelVault/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── ...
│
├── server/
│   ├── config/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── socket.js
│   │
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🔄 Application Flow

### Authentication

```text
User
 │
 ▼
Login / Register
 │
 ▼
Express API
 │
 ├── Validate credentials
 ├── Verify password
 └── Generate JWT
 │
 ▼
Authenticated Client
```

Protected requests include the authentication token, which is validated by backend middleware before access to protected controllers.

### Video Upload

```text
React Client
     │
     ▼
Select Video
     │
     ▼
Multer
     │
     ▼
Express Backend
     │
     ▼
Cloudinary
     │
     ▼
Video URL + Metadata
     │
     ▼
MongoDB
```

The actual media file is stored in Cloudinary while application metadata and references are stored in MongoDB.

### Real-Time Messaging

```text
User A
  │
  │ Socket.IO
  ▼
Node.js / Socket.IO
  │
  ├──────► User B
  ├──────► User C
  └──────► User D
          │
          ▼
       MongoDB
```

Socket.IO provides real-time message delivery while MongoDB is used for persistent message storage.

---

## 🔐 Authentication & Security

ReelVault uses JWT-based authentication to protect backend resources.

The general request flow is:

```text
Client Request
      │
      ▼
Authentication Middleware
      │
      ├── Token missing/invalid → Reject
      │
      ▼
Token Verification
      │
      ▼
Authenticated User
      │
      ▼
Controller
```

Passwords are hashed using **bcrypt** rather than being stored in plaintext.

Protected operations are enforced through middleware before reaching the relevant controller.

---

## 📡 API Design

The backend follows a modular REST API structure.

Example route groups:

```text
/api/auth
/api/users
/api/groups
/api/reels
/api/comments
/api/messages
```

The backend separates responsibilities across:

```text
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Models
  ↓
MongoDB
```

This separation keeps request handling, authentication, business logic, and persistence concerns modular.

---

## 🗄️ Data Models

The application uses MongoDB with Mongoose for schema modeling.

Core entities include:

```text
User
 ├── authentication information
 └── group relationships

Group
 ├── members
 └── shared reels/messages

Reel
 ├── creator
 ├── media information
 └── interaction data

Comment
 ├── user
 ├── reel
 └── content

Message
 ├── sender
 ├── group
 └── message content
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Chirag16012005/ReelVault.git

cd ReelVault
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=8008

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CLIENT_URL=http://localhost:3000
```

> Never commit your `.env` file or expose API keys, database credentials, JWT secrets, or Cloudinary credentials.

### 5. Start the backend

```bash
cd server
npm start
```

### 6. Start the frontend

Open another terminal:

```bash
cd client
npm start
```

The application should now be available at:

```text
http://localhost:3000
```

---

## 🧪 API Testing

The REST APIs can be tested using tools such as **Postman**.

Recommended testing flow:

```text
1. Register / Login
        ↓
2. Obtain authentication token
        ↓
3. Access protected endpoints
        ↓
4. Create / Join group
        ↓
5. Upload reel
        ↓
6. Share reel in group
        ↓
7. Send messages using Socket.IO
```

---

## 💡 Engineering Highlights

Some of the key engineering challenges addressed in the project include:

* Designing modular REST APIs using Express.js
* Implementing JWT-based authentication middleware
* Modeling relationships between users, groups, reels, comments, and messages in MongoDB
* Handling multipart video uploads using Multer
* Integrating Cloudinary for external media storage
* Implementing real-time communication using Socket.IO
* Separating API routes, controllers, middleware, models, and configuration
* Persisting real-time messages while maintaining immediate client-side delivery

---

## 🔮 Future Improvements

Potential improvements include:

* Redis-based Socket.IO adapter for multi-instance deployments
* Redis caching for frequently accessed data
* Pagination and cursor-based feeds for large datasets
* Background processing for video transcoding
* Rate limiting for public APIs
* Improved input validation and request sanitization
* Automated unit and integration testing
* CI/CD pipeline
* Containerized deployment using Docker
* Centralized logging and application monitoring

---

## 📸 Screenshots

Add screenshots or a short demo GIF here.

Example:

```text
![Home Feed](./screenshots/home.png)

![Group Chat](./screenshots/chat.png)

![Reel Upload](./screenshots/upload.png)
```

---

## 👨‍💻 Author

**Chirag**

GitHub:
https://github.com/Chirag16012005

---

## 📄 License

This project is developed for educational and portfolio purposes.
