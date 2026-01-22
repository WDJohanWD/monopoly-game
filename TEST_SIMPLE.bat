@echo off
REM Script simple para probar el API

echo Creating game...
curl -X POST http://localhost:5093/api/game ^
  -H "Content-Type: application/json" ^
  -d "{\"players\":[{\"name\":\"Player1\",\"color\":\"red\"},{\"name\":\"Player2\",\"color\":\"blue\"}],\"startingMoney\":1500}"

echo.
echo.
