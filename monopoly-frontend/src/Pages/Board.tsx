import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getGame, type TileDto, type PropertyDto } from "../services/api"
import { useTranslation } from "react-i18next"

// Mapeo de colores del backend a códigos hex
const COLOR_MAP: Record<string, string> = {
  "Brown": "#8B4513",
  "Light Blue": "#87CEEB",
  "Pink": "#FF69B4",
  "Orange": "#FFA500",
  "Red": "#FF0000",
  "Yellow": "#FFFF00",
  "Green": "#008000",
  "Dark Blue": "#0000FF",
  "Railroad": "#000000",
  "Utility": "#808080"
}

// Mapeo de TileType del backend a tipos del frontend
const mapTileType = (type: number): "property" | "railroad" | "utility" | "tax" | "chance" | "chest" | "corner" => {
  // TileType enum: Go=0, Property=1, CommunityChest=2, IncomeTax=3, Railroad=4, Chance=5, Jail=6, FreeParking=7, GoToJail=8, LuxuryTax=9, Utility=10
  switch (type) {
    case 0: return "corner" // Go
    case 1: return "property" // Property
    case 2: return "chest" // CommunityChest
    case 3: return "tax" // IncomeTax
    case 4: return "railroad" // Railroad
    case 5: return "chance" // Chance
    case 6: return "corner" // Jail
    case 7: return "corner" // FreeParking
    case 8: return "corner" // GoToJail
    case 9: return "tax" // LuxuryTax
    case 10: return "utility" // Utility
    default: return "corner"
  }
}

// Determina la posición visual basada en la posición del tablero (0-39)
const getVisualPosition = (position: number): "top" | "bottom" | "left" | "right" | "corner" => {
  if (position === 0) return "corner" // Go (bottom-right)
  if (position >= 1 && position <= 9) return "bottom" // Bottom row
  if (position === 10) return "corner" // Jail (bottom-left)
  if (position >= 11 && position <= 19) return "left" // Left column
  if (position === 20) return "corner" // Free Parking (top-left)
  if (position >= 21 && position <= 29) return "top" // Top row
  if (position === 30) return "corner" // Go To Jail (top-right)
  if (position >= 31 && position <= 39) return "right" // Right column
  return "corner"
}

interface BoardSpace {
  id: number
  name: string
  type: "property" | "railroad" | "utility" | "tax" | "chance" | "chest" | "corner"
  color?: string
  price?: number
  rent?: number
  ownerName?: string
  position: "top" | "bottom" | "left" | "right" | "corner"
  visualPosition: number
  property?: PropertyDto
}

interface BoardProps {
  gameId?: string
  onBack?: () => void
}

