namespace monopoly_backend.DTOs
{
    public class DiceRollDto
    {
        public Guid Id { get; set; }
        public int Die1 { get; set; }
        public int Die2 { get; set; }
        public int Total { get; set; }
        public bool IsDouble { get; set; }
        public DateTime RolledAt { get; set; }
        public Guid TurnId { get; set; }
    }
    
    public class RollDiceResponseDto
    {
        public DiceRollDto DiceRoll { get; set; } = null!;
        public int NewPosition { get; set; }
        public bool CanBuyProperty { get; set; }
        public bool MustPayRent { get; set; }
        public PropertyDto? LandedOnProperty { get; set; }
    }
}
