using monopoly_backend.Models.Enums;

namespace monopoly_backend.Models.Entities
{
    public class Tile
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public TileType Type { get; set; }
        public int Position { get; set; }
        
        // Navigation properties
        public Guid BoardId { get; set; }
        public Board Board { get; set; } = null!;
        public Property? Property { get; set; }
    }
}
