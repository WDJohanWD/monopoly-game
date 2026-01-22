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

            // Crear el tablero con las casillas estándar y propiedades
            var board = CreateStandardBoard(game.Id);
            game.Board = board;

            // Guardar el Game con el Board, Tiles y Properties en cascada
            // Entity Framework guardará todo automáticamente debido a las relaciones configuradas
            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            // Ahora crear los jugadores con el GameId ya guardado
            var players = createGameDto.Players.Select((p, index) => new Player
            {
                Id = Guid.NewGuid(),
                Name = p.Name,
                Color = p.Color,
                Money = createGameDto.StartingMoney,
                Position = 0,
                Status = PlayerStatus.Active,
                GameId = game.Id,
                TurnsInJail = 0
            }).ToList();

            _context.Players.AddRange(players);
            await _context.SaveChangesAsync();

            // Ahora actualizar el Game con el CurrentTurnPlayerId
            game.CurrentTurnPlayerId = players.First().Id;
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
                return ApiResponse<GameDto>.Error("El juego ya tiene el mรกximo de jugadores");
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

            // Si es el segundo jugador y hay 2 o mรกs, comenzar el juego
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
                return ApiResponse<RollDiceResponseDto>.Error("El juego no estรก en progreso");
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
                return ApiResponse<RollDiceResponseDto>.Error("El jugador estรก en bancarrota");
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

            // Verificar si el jugador está en la cárcel
            bool isInJail = player.Status == PlayerStatus.InJail;
            bool canMoveFromJail = false;

            if (isInJail)
            {
                // Si saca dobles, puede salir de la cárcel
                if (die1 == die2)
                {
                    player.Status = PlayerStatus.Active;
                    player.TurnsInJail = 0;
                    canMoveFromJail = true;
                }
                else
                {
                    player.TurnsInJail++;
                    // Si lleva 3 turnos en la cárcel, debe pagar o salir automáticamente
                    if (player.TurnsInJail >= 3)
                    {
                        if (player.Money >= 50)
                        {
                            player.Money -= 50;
                            player.Status = PlayerStatus.Active;
                            player.TurnsInJail = 0;
                            canMoveFromJail = true;
                        }
                        else
                        {
                            // No tiene dinero, queda en bancarrota
                            player.Status = PlayerStatus.Bankrupt;
                        }
                    }
                    else
                    {
                        // No puede moverse, termina el turno
                        _context.Turns.Add(turn);
                        await _context.SaveChangesAsync();
                        return ApiResponse<RollDiceResponseDto>.Ok(new RollDiceResponseDto
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
                            NewPosition = player.Position,
                            CanBuyProperty = false,
                            MustPayRent = false,
                            LandedOnProperty = null
                        });
                    }
                }
            }

            // Verificar si sacó 3 dobles consecutivos (ir a la cárcel)
            // Necesitamos verificar los últimos 2 turnos del mismo jugador
            var recentTurns = await _context.Turns
                .Include(t => t.DiceRoll)
                .Where(t => t.GameId == game.Id && t.PlayerId == playerId)
                .OrderByDescending(t => t.StartedAt)
                .Take(2)
                .ToListAsync();

            bool threeDoubles = die1 == die2 && 
                                recentTurns.Count >= 2 &&
                                recentTurns[0].DiceRoll != null && recentTurns[0].DiceRoll!.Die1 == recentTurns[0].DiceRoll!.Die2 &&
                                recentTurns[1].DiceRoll != null && recentTurns[1].DiceRoll!.Die1 == recentTurns[1].DiceRoll!.Die2;

            // Mover al jugador
            int newPosition;
            int oldPosition = player.Position;
            
            if (isInJail && !canMoveFromJail)
            {
                newPosition = player.Position; // Se queda en la cárcel
            }
            else if (threeDoubles)
            {
                // Ir a la cárcel por 3 dobles
                newPosition = 10; // Posición de la cárcel
                player.Position = newPosition;
                player.Status = PlayerStatus.InJail;
                player.TurnsInJail = 0;
            }
            else
            {
                newPosition = (player.Position + total) % 40;
                
                // Verificar si pasó por Go (posición 0)
                // Si la posición anterior + total >= 40, entonces pasó por Go
                if (oldPosition + total >= 40)
                {
                    player.Money += 200;
                }
                
                player.Position = newPosition;
            }

            // Obtener la casilla donde aterrizó
            var tile = game.Board.Tiles.FirstOrDefault(t => t.Position == newPosition);
            var property = tile?.Property;

            bool canBuyProperty = false;
            bool mustPayRent = false;
            string? specialAction = null;

            if (tile != null)
            {
                // Manejar casillas especiales
                switch (tile.Type)
                {
                    case TileType.GoToJail:
                        newPosition = 10; // Ir a la cárcel
                        player.Position = newPosition;
                        player.Status = PlayerStatus.InJail;
                        player.TurnsInJail = 0;
                        specialAction = "GoToJail";
                        break;

                    case TileType.IncomeTax:
                        int incomeTax = Math.Min(200, (int)(player.Money * 0.1));
                        player.Money -= incomeTax;
                        specialAction = $"IncomeTax:{incomeTax}";
                        break;

                    case TileType.LuxuryTax:
                        player.Money -= 100;
                        specialAction = "LuxuryTax:100";
                        break;

                    case TileType.FreeParking:
                        specialAction = "FreeParking";
                        break;

                    case TileType.Property:
                    case TileType.Railroad:
                    case TileType.Utility:
                        if (property != null)
                        {
                            if (property.OwnerId == null)
                            {
                                canBuyProperty = player.Money >= property.Price;
                            }
                            else if (property.OwnerId != playerId)
                            {
                                mustPayRent = true;
                                int rent = CalculateRent(property, game.Players, total);
                                player.Money -= rent;
                                var owner = game.Players.FirstOrDefault(p => p.Id == property.OwnerId);
                                if (owner != null)
                                {
                                    owner.Money += rent;
                                }

                                if (player.Money < 0)
                                {
                                    player.Status = PlayerStatus.Bankrupt;
                                }
                            }
                        }
                        break;
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
                SpecialAction = specialAction,
                IsInJail = player.Status == PlayerStatus.InJail,
                TurnsInJail = player.TurnsInJail,
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
                return ApiResponse<GameDto>.Error("La propiedad ya tiene dueรฑo");
            }

            if (player.Position != property.Tile.Position)
            {
                return ApiResponse<GameDto>.Error("No estรกs en esta propiedad");
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

        public async Task<ApiResponse<GameDto>> PayJailFineAsync(Guid gameId, Guid playerId)
        {
            var game = await _context.Games
                .Include(g => g.Players)
                .FirstOrDefaultAsync(g => g.Id == gameId);

            if (game == null)
            {
                return ApiResponse<GameDto>.Error("Juego no encontrado");
            }

            var player = game.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null)
            {
                return ApiResponse<GameDto>.Error("Jugador no encontrado");
            }

            if (player.Status != PlayerStatus.InJail)
            {
                return ApiResponse<GameDto>.Error("El jugador no está en la cárcel");
            }

            if (player.Money < 50)
            {
                return ApiResponse<GameDto>.Error("No tienes suficiente dinero para pagar la fianza (se necesitan $50)");
            }

            player.Money -= 50;
            player.Status = PlayerStatus.Active;
            player.TurnsInJail = 0;

            await _context.SaveChangesAsync();

            var gameDto = await MapToGameDtoAsync(game.Id);
            return ApiResponse<GameDto>.Ok(gameDto, "Fianza pagada, has salido de la cárcel");
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

            // Verificar si el juego terminรณ (todos los jugadores excepto uno estรกn en bancarrota)
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

        /// <summary>
        /// Calcula el alquiler de una propiedad considerando ferrocarriles y servicios públicos
        /// </summary>
        private int CalculateRent(Property property, List<Player> players, int diceTotal)
        {
            var owner = players.FirstOrDefault(p => p.Id == property.OwnerId);
            if (owner == null) return property.Rent;

            // Para ferrocarriles: el alquiler depende de cuántos ferrocarriles tiene el dueño
            if (property.ColorGroup == "Railroad")
            {
                var ownedRailroads = owner.Properties.Count(p => p.ColorGroup == "Railroad");
                return ownedRailroads switch
                {
                    1 => 25,
                    2 => 50,
                    3 => 100,
                    4 => 200,
                    _ => 25
                };
            }

            // Para servicios públicos: el alquiler es 4x o 10x el resultado de los dados
            if (property.ColorGroup == "Utility")
            {
                var ownedUtilities = owner.Properties.Count(p => p.ColorGroup == "Utility");
                return ownedUtilities == 1 ? diceTotal * 4 : diceTotal * 10;
            }

            // Para propiedades normales, usar el alquiler base
            return property.Rent;
        }

        private Board CreateStandardBoard(Guid gameId)
        {
            var board = new Board
            {
                Id = Guid.NewGuid(),
                GameId = gameId,
                Tiles = new List<Tile>()
            };

            // Obtener la definición del tablero estándar desde el servicio de plantilla
            var boardTemplate = BoardTemplateService.GetStandardBoard();

            // Crear las casillas y propiedades basadas en la plantilla
            for (int position = 0; position < boardTemplate.Count; position++)
            {
                var tileDefinition = boardTemplate[position];
                
                var tile = new Tile
                {
                    Id = Guid.NewGuid(),
                    Name = tileDefinition.Name,
                    Type = tileDefinition.Type,
                    Position = position,
                    BoardId = board.Id
                };

                // Si la casilla tiene una propiedad asociada, crearla
                if (tileDefinition.Property != null)
                {
                    var property = new Property
                    {
                        Id = Guid.NewGuid(),
                        Name = tileDefinition.Property.Name,
                        Price = tileDefinition.Property.Price,
                        Rent = tileDefinition.Property.Rent,
                        ColorGroup = tileDefinition.Property.ColorGroup,
                        Tile = tile,
                        OwnerId = null // Las propiedades empiezan sin dueño
                    };
                    
                    tile.Property = property;
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
