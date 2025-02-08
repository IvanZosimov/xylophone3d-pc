import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { IClients } from './interfaces';
import { PORT } from './constants';
import { getIsMobileClient, getIsPcClient } from './utils';
import {
  onMobileClientConnection,
  onMobileClose,
  onMobileMessage,
  onPcCLientConnection,
  onPcClose,
  onUnknownDeviceTypeConnection,
} from './eventHandlers';

const app = express();

const server = createServer(app);

const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const clients: IClients = new Map();

wss.on('connection', (ws: WebSocket, request) => {
  const isPcClient = getIsPcClient(request);
  const isMobileClient = getIsMobileClient(request);

  if (isPcClient) {
    onPcCLientConnection(ws, clients);
  } else if (isMobileClient) {
    onMobileClientConnection(ws, request, clients);
  } else {
    onUnknownDeviceTypeConnection(ws);
  }

  if (isPcClient) {
    onPcClose(ws, clients);
  }

  if (isMobileClient) {
    onMobileMessage(ws, request, clients);
    onMobileClose(ws, request, clients);
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
});

server.listen(PORT, () =>
  console.log(`WebSocket Server running on port ${PORT}`)
);
