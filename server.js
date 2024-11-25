// Required Dependencies
const express = require('express'); // Express framework for building the web server
const path = require('path'); // For working with file and directory paths
const mongoose = require('mongoose'); // Mongoose (ODM for MongoDB)
const cors = require('cors'); // For handling CORS issues
const http = require('http'); // Node.js HTTP module
const Chat = require('./models/Chat'); // Chat schema/model
const { Server } = require('socket.io'); // Socket.IO for real-time communication

// Initialize Express App
const app = express();

// Middleware Configuration
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS for all routes
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory
app.set('views', path.join(__dirname, 'views')); // Set views directory for EJS templates
app.set('view engine', 'ejs'); // Set EJS as the template engine

// MongoDB Connection
mongoose.connect(
    "mongodb+srv://ddugar:omDUX1qvsnZoGIDT@legosets.fsc8a.mongodb.net/?retryWrites=true&w=majority&appName=LegoSets",
    {
        useNewUrlParser: true, // Use new URL parser
        useUnifiedTopology: true, // Enable the new server discovery and monitoring engine
    }
).then(() => console.log("MongoDB connected"))
 .catch(err => console.error("MongoDB connection error:", err));

// Create HTTP Server for Socket.IO
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow only this origin
        methods: ["GET", "POST"], // Allowed HTTP methods
    },
});

// Routes
// Redirect root URL to /chats
app.get("/", (req, res) => {
    res.redirect('/chats');
});

// Render Chat Page with Chat History
app.get('/chats', async (req, res) => {
    try {
        const chats = await Chat.find().sort({ timestamp: 1 }); // Fetch and sort chat history by timestamp
        res.render('index', { chats }); // Render the 'index.ejs' view with chat data
    } catch (err) {
        res.status(500).json({ error: err.message }); // Handle errors with status 500
    }
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id); // Log when a user connects

    // Listen for 'sendMessage' event
    socket.on('sendMessage', async (data) => {
        const { username, message } = data;
        try {
            // Save message to MongoDB
            const chat = new Chat({ username, message });
            await chat.save();

            // Broadcast message to all connected clients
            io.emit('receiveMessage', data);
        } catch (err) {
            console.error('Error saving message:', err); // Log any errors
        }
    });

    // Handle User Disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id); // Log when a user disconnects
    });
});

// Start the Server
const PORT = 3000; // Define the port to listen on
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`); // Log server URL
});
