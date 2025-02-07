import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();

const server = createServer(app);

const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

export interface MoveData {
  type: 'move';
  x: number;
  y: number;
  z: number;
}

export interface RotationData {
  type: 'rotate';
  x: number;
  y: number;
  z: number;
}

const clients: Map<string, WebSocket> = new Map();

wss.on('connection', (ws: WebSocket) => {
  const clientId = uuidv4();
  clients.set(clientId, ws);

  ws.onmessage = (event) => {
    try {
      const message: MoveData = JSON.parse(event.data as string);

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(JSON.stringify(message));
        }
      });
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('Client disconnected');
  };
});

const PORT = 8080;
server.listen(PORT, () =>
  console.log(`WebSocket Server running on ws://localhost:${PORT}`)
);
