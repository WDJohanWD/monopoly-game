namespace monopoly_backend.Models.Entities
{
    public class DiceRoll
    {
        public Guid Id { get; set; }
        public int Die1 { get; set; }
        public int Die2 { get; set; }
        public int Total => Die1 + Die2;
        public bool IsDouble => Die1 == Die2;
        public DateTime RolledAt { get; set; }
        
        // Navigation properties
        public Guid TurnId { get; set; }
        public Turn Turn { get; set; } = null!;
    }
}
