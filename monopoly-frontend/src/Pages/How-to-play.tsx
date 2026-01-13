import { useState } from "react"
import { Link } from "react-router-dom"

interface HowToPlayProps {
  onBack: () => void
}

const instructions = [
  {
    title: "OBJETIVO",
    description: "Ser el jugador más rico al final de la partida, comprando propiedades y cobrando alquiler.",
  },
  {
    title: "TURNO",
    description: "Lanza los dados y mueve tu ficha. Compra propiedades libres o paga alquiler si tienen dueño.",
  },
  { title: "PROPIEDADES", description: "Compra todas las propiedades de un color para construir casas y hoteles." },
  { title: "CARTAS", description: "Cae en Suerte o Arca Comunal para recibir cartas con efectos especiales." },
  {
    title: "CÁRCEL",
    description: "Ve a la cárcel si sacas dobles 3 veces o caes en la casilla. Paga o saca dobles para salir.",
  },
  {
    title: "BANCARROTA",
    description: "Si no puedes pagar, vendes propiedades. Sin nada que vender, quedas eliminado.",
  },
]

export function HowToPlay({ onBack }: HowToPlayProps) {
  const [hoveredBack, setHoveredBack] = useState(false)

  return (
    <div className="min-h-screen bg-menu flex flex-col justify-center items-center gap-6 w-full p-4 overflow-hidden">
      {/* Instructions list */}
      <div className="w-full max-w-md space-y-3 max-h-[60vh] overflow-y-auto px-2">
        {instructions.map((item, index) => (
          <div
            key={index}
            className="bg-menu-card border-4 border-menu-border p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
          >
            <h3 className="font-mono text-lg font-bold text-menu-button-text mb-1 flex items-center gap-2">
              <span className="text-menu-accent">{index + 1}.</span>
              {item.title}
            </h3>
            <p className="font-mono text-sm text-menu-button-text/80 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Back button */}
      <Link to="/"
        onClick={onBack}
        onMouseEnter={() => setHoveredBack(true)}
        onMouseLeave={() => setHoveredBack(false)}
        className={`
          font-mono text-lg font-bold py-4 px-8 
          bg-menu-button border-4 border-menu-border
          transition-all duration-150 ease-out
          ${
            hoveredBack
              ? "translate-x-1 -translate-y-1 shadow-[6px_6px_0px_rgba(0,0,0,0.3)] bg-menu-button-hover text-menu-button-text-hover"
              : "shadow-[4px_4px_0px_rgba(0,0,0,0.2)] text-menu-button-text"
          }
        `}
      >
        <span className="flex items-center justify-center gap-3">
          <span className="text-xl">←</span>
          VOLVER
        </span>
      </Link>
    </div>
  )
}
