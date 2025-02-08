import {
  MESSAGE_ANOTHER_MOBILE_IS_CONNECTED,
  MESSAGE_MOBILE_CONNECTED,
  MESSAGE_MOBILE_DISCONNECTED,
  MESSAGE_MOBILE_DISCONNECTED_AS_PC_DISCONNECTED,
  MESSAGE_NO_DEVICE_TYPE_HEADER_PROVIDED,
  MESSAGE_NO_PC_UID_PROVIDED,
  MESSAGE_NO_PC_WITH_UID_CONNECTED,
  MESSAGE_PC_CONNECTED,
  MESSAGE_PC_DISCONNECTED,
} from './constants';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import {
  IClient,
  IClients,
  IClientsData,
  IMobileConnectionEvent,
  IMoveDataEvent,
  IPcConnectionEvent,
  IRotationDataEvent,
} from './interfaces';
import { createClientData, getPcClientUid } from './utils';

export const onPcCLientConnection = (ws: WebSocket, clients: IClients) => {
  try {
    const pcClientData: IClient = createClientData(ws);
    const clientsData: IClientsData = {
      pc: pcClientData,
    };

    const pcClientUid = pcClientData.uid;
    clients.set(pcClientUid, clientsData);
    const connectionEvent: IPcConnectionEvent = {
      type: 'pc-connection',
      uid: pcClientUid,
    };
    ws.send(JSON.stringify(connectionEvent));

    console.log(MESSAGE_PC_CONNECTED);
  } catch (error) {
    console.log(error);
    ws.close();
  }
};

export const onMobileClientConnection = (
  ws: WebSocket,
  request: IncomingMessage,
  clients: IClients
) => {
  try {
    const pcClientUid = getPcClientUid(request);

    if (pcClientUid) {
      const mobileClientData: IClient = createClientData(ws);
      const clientsData = clients.get(pcClientUid);
      const currentMobile = clientsData?.mobile;
      if (currentMobile) {
        ws.send(JSON.stringify({ error: MESSAGE_ANOTHER_MOBILE_IS_CONNECTED }));
        ws.close();
      } else if (clientsData) {
        clientsData.mobile = mobileClientData;
        console.log(MESSAGE_MOBILE_CONNECTED);
        const connectionEvent: IMobileConnectionEvent = {
          type: 'mobile-connection',
          isConnected: true,
        };

        clientsData.pc?.ws?.send(JSON.stringify(connectionEvent));
      } else {
        ws.send(JSON.stringify({ error: MESSAGE_NO_PC_WITH_UID_CONNECTED }));
        ws.close();
      }
    } else {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ error: MESSAGE_NO_PC_UID_PROVIDED }));
      }
      ws.close();
    }
  } catch (err) {
    console.log(err);
    ws.close();
  }
};

export const onUnknownDeviceTypeConnection = (ws: WebSocket) => {
  try {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({ error: MESSAGE_NO_DEVICE_TYPE_HEADER_PROVIDED })
      );
    }
    ws.close();
  } catch (error) {
    console.log(error);
    ws.close();
  }
};

export const onMobileMessage = (
  ws: WebSocket,
  request: IncomingMessage,
  clients: IClients
) => {
  ws.onmessage = (event) => {
    try {
      const message: IMoveDataEvent | IRotationDataEvent = JSON.parse(
        event.data as string
      );
      const pcClientUid = getPcClientUid(request);
      if (!pcClientUid) {
        return;
      }

      const client = clients.get(pcClientUid);
      if (!client) {
        return;
      }
      const { pc } = client;

      if (pc?.ws && pc.ws.readyState === WebSocket.OPEN) {
        const { ws } = pc;
        ws.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error(error);
    }
  };
};

export const onMobileClose = (
  ws: WebSocket,
  request: IncomingMessage,
  clients: IClients
) => {
  ws.onclose = () => {
    const pcClientUid = getPcClientUid(request);

    if (pcClientUid) {
      const clientsData = clients.get(pcClientUid);
      if (clientsData) {
        clientsData.mobile = undefined;
      }
      console.log(MESSAGE_MOBILE_DISCONNECTED);

      const connectionEvent: IMobileConnectionEvent = {
        type: 'mobile-connection',
        isConnected: false,
      };

      clientsData?.pc?.ws?.send(JSON.stringify(connectionEvent));
    }
  };
};

export const onPcClose = (ws: WebSocket, clients: IClients) => {
  ws.onclose = () => {
    const clientsData = clients.values();
    for (const client of clientsData) {
      const isCurrentPcClient = client.pc?.ws === ws;
      if (isCurrentPcClient) {
        const uid = client?.pc?.uid;
        const mobileClient = client?.mobile?.ws;

        if (mobileClient && mobileClient.readyState === WebSocket.OPEN) {
          mobileClient.send(
            JSON.stringify({
              error: MESSAGE_MOBILE_DISCONNECTED_AS_PC_DISCONNECTED,
            })
          );
          mobileClient.close();
        }

        if (uid) {
          clients.delete(uid);
        }

        break;
      }
    }

    console.log(MESSAGE_PC_DISCONNECTED);
  };
};
