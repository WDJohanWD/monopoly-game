namespace monopoly_backend.Models.Entities
{
    public class Board
    {
        public Guid Id { get; set; }
        public Guid GameId { get; set; }
        
        // Navigation properties
        public Game Game { get; set; } = null!;
        public List<Tile> Tiles { get; set; } = new();
    }
}
