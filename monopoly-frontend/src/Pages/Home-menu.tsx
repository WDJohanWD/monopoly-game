import { useState } from "react"
import { Link } from "react-router-dom"
export function HomeMenu() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  const menuItems = [
    { id: "play", label: "JUGAR", icon: "▶", route:"/play" },
    { id: "join", label: "UNIRSE", icon: "◆", route:"/play" },
    { id: "how", label: "CÓMO JUGAR", icon: "?", route:"/how" },
    { id: "options", label: "OPCIONES", icon: "⚙", route:"/play" },
  ]

  return (
    <div className="min-h-screen bg-menu flex flex-col justify-center p-4  overflow-hidden">
      {/* Decorative pixel corners */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-menu-accent" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-menu-accent" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-menu-accent" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-menu-accent" />

      {/* Main content */}
      <div className="flex flex-col items-center gap-8 z-10">
        {/* Logo */}
        <div className="text-center mb-4">
          <h1 className="font-mono text-5xl md:text-7xl font-bold text-menu-title tracking-wider mb-2 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
            MONOPOOLY
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="w-12 h-1 bg-menu-accent" />
            <span className="font-mono text-sm text-menu-subtitle tracking-widest">EL JUEGO DE MESA</span>
            <span className="w-12 h-1 bg-menu-accent" />
          </div>
        </div>

        {/* Dice decoration */}
        <div className="flex gap-4 mb-4">
          <div className="w-12 h-12 bg-menu-card rounded-lg border-4 border-menu-border flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
            <div className="grid grid-cols-2 gap-1">
              <span className="w-2 h-2 bg-menu-dots rounded-full" />
              <span className="w-2 h-2 bg-menu-dots rounded-full" />
              <span className="w-2 h-2 bg-menu-dots rounded-full" />
              <span className="w-2 h-2 bg-menu-dots rounded-full" />
            </div>
          </div>
          <div className="w-12 h-12 bg-menu-card rounded-lg border-4 border-menu-border flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
            <div className="grid grid-cols-3 gap-0.5">
              <span className="w-2 h-2 bg-menu-dots rounded-full" />
              <span className="w-2 h-2 bg-transparent" />
              <span className="w-2 h-2 bg-menu-dots rounded-full" />
              <span className="w-2 h-2 bg-transparent" />
              <span className="w-2 h-2 bg-menu-dots rounded-full" />
              <span className="w-2 h-2 bg-transparent" />
              <span className="w-2 h-2 bg-menu-dots rounded-full" />
              <span className="w-2 h-2 bg-transparent" />
              <span className="w-2 h-2 bg-menu-dots rounded-full" />
            </div>
          </div>
        </div>

        {/* Menu buttons */}
        <nav className="flex flex-col gap-3 w-full max-w-xs">
          {menuItems.map((item) => (
            <Link key={item.id} to={item.route}>
              <button
                key={item.id}
                onMouseEnter={() => setHoveredButton(item.id)}
                onMouseLeave={() => setHoveredButton(null)}
                className={`
                  relative w-full font-mono text-lg font-bold py-4 px-6 
                  bg-menu-button border-4 border-menu-border
                  transition-all duration-150 ease-out
                  ${
                    hoveredButton === item.id
                      ? "translate-x-1 -translate-y-1 shadow-[6px_6px_0px_rgba(0,0,0,0.3)] bg-menu-button-hover text-menu-button-text-hover"
                      : "shadow-[4px_4px_0px_rgba(0,0,0,0.2)] text-menu-button-text"
                  }
                `}
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </span>
              </button>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="font-mono text-xs text-menu-subtitle tracking-wider">v1.0 • 2-4 JUGADORES</p>
        </footer>
      </div>

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
