using monopoly_backend.Models.Enums;

namespace monopoly_backend.Models.Entities
{
    public class Game
    {
        public Guid Id { get; set; }
        public GameStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? FinishedAt { get; set; }
        public int Round { get; set; }
        
        // Navigation properties
        public Guid? CurrentTurnPlayerId { get; set; }
        public Player? CurrentTurnPlayer { get; set; }
        public List<Player> Players { get; set; } = new();
        public Board? Board { get; set; }
        public List<Turn> Turns { get; set; } = new();
    }
}
