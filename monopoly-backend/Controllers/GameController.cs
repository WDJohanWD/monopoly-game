using Microsoft.AspNetCore.Mvc;
using monopoly_backend.DTOs;
using monopoly_backend.Services;

namespace monopoly_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        private readonly IGameService _gameService;

        public GameController(IGameService gameService)
        {
            _gameService = gameService;
        }

        /// <summary>
        /// Crea un nuevo juego
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<GameDto>>> CreateGame([FromBody] CreateGameDto createGameDto)
        {
            var result = await _gameService.CreateGameAsync(createGameDto);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Obtiene el estado de un juego
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<GameDto>>> GetGame(Guid id)
        {
            var result = await _gameService.GetGameAsync(id);
            
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Une un jugador a un juego existente
        /// </summary>
        [HttpPost("{id}/join")]
        public async Task<ActionResult<ApiResponse<GameDto>>> JoinGame(Guid id, [FromBody] JoinGameDto joinGameDto)
        {
            var result = await _gameService.JoinGameAsync(id, joinGameDto);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Lanza los dados para el jugador actual
        /// </summary>
        [HttpPost("{id}/roll")]
        public async Task<ActionResult<ApiResponse<RollDiceResponseDto>>> RollDice(
            Guid id, 
            [FromQuery] Guid playerId)
        {
            var result = await _gameService.RollDiceAsync(id, playerId);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Compra una propiedad
        /// </summary>
        [HttpPost("{id}/buy")]
        public async Task<ActionResult<ApiResponse<GameDto>>> BuyProperty(
            Guid id, 
            [FromQuery] Guid playerId,
            [FromBody] BuyPropertyDto buyPropertyDto)
        {
            var result = await _gameService.BuyPropertyAsync(id, playerId, buyPropertyDto);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Termina el turno del jugador actual
        /// </summary>
        [HttpPost("{id}/end-turn")]
        public async Task<ActionResult<ApiResponse<GameDto>>> EndTurn(
            Guid id, 
            [FromQuery] Guid playerId)
        {
            var result = await _gameService.EndTurnAsync(id, playerId);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
