import http from 'http';
import express from 'express'
import { setupWebSocket } from './config/websocket';

const PORT = process.env.PORT || 4000;
const app = express();

const server = http.createServer(app);
setupWebSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});