using backend.Data;
using backend.Repositories.Implementations;
using backend.Repositories.Interfaces;
using backend.Services.Implementations;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

//used for creating the web application and configuring services.
var builder = WebApplication.CreateBuilder(args);



// 1. Database & DI
//Registering DbContext,specifying SQL Server as the database getting connection string from config.
// This allows us to inject BudgetDbContext into our repositories and services.
builder.Services.AddDbContext<BudgetDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


// Registering repositories & services for dependency injection.
builder.Services.AddScoped<IUserRepository, SqlUserRepository>();
//one instance is created per request and shared within that request.
builder.Services.AddScoped<IBudgetRepository,SqlBudgetRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
// Replace 'BudgetService' with the actual name of your implementation class
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddScoped<IExpenseRepository, SqlExpenseRepository>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<ITopRequestRepository, SqlTopRequestRepository>();
builder.Services.AddScoped<ITopRequestService, TopRequestService>();
// Update this line to use the new SqlApprovalRepository class
builder.Services.AddScoped<IApprovalRepository, SqlApprovalRepository>();
builder.Services.AddScoped<IApprovalService, ApprovalService>();
builder.Services.AddScoped<IFinancialRepository, SqlFinancialRepository>();
builder.Services.AddScoped<IFinancialService, FinancialService>();
builder.Services.AddScoped<ICategoryRepository, SqlCategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

// 2. CORS (OK for local dev; tighten for prod)
// cors stands for Cross-Origin Resource Sharing    
// it allows or restricts web applications from making requests 

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        //allows req from any domain eg ports
        policy.AllowAnyOrigin()
        //all http methods
              .AllowAnyMethod()
        //all headers eg content-type, authorization
              .AllowAnyHeader();
    });
});

// 3. Authentication (JWT)
//looks into appsettings.json for Jwt:Key
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new Exception("JWT Key is missing in appsettings.json (Jwt:Key)");
}


//this is used for validating the user and we are giving how to validate it
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        //defines the rules for how the JWT token should be validated when a request comes in with a token
        options.TokenValidationParameters = new TokenValidationParameters
        {
            // Verify that the server that created the token is trusted
            ValidateIssuer = true,
            // Ensure the token is intended for this specific API/audience
            ValidateAudience = true,
            // Check if the token has expired
            ValidateLifetime = true,
            // Ensure the token's digital signature is valid and hasn't been modified
            ValidateIssuerSigningKey = true,
            // Pull values from appsettings.json
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            // The secret key used to decrypt/verify the signature
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });


// 4. Controllers + JSON (Enum as string)
//used to add controller support to the application and configure how JSON serialization works
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        //used to convert enum values to their string representation in JSON instead of numeric values
        //used to make the API responses more readable and easier to understand for clients consuming the API
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// 5. Swagger
//used for generating interactive API documentation and testing the API endpoints directly from the browser
builder.Services.AddEndpointsApiExplorer();
//used to generate the Swagger documentation based on the API endpoints 
builder.Services.AddSwaggerGen(options =>
{
    // 1. Define the security scheme (tells Swagger how the token should look)
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });
    // 2. Apply the security requirement (adds the 'Authorize' lock icon to all API endpoints)
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

//this is where the application is built and the middleware pipeline is configured
//and start process the req
var app = builder.Build();

// 6. Middleware Pipeline
//checks whether the app is running in development environment
if (app.Environment.IsDevelopment())
{
    //generates api documentation in json format
    app.UseSwagger();
    //web ui to test api
    app.UseSwaggerUI();
}


//redirect http req to https
app.UseHttpsRedirection();

//enable cors
//allows frontend apps fro other domain to call api
app.UseCors("AllowAll");

//uses jwt who the user is
app.UseAuthentication();
//checks permission to access the resource
app.UseAuthorization();

//maps http req to controller edpoints
app.MapControllers();

//starts the application
app.Run();