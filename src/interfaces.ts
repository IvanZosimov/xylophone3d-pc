import { WebSocket } from 'ws';

export interface IMoveDataEvent {
  type: 'move';
  x: number;
  y: number;
  z: number;
}

export interface IRotationDataEvent {
  type: 'rotate';
  x: number;
  y: number;
  z: number;
}

export interface IPcConnectionEvent {
  type: 'pc-connection';
  uid: string;
}

export interface IMobileConnectionEvent {
  type: 'mobile-connection';
  isConnected: boolean;
}

export type IClient = {
  uid: string;
  ws?: WebSocket;
};

export type IClientsData = Partial<Record<'pc' | 'mobile', IClient>>;

export type IClients = Map<string, IClientsData>;
