using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskFlow.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixSeededUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "CreatedAt", "Email", "EmailConfirmed", "FullName", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UserName" },
                values: new object[] { "11111111-1111-1111-1111-111111111111", 0, "STATIC-CONCURRENCY-STAMP-FOR-SEED-0001", new DateTime(2026, 4, 19, 11, 52, 56, 780, DateTimeKind.Utc).AddTicks(9846), "demo@taskflow.local", true, "", false, null, "DEMO@TASKFLOW.LOCAL", "DEMO@TASKFLOW.LOCAL", "AQAAAAIAAYagAAAAENtV8gRtWwmfi3VUv2kNe2I1UzQF27hZXOJs+Akuy4dHgRegQTZ3+ZT2d/v01NyZWg==", null, false, "STATIC-SECURITY-STAMP-FOR-SEED-0001", false, "demo@taskflow.local" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "11111111-1111-1111-1111-111111111111");
        }
    }
}
