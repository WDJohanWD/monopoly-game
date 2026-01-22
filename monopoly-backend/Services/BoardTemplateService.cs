using monopoly_backend.Models.Enums;

namespace monopoly_backend.Services
{
    public static class BoardTemplateService
    {
        public class TileDefinition
        {
            public string Name { get; set; } = null!;
            public TileType Type { get; set; }
            public PropertyDefinition? Property { get; set; }
        }

        public class PropertyDefinition
        {
            public string Name { get; set; } = null!;
            public int Price { get; set; }
            public int Rent { get; set; }
            public string ColorGroup { get; set; } = null!;
        }

        /// <summary>
        /// Obtiene la definición completa del tablero estándar de Monopoly
        /// </summary>
        public static List<TileDefinition> GetStandardBoard()
        {
            return new List<TileDefinition>
            {
                // Posición 0: Go
                new TileDefinition { Name = "Go", Type = TileType.Go, Property = null },
                
                // Posición 1: Mediterranean Avenue (Brown)
                new TileDefinition 
                { 
                    Name = "Mediterranean Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Mediterranean Avenue", 
                        Price = 60, 
                        Rent = 2, 
                        ColorGroup = "Brown" 
                    } 
                },
                
                // Posición 2: Community Chest
                new TileDefinition { Name = "Community Chest", Type = TileType.CommunityChest, Property = null },
                
                // Posición 3: Baltic Avenue (Brown)
                new TileDefinition 
                { 
                    Name = "Baltic Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Baltic Avenue", 
                        Price = 60, 
                        Rent = 4, 
                        ColorGroup = "Brown" 
                    } 
                },
                
                // Posición 4: Income Tax
                new TileDefinition { Name = "Income Tax", Type = TileType.IncomeTax, Property = null },
                
                // Posición 5: Reading Railroad
                new TileDefinition 
                { 
                    Name = "Reading Railroad", 
                    Type = TileType.Railroad, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Reading Railroad", 
                        Price = 200, 
                        Rent = 25, 
                        ColorGroup = "Railroad" 
                    } 
                },
                
