# Monopoly Game – Backend-driven Web Application

## Description
This project is a Monopoly-like game implemented as a backend-driven web application.
The game logic is fully handled by a REST API built with ASP.NET Core and Entity Framework Core.
The frontend, developed with React and TypeScript, is responsible for rendering the game state,
animations, and sending player actions to the backend.

---

## Technology Stack

### Backend
- **ASP.NET Core** - Web API framework
- **Entity Framework Core** - ORM for database operations
- **SQL Express** - Database (development)
- **Swagger** - API documentation

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **i18next** - Internationalization (EN/ES)

---

## Features

### Game Mechanics
- **2-4 Players** - Create games with 2 to 4 players
- **Turn-based Gameplay** - Players take turns in order
- **Dice Rolling** - Animated 3D dice with random results from backend
- **Player Movement** - Step-by-step animated movement around the board
- **Property Purchasing** - Buy unowned properties when landing on them
- **Rent Payment** - Automatic rent collection when landing on owned properties
- **Doubles Rule** - Roll again when getting doubles (up to 3 times)
- **Triple Doubles** - Go to jail if rolling doubles 3 times in a row

### Jail System
- **Go to Jail** - Land on "Go to Jail" tile or roll 3 doubles
- **Pay Bail** - Pay $50 to get out of jail
- **Roll Doubles** - Roll doubles to escape for free
- **3 Turn Limit** - Automatically pay and leave after 3 turns

### Special Tiles
- **GO** - Collect $200 when passing
- **Income Tax** - Pay 10% of money (max $200)
- **Luxury Tax** - Pay $100
- **Free Parking** - Rest tile, no action
- **Jail / Just Visiting** - Jail corner tile
- **Chance** - Chance card tile (UI ready, cards not implemented)
- **Community Chest** - Community chest tile (UI ready, cards not implemented)

### Rent Calculation
- **Properties** - Base rent value
- **Railroads** - $25/$50/$100/$200 based on ownership count (1-4)
- **Utilities** - 4x or 10x dice roll based on ownership count (1-2)

### UI Features
- **Retro Pixel-Art Style** - Consistent theme across all components
- **Dark/Light Mode** - Full theme support
- **Internationalization** - English and Spanish languages
- **Responsive Design** - Works on desktop and mobile
- **Real-time Notifications** - Toast notifications for game events
- **Animated Board** - Smooth player movement animations
- **3D Dice Animation** - Rotating dice with dot display

---

## Scope

### Included
- Games with 2 to 4 players
- Turn-based gameplay with doubles rule
- Dice-based movement with animations
- Property purchasing system
- Automatic rent payment
- Jail mechanics (pay bail, roll doubles, 3-turn limit)
- Special tiles (Go, Taxes, Free Parking, Go to Jail)
- Railroad and Utility rent calculations
- Dark/Light theme support
- Multi-language support (EN/ES)

### Not Included (Future Features)
- Auctions (when property is not purchased)
- Mortgages
- Houses and hotels
- Chance and Community Chest cards
- Trading between players
- Real-time multiplayer (WebSockets)

---

## Game Rules

### Starting the Game
- Each player starts with $1,500
- Players begin on the GO tile (position 0)
- First player is determined automatically

### On Your Turn
1. Roll the dice
2. Move clockwise around the board
3. Take action based on the tile landed on
4. Buy property if available and desired
5. End turn (or roll again if doubles)

### Property Rules
- Properties can only be purchased when landing on them
- Rent is automatically deducted when landing on owned properties
- Property ownership is shown with colored indicators on the board

### Winning
- Last player not bankrupt wins
- Players go bankrupt when they can't pay rent or taxes

---

## API Endpoints

```
POST /api/game                              - Create a new game
GET  /api/game/{id}                         - Get game state
POST /api/game/{id}/join                    - Join an existing game
POST /api/game/{id}/roll?playerId={id}      - Roll dice
POST /api/game/{id}/buy?playerId={id}       - Buy property
POST /api/game/{id}/end-turn?playerId={id}  - End turn
POST /api/game/{id}/pay-jail-fine?playerId={id} - Pay jail bail
```

---

## Domain Model

### Entities
- **Game** - Game session with status, players, and board
- **Player** - Player with money, position, status, and properties
- **Board** - Game board with 40 tiles
- **Tile** - Board position with type and optional property
- **Property** - Purchasable tile with price, rent, and owner
- **Turn** - Player turn record
- **DiceRoll** - Dice roll result with values

### Player Status
- `Active` - Normal playing state
- `InJail` - In jail, must pay or roll doubles
- `Bankrupt` - Out of the game

### Game Status
- `Waiting` - Waiting for players
- `InProgress` - Game is active
- `Finished` - Game has ended

---

## Project Structure

```
monopoly-game/
├── monopoly-backend/           # ASP.NET Core API
│   ├── Controllers/            # API controllers
│   ├── Services/               # Business logic
│   ├── Models/                 # Domain entities
│   ├── DTOs/                   # Data transfer objects
│   ├── Data/                   # Database context
│   └── Migrations/             # EF Core migrations
│
├── monopoly-frontend/          # React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Board/          # Monopoly board
│   │   │   ├── Dice/           # Dice roller
│   │   │   ├── Game/           # Game container
│   │   │   └── Menu/           # Main menu
│   │   ├── contexts/           # React contexts (settings)
│   │   ├── hooks/              # Custom hooks (animations)
│   │   ├── services/           # API client
│   │   ├── types/              # TypeScript types
│   │   └── i18n/               # Translations
│   └── public/
│
└── docs/                       # Documentation & diagrams
```

---

## Running the Project

### Backend
```bash
cd monopoly-backend
dotnet restore
dotnet run
```
The API will be available at `http://localhost:5093`

### Frontend
```bash
cd monopoly-frontend
npm install
npm run dev
```
The app will be available at `http://localhost:5173`

### Environment Variables
Create a `.env` file in `monopoly-frontend/`:
```
VITE_API_URL=http://localhost:5093/api
```

---

## Diagrams

### Class Diagram
![Class Diagram](docs/images/class-diagram.png)

### Sequence Diagram
![Sequence Diagram](docs/images/sequential-diagram.png)

### Entity Relationship Diagram
![ER Diagram](docs/images/MER.png)

---

## Notes

- All game logic is handled exclusively in the backend
- The frontend only displays game state and available actions
- EF Core is used with SQL Express during development
- The game uses a retro pixel-art visual style
- Full dark mode support throughout the application
