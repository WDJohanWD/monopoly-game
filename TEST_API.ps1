# Script de prueba para verificar que el API funciona correctamente

Write-Host "🎮 PRUEBA DE API - MONOPOLY GAME" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

# 1. Crear un juego
Write-Host "1️⃣ Creando un nuevo juego..." -ForegroundColor Yellow
$createGameBody = @{
    players = @(
        @{ name = "Player1"; color = "red" },
        @{ name = "Player2"; color = "blue" }
    )
    startingMoney = 1500
} | ConvertTo-Json

$gameResponse = Invoke-WebRequest -Uri "http://localhost:5093/api/game" `
    -Method POST `
    -ContentType "application/json" `
    -Body $createGameBody `
    -UseBasicParsing

$gameData = $gameResponse.Content | ConvertFrom-Json
$gameId = $gameData.data.id

Write-Host "✅ Juego creado: $gameId`n" -ForegroundColor Green

# 2. Obtener estado del juego
Write-Host "2️⃣ Obteniendo estado del juego..." -ForegroundColor Yellow
$getGameResponse = Invoke-WebRequest -Uri "http://localhost:5093/api/game/$gameId" `
    -Method GET `
    -UseBasicParsing

$game = ($getGameResponse.Content | ConvertFrom-Json).data
$playerId = $game.players[0].id

Write-Host "✅ Estado obtenido:"
Write-Host "   - Juego: $($game.id)"
Write-Host "   - Jugadores: $($game.players.Count)"
Write-Host "   - Jugador 1: $($game.players[0].name)`n" -ForegroundColor Green

# 3. Lanzar dados
Write-Host "3️⃣ Lanzando dados para $($game.players[0].name)..." -ForegroundColor Yellow
$rollResponse = Invoke-WebRequest -Uri "http://localhost:5093/api/game/$gameId/roll?playerId=$playerId" `
    -Method POST `
    -UseBasicParsing

$rollData = ($rollResponse.Content | ConvertFrom-Json).data
Write-Host "✅ Dados lanzados:"
Write-Host "   - Dado 1: $($rollData.diceRoll.die1)"
Write-Host "   - Dado 2: $($rollData.diceRoll.die2)"
Write-Host "   - Total: $($rollData.diceRoll.die1 + $rollData.diceRoll.die2)"
Write-Host "   - Nueva posición: $($rollData.position)`n" -ForegroundColor Green

Write-Host "✅ ¡PRUEBA COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "`n🌐 Frontend disponible en: http://localhost:5174" -ForegroundColor Cyan
Write-Host "🔌 Backend disponible en: http://localhost:5093" -ForegroundColor Cyan
Write-Host "📱 Navega a: http://localhost:5174/board/$gameId`n" -ForegroundColor Cyan
