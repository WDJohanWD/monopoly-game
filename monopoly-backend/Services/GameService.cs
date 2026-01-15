using Microsoft.EntityFrameworkCore;
using monopoly_backend.Data;
using monopoly_backend.DTOs;
using monopoly_backend.Models.Entities;
using monopoly_backend.Models.Enums;

namespace monopoly_backend.Services
{
    public class GameService : IGameService
    {
        private readonly MonopolyDbContext _context;

        public GameService(MonopolyDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<GameDto>> CreateGameAsync(CreateGameDto createGameDto)
        {
            if (createGameDto.Players.Count < 2 || createGameDto.Players.Count > 4)
            {
                return ApiResponse<GameDto>.Error("El juego debe tener entre 2 y 4 jugadores");
            }

            var game = new Game
            {
                Id = Guid.NewGuid(),
                Status = GameStatus.Waiting,
                CreatedAt = DateTime.UtcNow,
                Round = 0
            };

            var players = createGameDto.Players.Select((p, index) => new Player
            {
                Id = Guid.NewGuid(),
                Name = p.Name,
                Color = p.Color,
                Money = 1500,
                Position = 0,
                Status = PlayerStatus.Active,
                GameId = game.Id,
                TurnsInJail = 0
            }).ToList();

            game.Players = players;
            game.CurrentTurnPlayerId = players.First().Id;

            // Crear el tablero con las casillas estándar
            var board = CreateStandardBoard(game.Id);
            game.Board = board;

            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            var gameDto = await MapToGameDtoAsync(game.Id);
            return ApiResponse<GameDto>.Ok(gameDto, "Juego creado exitosamente");
        }

        public async Task<ApiResponse<GameDto>> JoinGameAsync(Guid gameId, JoinGameDto joinGameDto)
        {
            var game = await _context.Games
                .Include(g => g.Players)
                .FirstOrDefaultAsync(g => g.Id == gameId);

            if (game == null)
            {
                return ApiResponse<GameDto>.Error("Juego no encontrado");
            }

            if (game.Status != GameStatus.Waiting)
            {
                return ApiResponse<GameDto>.Error("El juego ya ha comenzado");
            }

            if (game.Players.Count >= 4)
            {
                return ApiResponse<GameDto>.Error("El juego ya tiene el máximo de jugadores");
            }

            if (game.Players.Any(p => p.Name == joinGameDto.Name || p.Color == joinGameDto.Color))
            {
                return ApiResponse<GameDto>.Error("Ya existe un jugador con ese nombre o color");
            }

            var player = new Player
            {
                Id = Guid.NewGuid(),
                Name = joinGameDto.Name,
                Color = joinGameDto.Color,
                Money = 1500,
                Position = 0,
                Status = PlayerStatus.Active,
                GameId = game.Id,
                TurnsInJail = 0
            };

            game.Players.Add(player);

            // Si es el segundo jugador y hay 2 o más, comenzar el juego
            if (game.Players.Count >= 2 && game.Status == GameStatus.Waiting)
            {
                game.Status = GameStatus.InProgress;
                game.StartedAt = DateTime.UtcNow;
                game.CurrentTurnPlayerId = game.Players.OrderBy(p => p.Name).First().Id;
            }

            await _context.SaveChangesAsync();

            var gameDto = await MapToGameDtoAsync(game.Id);
            return ApiResponse<GameDto>.Ok(gameDto, "Jugador unido exitosamente");
        }

        public async Task<ApiResponse<GameDto>> GetGameAsync(Guid gameId)
        {
            var game = await _context.Games
                .Include(g => g.Players)
                    .ThenInclude(p => p.Properties)
                .Include(g => g.Board)
                    .ThenInclude(b => b!.Tiles)
                        .ThenInclude(t => t.Property)
                            .ThenInclude(p => p!.Owner)
                .Include(g => g.CurrentTurnPlayer)
                .FirstOrDefaultAsync(g => g.Id == gameId);

            if (game == null)
            {
                return ApiResponse<GameDto>.Error("Juego no encontrado");
            }

            if (game.Board == null)
            {
                return ApiResponse<GameDto>.Error("El juego no tiene tablero configurado");
            }

            var gameDto = MapToGameDto(game);
            return ApiResponse<GameDto>.Ok(gameDto);
        }

        public async Task<ApiResponse<RollDiceResponseDto>> RollDiceAsync(Guid gameId, Guid playerId)
        {
            var game = await _context.Games
                .Include(g => g.Players)
                    .ThenInclude(p => p.Properties)
                .Include(g => g.Board)
                    .ThenInclude(b => b!.Tiles)
                        .ThenInclude(t => t.Property)
                .Include(g => g.CurrentTurnPlayer)
                .FirstOrDefaultAsync(g => g.Id == gameId);

            if (game == null)
            {
                return ApiResponse<RollDiceResponseDto>.Error("Juego no encontrado");
            }

            if (game.Board == null)
            {
                return ApiResponse<RollDiceResponseDto>.Error("El juego no tiene tablero configurado");
            }

            if (game.Status != GameStatus.InProgress)
            {
                return ApiResponse<RollDiceResponseDto>.Error("El juego no está en progreso");
            }

            if (game.CurrentTurnPlayerId != playerId)
            {
                return ApiResponse<RollDiceResponseDto>.Error("No es el turno de este jugador");
            }

            var player = game.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null)
            {
                return ApiResponse<RollDiceResponseDto>.Error("Jugador no encontrado");
            }

            if (player.Status == PlayerStatus.Bankrupt)
            {
                return ApiResponse<RollDiceResponseDto>.Error("El jugador está en bancarrota");
            }

            var random = new Random();
            var die1 = random.Next(1, 7);
            var die2 = random.Next(1, 7);
            var total = die1 + die2;

            // Crear el turno
            var turn = new Turn
            {
                Id = Guid.NewGuid(),
                GameId = game.Id,
                PlayerId = playerId,
                TurnNumber = game.Round + 1,
                StartedAt = DateTime.UtcNow
            };

            var diceRoll = new DiceRoll
            {
                Id = Guid.NewGuid(),
                TurnId = turn.Id,
                Die1 = die1,
                Die2 = die2,
                RolledAt = DateTime.UtcNow
            };

            turn.DiceRoll = diceRoll;

            // Mover al jugador
            var newPosition = (player.Position + total) % 40;
            player.Position = newPosition;

            // Verificar si pasó por Go
            if (player.Position < player.Position - total || (player.Position - total) < 0)
            {
                player.Money += 200;
            }

            // Obtener la casilla donde aterrizó
            var tile = game.Board.Tiles.FirstOrDefault(t => t.Position == newPosition);
            var property = tile?.Property;

            bool canBuyProperty = false;
            bool mustPayRent = false;

            if (tile != null && tile.Type == TileType.Property && property != null)
            {
                if (property.OwnerId == null)
                {
                    canBuyProperty = player.Money >= property.Price;
                }
                else if (property.OwnerId != playerId)
                {
                    mustPayRent = true;
                    player.Money -= property.Rent;
                    var owner = game.Players.FirstOrDefault(p => p.Id == property.OwnerId);
                    if (owner != null)
                    {
                        owner.Money += property.Rent;
                    }

                    if (player.Money < 0)
                    {
                        player.Status = PlayerStatus.Bankrupt;
                    }
                }
            }

            _context.Turns.Add(turn);
            await _context.SaveChangesAsync();

            var response = new RollDiceResponseDto
            {
                DiceRoll = new DiceRollDto
                {
                    Id = diceRoll.Id,
                    Die1 = die1,
                    Die2 = die2,
                    Total = total,
                    IsDouble = die1 == die2,
                    RolledAt = diceRoll.RolledAt,
                    TurnId = turn.Id
                },
                NewPosition = newPosition,
                CanBuyProperty = canBuyProperty,
                MustPayRent = mustPayRent,
                LandedOnProperty = property != null ? new PropertyDto
                {
                    Id = property.Id,
                    Name = property.Name,
                    Price = property.Price,
                    Rent = property.Rent,
                    ColorGroup = property.ColorGroup,
                    OwnerId = property.OwnerId,
                    OwnerName = property.Owner?.Name
                } : null
            };

            return ApiResponse<RollDiceResponseDto>.Ok(response);
        }

