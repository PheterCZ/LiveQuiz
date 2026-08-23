using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiveQuiz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHostToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HostToken",
                table: "Quizzes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HostToken",
                table: "Quizzes");
        }
    }
}
