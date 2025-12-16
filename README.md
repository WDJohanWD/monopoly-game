# monopoly-game
API and Client

## Description
This project consists of the development of a Monopoly-like game
implemented through a REST API built with ASP.NET Core and Entity Framework.
The frontend will be developed using React and will consume the API.

The main goal of this project is to practice backend architecture,
business logic implementation, and proper frontend/backend separation.

---

## Technology Stack

### Backend
- ASP.NET Core
- Entity Framework Core
- SQL Express
- Swagger

### Frontend
- React
- TypeScript
- Tailwind CSS

---

## Scope

### Included
- Games with 2 to 4 players
- Turn-based gameplay with random turn order
- Dice-based movement
- Property purchasing
- Rent payment
- Jail mechanics
- Special Tiles

### Not included (for now)
- Auctions
- Mortgages
- Houses and hotels
- Real-time communication (WebSockets)

---

## Game Rules

- Each player starts with $1500
- On their turn, a player rolls the dice
- If a player lands on an unowned property, they may purchase it
- If a player lands on a property owned by another player, rent is paid
- The turn ends manually

---

## Domain Model

- Game
- Player
- Board
- Tile
- Property
- DiceRoll
- Turn

---

## Use Cases

- Create a game
- Join a game
- Roll dice
- Move player
- Buy property
- End turn
- Leave jail

---

## API (Draft)

POST /api/game  
POST /api/game/{id}/join  
POST /api/game/{id}/roll  
POST /api/game/{id}/buy  
POST /api/game/{id}/end-turn  

---

## Roadmap

- [ ] Define domain model
- [ ] Create backend base
- [ ] Implement game logic
- [ ] Design API contract
- [ ] Build React frontend

---

## Notes

- All game logic will be handled exclusively in the backend
- The frontend will only display game state and available actions
- EF Core will be used with SQL Express during development
