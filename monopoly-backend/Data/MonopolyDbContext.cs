using Microsoft.EntityFrameworkCore;
using monopoly_backend.Models.Entities;
using monopoly_backend.Models.Enums;

namespace monopoly_backend.Data
{
    public class MonopolyDbContext : DbContext
    {
        public MonopolyDbContext(DbContextOptions<MonopolyDbContext> options)
            : base(options)
        {
        }

        public DbSet<Game> Games { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<Board> Boards { get; set; }
        public DbSet<Tile> Tiles { get; set; }
        public DbSet<Property> Properties { get; set; }
        public DbSet<Turn> Turns { get; set; }
        public DbSet<DiceRoll> DiceRolls { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Game configuration
            modelBuilder.Entity<Game>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status)
                    .HasConversion<int>();
                entity.Property(e => e.CreatedAt)
                    .IsRequired();
                
                entity.HasOne(e => e.CurrentTurnPlayer)
                    .WithMany()
                    .HasForeignKey(e => e.CurrentTurnPlayerId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.Board)
                    .WithOne(b => b.Game)
                    .HasForeignKey<Board>(b => b.GameId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Player configuration
            modelBuilder.Entity<Player>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(50);
                entity.Property(e => e.Color)
                    .IsRequired()
                    .HasMaxLength(20);
                entity.Property(e => e.Status)
                    .HasConversion<int>();
                entity.Property(e => e.Money)
                    .HasDefaultValue(1500);
                entity.Property(e => e.Position)
                    .HasDefaultValue(0);

                entity.HasOne(e => e.Game)
                    .WithMany(g => g.Players)
                    .HasForeignKey(e => e.GameId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Board configuration
            modelBuilder.Entity<Board>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.GameId)
                    .IsUnique();
            });

            // Tile configuration
            modelBuilder.Entity<Tile>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                    .ValueGeneratedNever();
                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);
                entity.Property(e => e.Type)
                    .HasConversion<int>();
                entity.Property(e => e.Position)
                    .IsRequired();

                entity.HasOne(e => e.Board)
                    .WithMany(b => b.Tiles)
                    .HasForeignKey(e => e.BoardId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Property)
                    .WithOne(p => p.Tile)
                    .HasForeignKey<Property>(p => p.TileId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Property configuration
            modelBuilder.Entity<Property>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);
                entity.Property(e => e.ColorGroup)
                    .HasMaxLength(50);
                
                entity.HasIndex(e => e.TileId)
                    .IsUnique();

                entity.HasOne(e => e.Owner)
                    .WithMany(p => p.Properties)
                    .HasForeignKey(e => e.OwnerId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Turn configuration
            modelBuilder.Entity<Turn>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.StartedAt)
                    .IsRequired();

                entity.HasOne(e => e.Game)
                    .WithMany(g => g.Turns)
                    .HasForeignKey(e => e.GameId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Player)
                    .WithMany(p => p.Turns)
                    .HasForeignKey(e => e.PlayerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.DiceRoll)
                    .WithOne(d => d.Turn)
                    .HasForeignKey<DiceRoll>(d => d.TurnId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // DiceRoll configuration
            modelBuilder.Entity<DiceRoll>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.RolledAt)
                    .IsRequired();
                
                entity.HasIndex(e => e.TurnId)
                    .IsUnique();

                entity.Ignore(e => e.Total);
                entity.Ignore(e => e.IsDouble);
            });
        }
    }
}
