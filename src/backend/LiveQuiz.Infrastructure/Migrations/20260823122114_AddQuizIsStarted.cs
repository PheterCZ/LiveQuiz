using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiveQuiz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQuizIsStarted : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsStarted",
                table: "Quizzes",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsStarted",
                table: "Quizzes");
        }
    }
}
