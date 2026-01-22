using Microsoft.EntityFrameworkCore;
using monopoly_backend.Data;
using monopoly_backend.Services;

var builder = WebApplication.CreateBuilder(args);

// 🔹 Controllers
builder.Services.AddControllers();

// 🔹 Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🔹 EF Core + SQL Server / In-Memory for Development
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<MonopolyDbContext>(options =>
{
    // Use in-memory database for development (temporary data)
    options.UseInMemoryDatabase("MonopolyDb");
});

// 🔹 Services
builder.Services.AddScoped<IGameService, GameService>();

// 🔹 CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();