                // Posición 6: Oriental Avenue (Light Blue)
                new TileDefinition 
                { 
                    Name = "Oriental Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Oriental Avenue", 
                        Price = 100, 
                        Rent = 6, 
                        ColorGroup = "Light Blue" 
                    } 
                },
                
                // Posición 7: Chance
                new TileDefinition { Name = "Chance", Type = TileType.Chance, Property = null },
                
                // Posición 8: Vermont Avenue (Light Blue)
                new TileDefinition 
                { 
                    Name = "Vermont Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Vermont Avenue", 
                        Price = 100, 
                        Rent = 6, 
                        ColorGroup = "Light Blue" 
                    } 
                },
                
                // Posición 9: Connecticut Avenue (Light Blue)
                new TileDefinition 
                { 
                    Name = "Connecticut Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Connecticut Avenue", 
                        Price = 120, 
                        Rent = 8, 
                        ColorGroup = "Light Blue" 
                    } 
                },
                
                // Posición 10: Jail / Just Visiting
                new TileDefinition { Name = "Jail", Type = TileType.Jail, Property = null },
                
                // Posición 11: St. Charles Place (Pink)
                new TileDefinition 
                { 
                    Name = "St. Charles Place", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "St. Charles Place", 
                        Price = 140, 
                        Rent = 10, 
                        ColorGroup = "Pink" 
                    } 
                },
                
                // Posición 12: Electric Company (Utility)
                new TileDefinition 
                { 
                    Name = "Electric Company", 
                    Type = TileType.Utility, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Electric Company", 
                        Price = 150, 
                        Rent = 0, 
                        ColorGroup = "Utility" 
                    } 
                },
                
                // Posición 13: States Avenue (Pink)
                new TileDefinition 
                { 
                    Name = "States Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "States Avenue", 
                        Price = 140, 
                        Rent = 10, 
                        ColorGroup = "Pink" 
                    } 
                },
                
                // Posición 14: Virginia Avenue (Pink)
                new TileDefinition 
                { 
                    Name = "Virginia Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Virginia Avenue", 
                        Price = 160, 
                        Rent = 12, 
                        ColorGroup = "Pink" 
                    } 
                },
                
                // Posición 15: Pennsylvania Railroad
                new TileDefinition 
                { 
                    Name = "Pennsylvania Railroad", 
                    Type = TileType.Railroad, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Pennsylvania Railroad", 
                        Price = 200, 
                        Rent = 25, 
                        ColorGroup = "Railroad" 
                    } 
                },
                
                // Posición 16: St. James Place (Orange)
                new TileDefinition 
                { 
                    Name = "St. James Place", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "St. James Place", 
                        Price = 180, 
                        Rent = 14, 
                        ColorGroup = "Orange" 
                    } 
                },
                
                // Posición 17: Community Chest
                new TileDefinition { Name = "Community Chest", Type = TileType.CommunityChest, Property = null },
                
                // Posición 18: Tennessee Avenue (Orange)
                new TileDefinition 
                { 
                    Name = "Tennessee Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Tennessee Avenue", 
                        Price = 180, 
                        Rent = 14, 
                        ColorGroup = "Orange" 
                    } 
                },
                
                // Posición 19: New York Avenue (Orange)
                new TileDefinition 
                { 
                    Name = "New York Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "New York Avenue", 
                        Price = 200, 
                        Rent = 16, 
                        ColorGroup = "Orange" 
                    } 
                },
                
                // Posición 20: Free Parking
                new TileDefinition { Name = "Free Parking", Type = TileType.FreeParking, Property = null },
                
                // Posición 21: Kentucky Avenue (Red)
                new TileDefinition 
                { 
                    Name = "Kentucky Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Kentucky Avenue", 
                        Price = 220, 
                        Rent = 18, 
                        ColorGroup = "Red" 
                    } 
                },
                
                // Posición 22: Chance
                new TileDefinition { Name = "Chance", Type = TileType.Chance, Property = null },
                
                // Posición 23: Indiana Avenue (Red)
                new TileDefinition 
                { 
                    Name = "Indiana Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Indiana Avenue", 
                        Price = 220, 
                        Rent = 18, 
                        ColorGroup = "Red" 
                    } 
                },
                
                // Posición 24: Illinois Avenue (Red)
                new TileDefinition 
                { 
                    Name = "Illinois Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Illinois Avenue", 
                        Price = 240, 
                        Rent = 20, 
                        ColorGroup = "Red" 
                    } 
                },
                
                // Posición 25: B&O Railroad
                new TileDefinition 
                { 
                    Name = "B&O Railroad", 
                    Type = TileType.Railroad, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "B&O Railroad", 
                        Price = 200, 
                        Rent = 25, 
                        ColorGroup = "Railroad" 
                    } 
                },
                
                // Posición 26: Atlantic Avenue (Yellow)
                new TileDefinition 
                { 
                    Name = "Atlantic Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Atlantic Avenue", 
                        Price = 260, 
                        Rent = 22, 
                        ColorGroup = "Yellow" 
                    } 
                },
                
                // Posición 27: Ventnor Avenue (Yellow)
                new TileDefinition 
                { 
                    Name = "Ventnor Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Ventnor Avenue", 
                        Price = 260, 
                        Rent = 22, 
                        ColorGroup = "Yellow" 
                    } 
                },
                
                // Posición 28: Water Works (Utility)
                new TileDefinition 
                { 
                    Name = "Water Works", 
                    Type = TileType.Utility, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Water Works", 
                        Price = 150, 
                        Rent = 0, 
                        ColorGroup = "Utility" 
                    } 
                },
                
                // Posición 29: Marvin Gardens (Yellow)
                new TileDefinition 
                { 
                    Name = "Marvin Gardens", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Marvin Gardens", 
                        Price = 280, 
                        Rent = 24, 
                        ColorGroup = "Yellow" 
                    } 
                },
                
                // Posición 30: Go To Jail
                new TileDefinition { Name = "Go To Jail", Type = TileType.GoToJail, Property = null },
                
                // Posición 31: Pacific Avenue (Green)
                new TileDefinition 
                { 
                    Name = "Pacific Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Pacific Avenue", 
                        Price = 300, 
                        Rent = 26, 
                        ColorGroup = "Green" 
                    } 
                },
                
                // Posición 32: North Carolina Avenue (Green)
                new TileDefinition 
                { 
                    Name = "North Carolina Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "North Carolina Avenue", 
                        Price = 300, 
                        Rent = 26, 
                        ColorGroup = "Green" 
                    } 
                },
                
                // Posición 33: Community Chest
                new TileDefinition { Name = "Community Chest", Type = TileType.CommunityChest, Property = null },
                
                // Posición 34: Pennsylvania Avenue (Green)
                new TileDefinition 
                { 
                    Name = "Pennsylvania Avenue", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Pennsylvania Avenue", 
                        Price = 320, 
                        Rent = 28, 
                        ColorGroup = "Green" 
                    } 
                },
                
                // Posición 35: Short Line Railroad
                new TileDefinition 
                { 
                    Name = "Short Line", 
                    Type = TileType.Railroad, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Short Line", 
                        Price = 200, 
                        Rent = 25, 
                        ColorGroup = "Railroad" 
                    } 
                },
                
                // Posición 36: Chance
                new TileDefinition { Name = "Chance", Type = TileType.Chance, Property = null },
                
                // Posición 37: Park Place (Dark Blue)
                new TileDefinition 
                { 
                    Name = "Park Place", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Park Place", 
                        Price = 350, 
                        Rent = 35, 
                        ColorGroup = "Dark Blue" 
                    } 
                },
                
                // Posición 38: Luxury Tax
                new TileDefinition { Name = "Luxury Tax", Type = TileType.LuxuryTax, Property = null },
                
                // Posición 39: Boardwalk (Dark Blue)
                new TileDefinition 
                { 
                    Name = "Boardwalk", 
                    Type = TileType.Property, 
                    Property = new PropertyDefinition 
                    { 
                        Name = "Boardwalk", 
                        Price = 400, 
                        Rent = 50, 
                        ColorGroup = "Dark Blue" 
                    } 
                }
            };
        }
    }
}
