using Microsoft.AspNetCore.Identity;
using TaskFlow.Api.Models;

namespace TaskFlow.Api.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var config = services.GetRequiredService<IConfiguration>();
        var logger = services.GetRequiredService<ILogger<AppDbContext>>();

        var seedEmail = config["SeedUser:Email"]!;
        var seedPassword = config["SeedUser:Password"]!;
        var seedFullName = config["SeedUser:FullName"]!;

        if (await userManager.FindByEmailAsync(seedEmail) is null)
        {
            var user = new ApplicationUser
            {
                UserName = "testuser",
                Email = seedEmail,
                EmailConfirmed = true,
                FullName = seedFullName
            };
            var result = await userManager.CreateAsync(user, seedPassword);
            if (result.Succeeded)
                logger.LogInformation("Seeded user {Email}", seedEmail);
            else
                logger.LogError("User seed failed: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }
}