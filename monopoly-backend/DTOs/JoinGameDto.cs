using System.ComponentModel.DataAnnotations;

namespace monopoly_backend.DTOs
{
    public class JoinGameDto
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = null!;
        
        [Required]
        [StringLength(20)]
        public string Color { get; set; } = null!;
    }
}
