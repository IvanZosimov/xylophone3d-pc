import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import { IClient } from './interfaces';
import {
  DEVICE_TYPE_HEADER,
  DEVICE_TYPE_MOBILE,
  DEVICE_TYPE_PC,
  PC_CLIENT_UID,
} from './constants';
import { v4 as uuidv4 } from 'uuid';

export const createClientData = (ws: WebSocket): IClient => {
  const clientId = uuidv4();
  return {
    uid: clientId,
    ws,
  };
};

export const getIsPcClient = (request: IncomingMessage) => {
  const { headers } = request;

  return headers[DEVICE_TYPE_HEADER] === DEVICE_TYPE_PC;
};

export const getIsMobileClient = (request: IncomingMessage) => {
  const { headers } = request;

  const deviceTypeHeader = headers[DEVICE_TYPE_HEADER];
  const pcClientUid = headers[PC_CLIENT_UID];
  const isMobile = deviceTypeHeader === DEVICE_TYPE_MOBILE;
  const hasPcClientUid = !!pcClientUid;

  return isMobile && hasPcClientUid;
};

export const getPcClientUid = (
  request: IncomingMessage
): string | undefined => {
  const { headers } = request;
  const pcClientUid = headers[PC_CLIENT_UID];
  const isPcClientUidValid = typeof pcClientUid === 'string';

  if (pcClientUid && isPcClientUidValid) {
    return pcClientUid;
  }
};
