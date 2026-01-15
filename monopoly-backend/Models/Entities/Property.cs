namespace monopoly_backend.Models.Entities
{
    public class Property
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public int Price { get; set; }
        public int Rent { get; set; }
        public string? ColorGroup { get; set; }
        
        // Navigation properties
        public int TileId { get; set; }
        public Tile Tile { get; set; } = null!;
        public Guid? OwnerId { get; set; }
        public Player? Owner { get; set; }
    }
}
