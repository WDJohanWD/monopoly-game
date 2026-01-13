using monopoly_backend.Models.Entities;

namespace monopoly_backend.Models.Entities
{
    public class Game
    {
        public Guid Id;
        public string Status { get; set; }
        public List<Player> Players { get; set; }
        public Player CurrentTurn { get; set; }
        public int round { get; set; }
    }
}
