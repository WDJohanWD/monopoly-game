using monopoly_backend.Models.Enums;

namespace monopoly_backend.DTOs
{
    public class GameDto
    {
        public Guid Id { get; set; }
        public GameStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? FinishedAt { get; set; }
        public int Round { get; set; }
        public Guid? CurrentTurnPlayerId { get; set; }
        public List<PlayerDto> Players { get; set; } = new();
        public BoardDto? Board { get; set; }
    }
    
    public class PlayerDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public int Money { get; set; }
        public int Position { get; set; }
        public string Color { get; set; } = null!;
        public PlayerStatus Status { get; set; }
        public int TurnsInJail { get; set; }
        public List<PropertyDto> Properties { get; set; } = new();
    }
    
    public class BoardDto
    {
        public Guid Id { get; set; }
        public List<TileDto> Tiles { get; set; } = new();
    }
    
    public class TileDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public TileType Type { get; set; }
        public int Position { get; set; }
        public PropertyDto? Property { get; set; }
    }
    
    public class PropertyDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public int Price { get; set; }
        public int Rent { get; set; }
        public string? ColorGroup { get; set; }
        public Guid? OwnerId { get; set; }
        public string? OwnerName { get; set; }
    }
}
