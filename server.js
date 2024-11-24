const express = require('express'); // Setting up express server
const mongoose = require('mongoose'); // Mongoose (ODM for MongoDB)
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const Chat = require('./models/Chat');

// App setup
const app = express();

const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "https://proyo-chat-module.vercel.app",
        methods: ["GET", "POST"],
    },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// MongoDB setup
mongoose.connect("mongodb+srv://ddugar:omDUX1qvsnZoGIDT@legosets.fsc8a.mongodb.net/?retryWrites=true&w=majority&appName=LegoSets", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.get("/", (req, res) => {
    res.redirect('/chats')
})

// API route to fetch chat history
app.get('/chats', async (req, res) => {
    try {
        const chats = await Chat.find().sort({ timestamp: 1 });
        res.render('index',{chats});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for new messages
    socket.on('sendMessage', async (data) => {
        const { username, message } = data;
        try {
            // Save message to MongoDB
            const chat = new Chat({ username, message });
            await chat.save();

            // Broadcast message to all clients
            io.emit('receiveMessage', data);
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
