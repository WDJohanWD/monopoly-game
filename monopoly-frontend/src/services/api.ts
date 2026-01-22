const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5093/api';

export interface CreateGameRequest {
  players: Array<{
    name: string;
    color: string;
  }>;
  startingMoney: number;
}

export interface PropertyDto {
  id: string;
  name: string;
  price: number;
  rent: number;
  colorGroup?: string;
  ownerId?: string;
  ownerName?: string;
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

export interface GameResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    players: PlayerDto[];
    board?: BoardDto;
  };
  message?: string;
  errors?: string[];
}

export async function createGame(request: CreateGameRequest): Promise<GameResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    // Verificar si la respuesta tiene contenido antes de parsear JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return {
        success: false,
        message: text || `Error del servidor: ${response.status} ${response.statusText}`,
      };
    }

    // Verificar si hay contenido para parsear
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        message: `Error del servidor: Respuesta vacía (${response.status} ${response.statusText})`,
      };
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      return {
        success: false,
        message: `Error al parsear respuesta: ${text.substring(0, 100)}`,
      };
    }
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Error al crear el juego',
        errors: data.errors,
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error de conexión',
    };
  }
}

export async function getGame(gameId: string): Promise<GameResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return {
        success: false,
        message: text || `Error del servidor: ${response.status} ${response.statusText}`,
      };
    }

    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        message: `Error del servidor: Respuesta vacía (${response.status} ${response.statusText})`,
      };
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      return {
        success: false,
        message: `Error al parsear respuesta: ${text.substring(0, 100)}`,
      };
    }
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Error al obtener el juego',
        errors: data.errors,
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error de conexión',
    };
  }
}
