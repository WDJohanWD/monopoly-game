namespace monopoly_backend.Models.Entities
{
    public class Player
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public int Money { get; set; }
        public int Position { get; set; }
        public string Color { get; set; } = null!;
    }
}
