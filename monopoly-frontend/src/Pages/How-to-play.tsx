import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

export function HowToPlay() {
  const { t } = useTranslation()
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  const instructions = [
    {
      title: t("howToPlay.instructions.objective.title"),
      description: t("howToPlay.instructions.objective.description"),
    },
    {
      title: t("howToPlay.instructions.turn.title"),
      description: t("howToPlay.instructions.turn.description"),
    },
    {
      title: t("howToPlay.instructions.properties.title"),
      description: t("howToPlay.instructions.properties.description"),
    },
    {
      title: t("howToPlay.instructions.cards.title"),
      description: t("howToPlay.instructions.cards.description"),
    },
    {
      title: t("howToPlay.instructions.jail.title"),
      description: t("howToPlay.instructions.jail.description"),
    },
    {
      title: t("howToPlay.instructions.bankruptcy.title"),
      description: t("howToPlay.instructions.bankruptcy.description"),
    },
  ]

  return (
    <div className="min-h-screen bg-menu flex flex-col max-w-lg mx-auto p-4 overflow-hidden relative">
      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-menu-accent" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-menu-accent" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-menu-accent" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-menu-accent" />

      {/* Title */}
      <div className="text-center mb-4 mt-4 flex-shrink-0">
        <h1 className="font-mono text-4xl font-bold text-menu-accent drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">{t("howToPlay.title")}</h1>
        <div className="h-1 w-32 bg-menu-accent mx-auto mt-2" />
      </div>

      {/* Instructions list - scrollable area */}
      <div className="flex-1 w-full space-y-3 overflow-y-auto px-2 mb-4">
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

      {/* Action button - fixed at bottom */}
      <div className="flex gap-4 w-full flex-shrink-0 pb-4">
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
          {t("howToPlay.back")}
        </Link>
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
