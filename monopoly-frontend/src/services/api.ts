import type { 
  GameDto, 
  PlayerDto, 
  PropertyDto, 
  TileDto, 
  BoardDto,
  DiceRollResponse 
} from '../types/game.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5093/api';

export interface CreateGameRequest {
  players: Array<{
    name: string;
    color: string;
  }>;
  startingMoney: number;
}

export interface GameResponse {
  success: boolean;
  data?: GameDto;
  message?: string;
  errors?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Re-export tipos desde game.types
export type { 
  GameDto, 
  PlayerDto, 
  PropertyDto, 
  TileDto, 
  BoardDto,
  DiceRollResponse 
};

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

// Función para unir un jugador al juego
export async function joinGame(gameId: string, playerName: string): Promise<GameResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerName }),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Error al unirse al juego',
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

// Función para lanzar dados
export async function rollDice(gameId: string, playerId: string): Promise<ApiResponse<DiceRollResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/roll?playerId=${playerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Error al lanzar dados',
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

// Función para comprar una propiedad
export interface BuyPropertyRequest {
  propertyId: string;
}

export async function buyProperty(
  gameId: string, 
  playerId: string, 
  buyPropertyDto: BuyPropertyRequest
): Promise<GameResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/buy?playerId=${playerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buyPropertyDto),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Error al comprar propiedad',
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

// Función para terminar turno
export async function endTurn(gameId: string, playerId: string): Promise<GameResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/end-turn?playerId=${playerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Error al terminar turno',
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

// Función para pagar fianza de la cárcel ($50)
export async function payJailFine(gameId: string, playerId: string): Promise<GameResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/pay-jail-fine?playerId=${playerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Error al pagar fianza',
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