        public async Task<ApiResponse<GameDto>> BuyPropertyAsync(Guid gameId, Guid playerId, BuyPropertyDto buyPropertyDto)
        {
            var game = await _context.Games
                .Include(g => g.Players)
                    .ThenInclude(p => p.Properties)
                .Include(g => g.Board)
                    .ThenInclude(b => b!.Tiles)
                        .ThenInclude(t => t.Property)
                .FirstOrDefaultAsync(g => g.Id == gameId);

            if (game == null)
            {
                return ApiResponse<GameDto>.Error("Juego no encontrado");
            }

            if (game.Board == null)
            {
                return ApiResponse<GameDto>.Error("El juego no tiene tablero configurado");
            }

            var player = game.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null)
            {
                return ApiResponse<GameDto>.Error("Jugador no encontrado");
            }

            var property = await _context.Properties
                .Include(p => p.Tile)
                .FirstOrDefaultAsync(p => p.Id == buyPropertyDto.PropertyId);

            if (property == null)
            {
                return ApiResponse<GameDto>.Error("Propiedad no encontrada");
            }

            if (property.OwnerId != null)
            {
                return ApiResponse<GameDto>.Error("La propiedad ya tiene dueño");
            }

            if (player.Position != property.Tile.Position)
            {
                return ApiResponse<GameDto>.Error("No estás en esta propiedad");
            }

