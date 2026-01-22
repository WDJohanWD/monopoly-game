import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useSettings } from "../contexts/SettingsContext"

export function Options() {
    const { t } = useTranslation()
    const { language, theme, setLanguage, setTheme } = useSettings()
    const [hoveredButton, setHoveredButton] = useState<string | null>(null)

    const languages = [
        { id: "es" as const, label: t("options.languages.es") },
        { id: "en" as const, label: t("options.languages.en") },
    ]

    const themes = [
        { id: "light" as const, label: t("options.themes.light") },
        { id: "dark" as const, label: t("options.themes.dark") },
    ]

    return (
        <div className="min-h-screen bg-menu flex flex-col max-w-lg mx-auto p-4 overflow-hidden relative">
            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-menu-accent" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-menu-accent" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-menu-accent" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-menu-accent" />

            {/* Title */}
            <div className="text-center mb-4 mt-4 flex-shrink-0">
                <h1 className="font-mono text-4xl font-bold text-menu-accent drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">{t("options.title")}</h1>
                <div className="h-1 w-32 bg-menu-accent mx-auto mt-2" />
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 w-full space-y-3 overflow-y-auto px-2 mb-4">
                {/* Language */}
                <div className="bg-menu-card border-4 border-menu-border p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                    <h3 className="font-mono text-sm font-bold text-menu-accent mb-3">{t("options.language")}</h3>
                    <div className="flex gap-2 justify-center">
                        {languages.map((lang) => (
                            <button
                                key={lang.id}
                                onClick={() => setLanguage(lang.id)}
                                className={`
                font-mono text-sm font-bold px-4 py-2 border-4 transition-all duration-150
                ${language === lang.id
                                        ? "bg-menu-accent border-menu-border shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
                                        : "bg-menu-card border-menu-border text-menu-button-text hover:bg-menu-button-hover"
                                    }
              `}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color theme */}
                <div className="bg-menu-card border-4 border-menu-border p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                    <h3 className="font-mono text-sm font-bold text-menu-accent mb-3">{t("options.colorTheme")}</h3>
                    <div className="flex gap-2 justify-center">
                        {themes.map((themeOption) => (
                            <button
                                key={themeOption.id}
                                onClick={() => setTheme(themeOption.id)}
                                className={`
                font-mono text-xs font-bold px-3 py-2 border-4 transition-all duration-150
                ${theme === themeOption.id
                                        ? "bg-menu-accent border-menu-border shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
                                        : "bg-menu-card border-menu-border text-menu-button-text hover:bg-menu-button-hover"
                                    }
              `}
                            >
                                {themeOption.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Back button - fixed at bottom */}
            <div className="w-full flex-shrink-0 pb-4">
                <Link to="/">
                    <button
                        onMouseEnter={() => setHoveredButton("back")}
                        onMouseLeave={() => setHoveredButton(null)}
                        className={`
                        w-full font-mono text-lg font-bold py-4 px-6 
                        bg-menu-button border-4 border-menu-border
                        transition-all duration-150 ease-out
                        ${hoveredButton === "back"
                                ? "translate-x-1 -translate-y-1 shadow-[6px_6px_0px_rgba(0,0,0,0.3)] bg-menu-button-hover text-menu-button-text-hover"
                                : "shadow-[4px_4px_0px_rgba(0,0,0,0.2)] text-menu-button-text"
                            }
                        `}
                    >
                        {t("options.back")}
                    </button>
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