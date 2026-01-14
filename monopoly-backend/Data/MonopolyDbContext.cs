using Microsoft.EntityFrameworkCore;

public class MonopolyDbContext : DbContext
{
    public MonopolyDbContext(DbContextOptions<MonopolyDbContext> options)
        : base(options)
    {
    }
}