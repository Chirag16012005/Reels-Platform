const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const setupSocket = require("./src/socket");


connectDB();
const PORT = process.env.PORT || 8008;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

setupSocket(io);

console.log("Starting server...");
server.listen(PORT, () => {
    console.log(`server started at port ${PORT}`);
    console.log(`Socket.IO ready for connections`);
});