            if (player.Money < property.Price)
            {
                return ApiResponse<GameDto>.Error("No tienes suficiente dinero");
            }

            property.OwnerId = playerId;
            player.Money -= property.Price;
            player.Properties.Add(property);

            await _context.SaveChangesAsync();

            var gameDto = await MapToGameDtoAsync(game.Id);
            return ApiResponse<GameDto>.Ok(gameDto, "Propiedad comprada exitosamente");
        }

        public async Task<ApiResponse<GameDto>> EndTurnAsync(Guid gameId, Guid playerId)
        {
            var game = await _context.Games
                .Include(g => g.Players)
                .FirstOrDefaultAsync(g => g.Id == gameId);

            if (game == null)
            {
                return ApiResponse<GameDto>.Error("Juego no encontrado");
            }

            if (game.CurrentTurnPlayerId != playerId)
            {
                return ApiResponse<GameDto>.Error("No es el turno de este jugador");
            }

            var currentPlayerIndex = game.Players
                .OrderBy(p => p.Name)
                .ToList()
                .FindIndex(p => p.Id == playerId);

            var nextPlayerIndex = (currentPlayerIndex + 1) % game.Players.Count;
            var nextPlayer = game.Players.OrderBy(p => p.Name).ToList()[nextPlayerIndex];

            game.CurrentTurnPlayerId = nextPlayer.Id;
            game.Round++;

            // Verificar si el juego terminó (todos los jugadores excepto uno están en bancarrota)
            var activePlayers = game.Players.Count(p => p.Status != PlayerStatus.Bankrupt);
            if (activePlayers <= 1)
            {
                game.Status = GameStatus.Finished;
                game.FinishedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            var gameDto = await MapToGameDtoAsync(game.Id);
            return ApiResponse<GameDto>.Ok(gameDto);
        }

        private Board CreateStandardBoard(Guid gameId)
        {
            var board = new Board
            {
                Id = Guid.NewGuid(),
                GameId = gameId,
                Tiles = new List<Tile>()
            };

            // Casillas estándar de Monopoly (versión simplificada)
            var tiles = new List<(string Name, TileType Type, Property? Property)>
            {
                ("Go", TileType.Go, null),
                ("Mediterranean Avenue", TileType.Property, new Property { Name = "Mediterranean Avenue", Price = 60, Rent = 2, ColorGroup = "Brown" }),
                ("Community Chest", TileType.CommunityChest, null),
                ("Baltic Avenue", TileType.Property, new Property { Name = "Baltic Avenue", Price = 60, Rent = 4, ColorGroup = "Brown" }),
                ("Income Tax", TileType.IncomeTax, null),
                ("Reading Railroad", TileType.Railroad, new Property { Name = "Reading Railroad", Price = 200, Rent = 25, ColorGroup = "Railroad" }),
                ("Oriental Avenue", TileType.Property, new Property { Name = "Oriental Avenue", Price = 100, Rent = 6, ColorGroup = "Light Blue" }),
                ("Chance", TileType.Chance, null),
                ("Vermont Avenue", TileType.Property, new Property { Name = "Vermont Avenue", Price = 100, Rent = 6, ColorGroup = "Light Blue" }),
                ("Connecticut Avenue", TileType.Property, new Property { Name = "Connecticut Avenue", Price = 120, Rent = 8, ColorGroup = "Light Blue" }),
                ("Jail", TileType.Jail, null),
                ("St. Charles Place", TileType.Property, new Property { Name = "St. Charles Place", Price = 140, Rent = 10, ColorGroup = "Pink" }),
                ("Electric Company", TileType.Utility, new Property { Name = "Electric Company", Price = 150, Rent = 0, ColorGroup = "Utility" }),
                ("States Avenue", TileType.Property, new Property { Name = "States Avenue", Price = 140, Rent = 10, ColorGroup = "Pink" }),
                ("Virginia Avenue", TileType.Property, new Property { Name = "Virginia Avenue", Price = 160, Rent = 12, ColorGroup = "Pink" }),
                ("Pennsylvania Railroad", TileType.Railroad, new Property { Name = "Pennsylvania Railroad", Price = 200, Rent = 25, ColorGroup = "Railroad" }),
                ("St. James Place", TileType.Property, new Property { Name = "St. James Place", Price = 180, Rent = 14, ColorGroup = "Orange" }),
                ("Community Chest", TileType.CommunityChest, null),
                ("Tennessee Avenue", TileType.Property, new Property { Name = "Tennessee Avenue", Price = 180, Rent = 14, ColorGroup = "Orange" }),
                ("New York Avenue", TileType.Property, new Property { Name = "New York Avenue", Price = 200, Rent = 16, ColorGroup = "Orange" }),
                ("Free Parking", TileType.FreeParking, null),
                ("Kentucky Avenue", TileType.Property, new Property { Name = "Kentucky Avenue", Price = 220, Rent = 18, ColorGroup = "Red" }),
                ("Chance", TileType.Chance, null),
                ("Indiana Avenue", TileType.Property, new Property { Name = "Indiana Avenue", Price = 220, Rent = 18, ColorGroup = "Red" }),
                ("Illinois Avenue", TileType.Property, new Property { Name = "Illinois Avenue", Price = 240, Rent = 20, ColorGroup = "Red" }),
                ("B&O Railroad", TileType.Railroad, new Property { Name = "B&O Railroad", Price = 200, Rent = 25, ColorGroup = "Railroad" }),
                ("Atlantic Avenue", TileType.Property, new Property { Name = "Atlantic Avenue", Price = 260, Rent = 22, ColorGroup = "Yellow" }),
                ("Ventnor Avenue", TileType.Property, new Property { Name = "Ventnor Avenue", Price = 260, Rent = 22, ColorGroup = "Yellow" }),
                ("Water Works", TileType.Utility, new Property { Name = "Water Works", Price = 150, Rent = 0, ColorGroup = "Utility" }),
                ("Marvin Gardens", TileType.Property, new Property { Name = "Marvin Gardens", Price = 280, Rent = 24, ColorGroup = "Yellow" }),
                ("Go To Jail", TileType.GoToJail, null),
                ("Pacific Avenue", TileType.Property, new Property { Name = "Pacific Avenue", Price = 300, Rent = 26, ColorGroup = "Green" }),
                ("North Carolina Avenue", TileType.Property, new Property { Name = "North Carolina Avenue", Price = 300, Rent = 26, ColorGroup = "Green" }),
                ("Community Chest", TileType.CommunityChest, null),
                ("Pennsylvania Avenue", TileType.Property, new Property { Name = "Pennsylvania Avenue", Price = 320, Rent = 28, ColorGroup = "Green" }),
                ("Short Line", TileType.Railroad, new Property { Name = "Short Line", Price = 200, Rent = 25, ColorGroup = "Railroad" }),
                ("Chance", TileType.Chance, null),
                ("Park Place", TileType.Property, new Property { Name = "Park Place", Price = 350, Rent = 35, ColorGroup = "Dark Blue" }),
                ("Luxury Tax", TileType.LuxuryTax, null),
                ("Boardwalk", TileType.Property, new Property { Name = "Boardwalk", Price = 400, Rent = 50, ColorGroup = "Dark Blue" })
            };

            for (int i = 0; i < tiles.Count; i++)
            {
                var tile = new Tile
                {
                    Id = i,
                    Name = tiles[i].Name,
                    Type = tiles[i].Type,
                    Position = i,
                    BoardId = board.Id
                };

                var propertyData = tiles[i].Property;
                if (propertyData != null)
                {
                    propertyData.Id = Guid.NewGuid();
                    propertyData.TileId = i;
                    tile.Property = propertyData;
                }

                board.Tiles.Add(tile);
            }

            return board;
        }

        private async Task<GameDto> MapToGameDtoAsync(Guid gameId)
        {
            var game = await _context.Games
                .Include(g => g.Players)
                    .ThenInclude(p => p.Properties)
                        .ThenInclude(prop => prop.Tile)
                .Include(g => g.Board)
                    .ThenInclude(b => b!.Tiles)
                        .ThenInclude(t => t.Property)
                            .ThenInclude(p => p!.Owner)
                .Include(g => g.CurrentTurnPlayer)
                .FirstOrDefaultAsync(g => g.Id == gameId);

            if (game == null)
            {
                throw new Exception("Game not found");
            }

            return MapToGameDto(game);
        }

        private GameDto MapToGameDto(Game game)
        {
            return new GameDto
            {
                Id = game.Id,
                Status = game.Status,
                CreatedAt = game.CreatedAt,
                StartedAt = game.StartedAt,
                FinishedAt = game.FinishedAt,
                Round = game.Round,
                CurrentTurnPlayerId = game.CurrentTurnPlayerId,
                Players = game.Players.Select(p => new PlayerDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Money = p.Money,
                    Position = p.Position,
                    Color = p.Color,
                    Status = p.Status,
                    TurnsInJail = p.TurnsInJail,
                    Properties = p.Properties.Select(prop => new PropertyDto
                    {
                        Id = prop.Id,
                        Name = prop.Name,
                        Price = prop.Price,
                        Rent = prop.Rent,
                        ColorGroup = prop.ColorGroup,
                        OwnerId = prop.OwnerId,
                        OwnerName = prop.Owner?.Name
                    }).ToList()
                }).ToList(),
                Board = game.Board != null ? new BoardDto
                {
                    Id = game.Board.Id,
                    Tiles = game.Board.Tiles.Select(t => new TileDto
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Type = t.Type,
                        Position = t.Position,
                        Property = t.Property != null ? new PropertyDto
                        {
                            Id = t.Property.Id,
                            Name = t.Property.Name,
                            Price = t.Property.Price,
                            Rent = t.Property.Rent,
                            ColorGroup = t.Property.ColorGroup,
                            OwnerId = t.Property.OwnerId,
                            OwnerName = t.Property.Owner?.Name
                        } : null
                    }).ToList()
                } : null
            };
        }
    }
}
