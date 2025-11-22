import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

console.log('[Server] Starting HP Chess server...');
console.log('[Server] __dirname:', __dirname);
console.log('[Server] Static files path:', path.join(__dirname, 'dist'));

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Game State
let players = {
    w: null,
    b: null
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Assign player role
    if (!players.w) {
        players.w = socket.id;
        socket.emit('player_role', 'w');
        console.log(`Assigned White to ${socket.id}`);
    } else if (!players.b) {
        players.b = socket.id;
        socket.emit('player_role', 'b');
        console.log(`Assigned Black to ${socket.id}`);
    } else {
        socket.emit('player_role', 'spectator');
        console.log(`Assigned Spectator to ${socket.id}`);
    }

    // Broadcast current player count/status
    io.emit('player_status', {
        w: !!players.w,
        b: !!players.b
    });

    // Handle Move
    socket.on('make_move', (moveData) => {
        // moveData: { from, to, color }
        // Relay to everyone else
        socket.broadcast.emit('opponent_move', moveData);
    });

    // Handle Reset
    socket.on('reset_game', () => {
        io.emit('reset_game');
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (players.w === socket.id) {
            players.w = null;
        } else if (players.b === socket.id) {
            players.b = null;
        }
        io.emit('player_status', {
            w: !!players.w,
            b: !!players.b
        });
    });
});

// Handle all other routes by serving index.html (SPA support)
app.get('*', (req, res) => {
    console.log('[Server] Serving index.html for:', req.url);
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
