using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Data;
using TaskFlow.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// ---------- Services ----------

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// EF Core + MySQL (Pomelo)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("DefaultConnection not configured.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Identity
builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;
        options.User.RequireUniqueEmail = false;

    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// ---------- Pipeline ----------

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seed roles + admin user on startup
using (var scope = app.Services.CreateScope())
{
    await DataSeeder.SeedAsync(scope.ServiceProvider);
}

app.Run();