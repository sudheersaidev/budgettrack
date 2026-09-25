//THIS imports enitity  classes of the project
using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    //dcontext is class from ef that manages db operations.
    public class BudgetDbContext : DbContext
    {
        //this constructor allows us to pass options (like connection string) and config the db
        public BudgetDbContext(DbContextOptions<BudgetDbContext> options) : base(options) { }

        //represents table in the database
        public DbSet<User> Users { get; set; }

        // FIX: Ensure this is exactly 'Budgets' and remove the 'object Budget' line below it
        public DbSet<Budget> Budgets { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<TopUpRequest> TopUpRequests { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<LoginLog> LoginLogs { get; set; }

        //config database rules like keys, relationships,seed data, and how enums are stored
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            //this defines  the primary key for the User table as UserID
            modelBuilder.Entity<User>().HasKey(u => u.UserID);

            // This ensures Enums are saved as "IT" or "Admin" instead of 0 or 1
            modelBuilder.Entity<User>()
                //selecting property of entity
                .Property(u => u.Role)
                //used to convert enum to string
                .HasConversion<string>();


            modelBuilder.Entity<User>()
                .Property(u => u.Department)
                .HasConversion<string>();
            modelBuilder.Entity<LoginLog>().HasKey(l => l.LogID);
            // ADD THIS: Also convert the Budget Department to string for the database
            modelBuilder.Entity<Budget>()
                .Property(b => b.Department)
                .HasConversion<string>();

            //used to seed initial data into the database
            modelBuilder.Entity<Category>().HasData(
        new Category { Id = 1, Name = "Travel", Enabled = true },
        new Category { Id = 2, Name = "Food", Enabled = true },
        new Category { Id = 3, Name = "Infrastructure", Enabled = true },
        new Category { Id = 4, Name = "Entertainment", Enabled = true },
        new Category { Id = 5, Name = "Office Supplies", Enabled = true },
        new Category { Id = 6, Name = "Software", Enabled = true }
    );
        }
    }
}