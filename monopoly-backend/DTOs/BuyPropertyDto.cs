using System.ComponentModel.DataAnnotations;

namespace monopoly_backend.DTOs
{
    public class BuyPropertyDto
    {
        [Required]
        public Guid PropertyId { get; set; }
    }
}
