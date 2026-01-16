import { useState } from "react"
import { Link } from "react-router-dom"

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

export function HowToPlay() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-menu flex flex-col justify-center items-center gap-6 max-w-lg mx-auto p-4 overflow-hidden">
      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-menu-accent" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-menu-accent" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-menu-accent" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-menu-accent" />
      
      {/* Title */}
      <div className="text-center mb-2">
        <h1 className="font-mono text-4xl font-bold text-menu-accent drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">CÓMO JUGAR</h1>
        <div className="h-1 w-32 bg-menu-accent mx-auto mt-2" />
      </div>

      {/* Instructions list */}
      <div className="w-full max-w-lg space-y-3 max-h-[80vh] overflow-y-auto px-2">
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

      {/* Action button */}
      <div className="flex gap-4 w-full">
        <Link
          to="/"
          onMouseEnter={() => setHoveredButton("back")}
          onMouseLeave={() => setHoveredButton(null)}
          className={`
            flex-1 font-mono text-lg font-bold py-4 px-6 
            bg-menu-button border-4 border-menu-border
            transition-all duration-150 ease-out
            ${hoveredButton === "back"
              ? "translate-x-1 -translate-y-1 shadow-[6px_6px_0px_rgba(0,0,0,0.3)] bg-menu-button-hover text-menu-button-text-hover"
              : "shadow-[4px_4px_0px_rgba(0,0,0,0.2)] text-menu-button-text"
            }
          `}
        >
          VOLVER
        </Link>
      </div>
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