export function Board({ gameId: propGameId, onBack }: BoardProps) {
  const { gameId: paramGameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const gameId = propGameId || paramGameId

  const [boardSpaces, setBoardSpaces] = useState<BoardSpace[]>([])
  const [selectedSpace, setSelectedSpace] = useState<BoardSpace | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [players, setPlayers] = useState<Array<{ id: string; name: string; money: number; color: string }>>([])

  useEffect(() => {
    if (!gameId) {
      setError("No se proporcionó un ID de juego")
      setLoading(false)
      return
    }

    const fetchGame = async () => {
      try {
        setLoading(true)
        const response = await getGame(gameId)
        
        if (!response.success || !response.data) {
          setError(response.message || "Error al cargar el juego")
          setLoading(false)
          return
        }

        const game = response.data
        if (!game.board || !game.board.tiles) {
          setError("El juego no tiene tablero configurado")
          setLoading(false)
          return
        }

        setPlayers(game.players || [])

        // Convertir los tiles del backend a BoardSpace
        const spaces: BoardSpace[] = game.board.tiles
          .sort((a, b) => a.position - b.position)
          .map((tile: TileDto) => {
            const visualPos = getVisualPosition(tile.position)
            const space: BoardSpace = {
              id: tile.position,
              name: tile.name,
              type: mapTileType(tile.type),
              position: visualPos,
              visualPosition: tile.position,
              property: tile.property || undefined
            }

            // Agregar color si es una propiedad
            if (tile.property) {
              space.price = tile.property.price
              space.rent = tile.property.rent
              space.ownerName = tile.property.ownerName || undefined
              
              if (tile.property.colorGroup) {
                space.color = COLOR_MAP[tile.property.colorGroup] || "#CCCCCC"
              }
            }

            return space
          })

        setBoardSpaces(spaces)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [gameId])

  const getSpacesByPosition = (position: string) => {
    return boardSpaces.filter((space) => space.position === position)
  }

  const renderSpace = (space: BoardSpace, isVertical: boolean = false) => {
    const baseClasses = `
      relative flex flex-col items-center justify-center
      border-2 border-menu-border bg-menu-card
      cursor-pointer transition-all duration-150
      hover:bg-menu-button-hover hover:scale-105
      ${isVertical ? "w-full h-12" : "w-12 h-full"}
    `

    return (
      <div
        key={space.id}
        className={baseClasses}
        onClick={() => setSelectedSpace(space)}
      >
        {(space.type === "property" || space.type === "railroad" || space.type === "utility") && space.color && (
          <div
            className={`absolute ${isVertical ? "top-0 left-0 right-0 h-2" : "top-0 left-0 bottom-0 w-2"}`}
            style={{ backgroundColor: space.color }}
          />
        )}
        <span className="font-mono text-[6px] text-menu-button-text text-center leading-tight px-0.5">
          {space.name.slice(0, 8)}
        </span>
        {space.price && (
          <span className="font-mono text-[5px] text-menu-accent">${space.price}</span>
        )}
        {space.ownerName && (
          <span className="font-mono text-[4px] text-red-500">●</span>
        )}
      </div>
    )
  }

  const renderCorner = (space: BoardSpace) => {
    // Determinar qué esquina es
    let cornerClass = ""
    if (space.visualPosition === 0) cornerClass = "bg-green-200" // Go
    else if (space.visualPosition === 10) cornerClass = "bg-gray-300" // Jail
    else if (space.visualPosition === 20) cornerClass = "bg-yellow-200" // Free Parking
    else if (space.visualPosition === 30) cornerClass = "bg-red-200" // Go To Jail

    return (
      <div
        key={space.id}
        className={`w-16 h-16 flex items-center justify-center border-2 border-menu-border ${cornerClass} cursor-pointer hover:bg-menu-button-hover transition-all`}
        onClick={() => setSelectedSpace(space)}
      >
        <span className="font-mono text-[7px] font-bold text-menu-button-text text-center px-1">
          {space.name}
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-menu flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-xl text-menu-button-text">{t("loading") || "Cargando..."}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-menu flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-xl text-red-500 mb-4">{error}</p>
          {(onBack || gameId) && (
            <button
              onClick={() => onBack ? onBack() : navigate("/")}
              className="font-mono text-lg font-bold py-3 px-8 bg-menu-button border-4 border-menu-border text-menu-button-text shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,0.3)] hover:bg-menu-button-hover hover:text-menu-button-text-hover transition-all duration-150"
            >
              {t("back") || "VOLVER"}
            </button>
          )}
        </div>
      </div>
    )
  }

  const bottomSpaces = getSpacesByPosition("bottom")
  const leftSpaces = getSpacesByPosition("left")
  const topSpaces = getSpacesByPosition("top")
  const rightSpaces = getSpacesByPosition("right")
  const corners = getSpacesByPosition("corner").sort((a, b) => a.visualPosition - b.visualPosition)

  // Encontrar las esquinas específicas
  const goCorner = corners.find(c => c.visualPosition === 0)
  const jailCorner = corners.find(c => c.visualPosition === 10)
  const freeParkingCorner = corners.find(c => c.visualPosition === 20)
  const goToJailCorner = corners.find(c => c.visualPosition === 30)

  return (
    <div className="min-h-screen bg-menu flex flex-col items-center justify-center p-4">
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-menu-accent" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-menu-accent" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-menu-accent" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-menu-accent" />

      {/* Board */}
      <div className="bg-menu-card border-4 border-menu-border shadow-[8px_8px_0px_rgba(0,0,0,0.3)] p-1">
        <div className="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto]">
          {/* Top-left corner */}
          {freeParkingCorner && renderCorner(freeParkingCorner)}

          {/* Top row */}
          <div className="flex h-16">
            {topSpaces.sort((a, b) => a.visualPosition - b.visualPosition).map((space) => renderSpace(space))}
          </div>

          {/* Top-right corner */}
          {goToJailCorner && renderCorner(goToJailCorner)}

          {/* Left column */}
          <div className="flex flex-col w-16">
            {leftSpaces.sort((a, b) => b.visualPosition - a.visualPosition).map((space) => renderSpace(space, true))}
          </div>

          {/* Center area */}
          <div className="bg-[#c8e6c9] flex items-center justify-center min-w-[200px] min-h-[200px]">
            <div className="text-center">
              <h2 className="font-mono text-2xl font-bold text-menu-border tracking-wider">
                MONOPOOLY
              </h2>
              {selectedSpace && (
                <div className="mt-4 bg-menu-card border-2 border-menu-border p-2">
                  <p className="font-mono text-xs font-bold text-menu-button-text">
                    {selectedSpace.name}
                  </p>
                  {selectedSpace.price && (
                    <p className="font-mono text-sm text-menu-accent font-bold">
                      ${selectedSpace.price}
                    </p>
                  )}
                  {selectedSpace.rent && (
                    <p className="font-mono text-xs text-menu-button-text">
                      {t("rent") || "Alquiler"}: ${selectedSpace.rent}
                    </p>
                  )}
                  {selectedSpace.ownerName && (
                    <p className="font-mono text-xs text-red-500">
                      {t("owner") || "Dueño"}: {selectedSpace.ownerName}
                    </p>
                  )}
                </div>
              )}
              {players.length > 0 && (
                <div className="mt-4 bg-menu-card border-2 border-menu-border p-2">
                  <p className="font-mono text-xs font-bold text-menu-button-text mb-2">
                    {t("players") || "Jugadores"}
                  </p>
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center gap-2 mb-1">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-menu-border"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="font-mono text-xs text-menu-button-text">
                        {player.name}: ${player.money}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col w-16">
            {rightSpaces.sort((a, b) => a.visualPosition - b.visualPosition).map((space) => renderSpace(space, true))}
          </div>

          {/* Bottom-left corner */}
          {jailCorner && renderCorner(jailCorner)}

          {/* Bottom row */}
          <div className="flex h-16">
            {bottomSpaces.sort((a, b) => b.visualPosition - a.visualPosition).map((space) => renderSpace(space))}
          </div>

          {/* Bottom-right corner */}
          {goCorner && renderCorner(goCorner)}
        </div>
      </div>

      {/* Back button */}
      {(onBack || gameId) && (
        <button
          onClick={() => onBack ? onBack() : navigate("/")}
          className="mt-6 font-mono text-lg font-bold py-3 px-8 bg-menu-button border-4 border-menu-border text-menu-button-text shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,0.3)] hover:bg-menu-button-hover hover:text-menu-button-text-hover transition-all duration-150"
        >
          {t("back") || "VOLVER"}
        </button>
      )}

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 20px,
              currentColor 20px,
              currentColor 21px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 20px,
              currentColor 20px,
              currentColor 21px
            )`,
          }}
        />
      </div>
    </div>
  )
}
