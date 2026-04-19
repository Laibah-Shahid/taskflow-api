using TaskFlow.Api.Models;

namespace TaskFlow.Api.Services;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(ApplicationUser user);
}