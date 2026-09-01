using ECommerce.Api.Configuration;
using ECommerce.Api.Data;
using ECommerce.Api.Middleware;
using ECommerce.Api.Services.Products;
using ECommerce.Api.Services.Categories;
using ECommerce.Api.Services.Profile;
using ECommerce.Api.Services.Cart;
using ECommerce.Api.Services.Addresses;
using ECommerce.Api.Services.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

static string RequireConfigurationValue(IConfiguration configuration, string key)
{
    var value = configuration[key];
    if (string.IsNullOrWhiteSpace(value))
    {
        throw new InvalidOperationException($"Required configuration '{key}' is missing.");
    }

    return value;
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var connectionString = RequireConfigurationValue(builder.Configuration, "ConnectionStrings:ECommerce");
var issuer = RequireConfigurationValue(builder.Configuration, "Jwt:Issuer");
var audience = RequireConfigurationValue(builder.Configuration, "Jwt:Audience");
var secretKey = RequireConfigurationValue(builder.Configuration, "Jwt:Key");

if (Encoding.UTF8.GetByteCount(secretKey) < 32)
{
    throw new InvalidOperationException("JWT signing key must be at least 32 bytes.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton(serviceProvider =>
{
    var section = serviceProvider
        .GetRequiredService<IConfiguration>()
        .GetSection("BootstrapAdmin");
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IAddressService, AddressService>();

    return new BootstrapAdminOptions(
        section["Email"],
        section["Password"],
        section["FullName"]);
});
builder.Services.AddScoped<DevelopmentAdminBootstrapper>();

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddHostedService<DevelopmentAdminBootstrapHostedService>();
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? [];

        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (!app.Environment.IsEnvironment("Testing"))
{
    app.UseHttpsRedirection();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program;
