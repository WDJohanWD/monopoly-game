namespace monopoly_backend.Models.Entities
{
    public class Turn
    {
        public Guid Id { get; set; }
        public int TurnNumber { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        
        // Navigation properties
        public Guid GameId { get; set; }
        public Game Game { get; set; } = null!;
        public Guid PlayerId { get; set; }
        public Player Player { get; set; } = null!;
        public DiceRoll? DiceRoll { get; set; }
    }
}
