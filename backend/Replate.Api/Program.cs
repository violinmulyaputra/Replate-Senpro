using Microsoft.EntityFrameworkCore;
using Replate.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddDbContext<ReplateDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException(
            "Set ConnectionStrings__DefaultConnection before using the database.")));

var app = builder.Build();

app.UseExceptionHandler();
app.MapControllers();

app.Run();
