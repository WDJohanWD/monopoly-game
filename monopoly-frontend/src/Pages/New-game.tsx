import { Link } from "react-router-dom"
import { useState } from "react"

// interface CreateGameProps {
//   onBack: () => void
//   onCreateGame: (gameData: GameData) => void
// }

interface PlayerData {
  name: string
  color: string
}

export interface GameData {
  playerCount: number
  players: PlayerData[]
  startingMoney: number
}

const AVAILABLE_COLORS = [
  { name: "Rojo", value: "#e53935" },
  { name: "Azul", value: "#1e88e5" },
  { name: "Verde", value: "#43a047" },
  { name: "Amarillo", value: "#fdd835" },
  { name: "Naranja", value: "#fb8c00" },
  { name: "Morado", value: "#8e24aa" },
  { name: "Rosa", value: "#d81b60" },
  { name: "Cyan", value: "#00acc1" },
]

export function NewGame() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [playerCount, setPlayerCount] = useState(2)
  const [players, setPlayers] = useState<PlayerData[]>([
    { name: "", color: AVAILABLE_COLORS[0].value },
    { name: "", color: AVAILABLE_COLORS[1].value },
  ])
  const [startingMoney, setStartingMoney] = useState(1500)

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count)
    const newPlayers = [...players]
    while (newPlayers.length < count) {
      const usedColors = newPlayers.map((p) => p.color)
      const availableColor = AVAILABLE_COLORS.find((c) => !usedColors.includes(c.value))
      newPlayers.push({ name: "", color: availableColor?.value || AVAILABLE_COLORS[0].value })
    }
    setPlayers(newPlayers.slice(0, count))
  }

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayers = [...players]
    newPlayers[index].name = name
    setPlayers(newPlayers)
  }

  const handlePlayerColorChange = (index: number, color: string) => {
    const newPlayers = [...players]
    newPlayers[index].color = color
    setPlayers(newPlayers)
  }

  const getAvailableColors = (currentIndex: number) => {
    const usedColors = players.filter((_, i) => i !== currentIndex).map((p) => p.color)
    return AVAILABLE_COLORS.filter((c) => !usedColors.includes(c.value))
  }

//   const handleSubmit = () => {
//     const validPlayers = players.every((p) => p.name.trim() !== "")
//     if (!validPlayers) return
//     onCreateGame({ playerCount, players, startingMoney })
//   }

  const isFormValid = players.every((p) => p.name.trim() !== "")

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Player count selector */}
      <div className="w-full bg-menu-card border-4 border-menu-border p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
        <h3 className="font-mono text-lg font-bold text-menu-button-text mb-3">JUGADORES</h3>
        <div className="flex gap-2 justify-center">
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => handlePlayerCountChange(count)}
              className={`
                font-mono text-xl font-bold w-12 h-12 border-4 transition-all duration-150
                ${
                  playerCount === count
                    ? "bg-menu-accent border-menu-border text-white shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
                    : "bg-menu-card border-menu-border text-menu-button-text hover:bg-menu-button-hover"
                }
              `}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Players configuration */}
      <div className="w-full space-y-3 max-h-[40vh] overflow-y-auto">
        {players.map((player, index) => (
          <div
            key={index}
            className="bg-menu-card border-4 border-menu-border p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
          >
            <h3 className="font-mono text-sm font-bold text-menu-accent mb-2">JUGADOR {index + 1}</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre..."
                value={player.name}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                className="w-full font-mono text-base p-2 border-4 border-menu-border bg-menu-card text-menu-button-text placeholder:text-menu-button-text/50 focus:outline-none focus:border-menu-accent"
                maxLength={15}
              />
              <div className="flex gap-2 flex-wrap">
                {getAvailableColors(index).map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handlePlayerColorChange(index, color.value)}
                    title={color.name}
                    className={`
                      w-8 h-8 border-4 transition-all duration-150
                      ${
                        player.color === color.value
                          ? "border-menu-border scale-110 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
                          : "border-transparent hover:border-menu-border/50"
                      }
                    `}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Starting money */}
      <div className="w-full bg-menu-card border-4 border-menu-border p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
        <h3 className="font-mono text-lg font-bold text-menu-button-text mb-3">DINERO INICIAL</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {[1000, 1500, 2000, 2500].map((amount) => (
            <button
              key={amount}
              onClick={() => setStartingMoney(amount)}
              className={`
                font-mono text-sm font-bold px-3 py-2 border-4 transition-all duration-150
                ${
                  startingMoney === amount
                    ? "bg-menu-accent border-menu-border text-white shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
                    : "bg-menu-card border-menu-border text-menu-button-text hover:bg-menu-button-hover"
                }
              `}
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 w-full">
        <Link
          to="/"
          onMouseEnter={() => setHoveredButton("back")}
          onMouseLeave={() => setHoveredButton(null)}
          className={`
            flex-1 font-mono text-lg font-bold py-4 px-6 
            bg-menu-button border-4 border-menu-border
            transition-all duration-150 ease-out
            ${
              hoveredButton === "back"
                ? "translate-x-1 -translate-y-1 shadow-[6px_6px_0px_rgba(0,0,0,0.3)] bg-menu-button-hover text-menu-button-text-hover"
                : "shadow-[4px_4px_0px_rgba(0,0,0,0.2)] text-menu-button-text"
            }
          `}
        >
          VOLVER
        </Link>
        <button
          //onClick={handleSubmit}
          disabled={!isFormValid}
          onMouseEnter={() => setHoveredButton("create")}
          onMouseLeave={() => setHoveredButton(null)}
          className={`
            flex-1 font-mono text-lg font-bold py-4 px-6 
            border-4 border-menu-border
            transition-all duration-150 ease-out
            ${
              !isFormValid
                ? "bg-menu-button/50 text-menu-button-text/50 cursor-not-allowed shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                : hoveredButton === "create"
                  ? "translate-x-1 -translate-y-1 shadow-[6px_6px_0px_rgba(0,0,0,0.3)] bg-menu-accent text-white"
                  : "shadow-[4px_4px_0px_rgba(0,0,0,0.2)] bg-menu-accent text-white"
            }
          `}
        >
          CREAR
        </button>
      </div>
    </div>
  )
}
