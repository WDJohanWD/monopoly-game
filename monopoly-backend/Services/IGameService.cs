using monopoly_backend.DTOs;

namespace monopoly_backend.Services
{
    public interface IGameService
    {
        Task<ApiResponse<GameDto>> CreateGameAsync(CreateGameDto createGameDto);
        Task<ApiResponse<GameDto>> JoinGameAsync(Guid gameId, JoinGameDto joinGameDto);
        Task<ApiResponse<GameDto>> GetGameAsync(Guid gameId);
        Task<ApiResponse<RollDiceResponseDto>> RollDiceAsync(Guid gameId, Guid playerId);
        Task<ApiResponse<GameDto>> BuyPropertyAsync(Guid gameId, Guid playerId, BuyPropertyDto buyPropertyDto);
        Task<ApiResponse<GameDto>> PayJailFineAsync(Guid gameId, Guid playerId);
        Task<ApiResponse<GameDto>> EndTurnAsync(Guid gameId, Guid playerId);
    }
}
