using monopoly_backend.Models.Enums;

namespace monopoly_backend.Models.Entities
{
    public class Player
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public int Money { get; set; }
        public int Position { get; set; }
        public string Color { get; set; } = null!;
        public PlayerStatus Status { get; set; }
        public int TurnsInJail { get; set; }
        
        // Navigation properties
        public Guid GameId { get; set; }
        public Game Game { get; set; } = null!;
        public List<Property> Properties { get; set; } = new();
        public List<Turn> Turns { get; set; } = new();
    }
}
