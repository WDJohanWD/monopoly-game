// Tipos para el juego de Monopoly

export interface PlayerDto {
  id: string;
  name: string;
  money: number;
  position: number;
  color: string;
  status: string;
  turnsInJail: number;
  properties: PropertyDto[];
}

export interface PropertyDto {
  id: string;
  name: string;
  price: number;
  rent: number;
  colorGroup?: string;
  ownerId?: string;
  ownerName?: string;
  houses: number;
  hotels: number;
  mortgaged: boolean;
}

export interface TileDto {
  id: number;
  name: string;
  type: number; // TileType enum from backend
  position: number;
  property?: PropertyDto;
}

export interface BoardDto {
  id: string;
  tiles: TileDto[];
}

export interface GameDto {
  id: string;
  status: string;
  players: PlayerDto[];
  board?: BoardDto;
  currentTurnPlayerId?: string;
  round: number;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface DiceRollDto {
  id: string;
  die1: number;
  die2: number;
  total: number;
  isDouble: boolean;
  rolledAt: string;
  turnId: string;
}

export interface DiceRollResponse {
  diceRoll: DiceRollDto;
  newPosition: number;
  canBuyProperty: boolean;
  mustPayRent: boolean;
  landedOnProperty?: PropertyDto;
  specialAction?: string;
  isInJail: boolean;
  turnsInJail: number;
}

export interface PlayerPosition {
  playerId: string;
  currentPosition: number;
  targetPosition: number;
  isMoving: boolean;
}

export const TileTypeEnum = {
  Go: 0,
  Property: 1,
  CommunityChest: 2,
  IncomeTax: 3,
  Railroad: 4,
  Chance: 5,
  Jail: 6,
  FreeParking: 7,
  GoToJail: 8,
  LuxuryTax: 9,
  Utility: 10,
} as const;

export type TileTypeEnum = typeof TileTypeEnum[keyof typeof TileTypeEnum];

export interface GameState {
  currentPlayer: PlayerDto | null;
  players: PlayerDto[];
  board: BoardDto | null;
  status: 'waiting' | 'rolling' | 'moving' | 'action' | 'finished';
  round: number;
}
