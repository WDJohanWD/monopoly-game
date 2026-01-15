using System.ComponentModel.DataAnnotations;

namespace monopoly_backend.DTOs
{
    public class CreateGameDto
    {
        [Required]
        [MinLength(2)]
        [MaxLength(4)]
        public List<CreatePlayerDto> Players { get; set; } = new();
    }
    
    public class CreatePlayerDto
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = null!;
        
        [Required]
        [StringLength(20)]
        public string Color { get; set; } = null!;
    }
}
