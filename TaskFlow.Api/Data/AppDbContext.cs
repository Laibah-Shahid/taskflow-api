using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Models;

namespace TaskFlow.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // Seed one user for login testing
    var hasher = new PasswordHasher<ApplicationUser>();
    const string seededUserId = "11111111-1111-1111-1111-111111111111";

    var seededUser = new ApplicationUser
    {
        Id = seededUserId,
        UserName = "demo@taskflow.local",
        NormalizedUserName = "DEMO@TASKFLOW.LOCAL",
        Email = "demo@taskflow.local",
        NormalizedEmail = "DEMO@TASKFLOW.LOCAL",
        EmailConfirmed = true,
        SecurityStamp = "STATIC-SECURITY-STAMP-FOR-SEED-0001",
        ConcurrencyStamp = "STATIC-CONCURRENCY-STAMP-FOR-SEED-0001"
    };

    seededUser.PasswordHash = hasher.HashPassword(seededUser, "Demo@123");

    modelBuilder.Entity<ApplicationUser>().HasData(seededUser);
}
}