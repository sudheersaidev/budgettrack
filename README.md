

```markdown
 📊 BudgetTrack – Internal Budget Planning & Expense Management System

An end-to-end, full-stack enterprise web application designed to streamline internal organizational budgets, track departmental expense workflows, and deliver real-time financial analytics.

---

🧑‍💻 🛠️ Tech Stack

💠Frontend: Angular 18+, TypeScript, HTML5, CSS3/SCSS
💠Backend: ASP.NET Core 8.0 Web API, Entity Framework Core 8.0
💠Database: Microsoft SQL Server
💠API Documentation: Swagger / OpenAPI (Swashbuckle)
💠Architecture: RESTful Web API, Role-Based Access Control (RBAC)



🔥 Key Features

🏢 1. Role-Based Access Control (RBAC)
💠Employee: Log new expenses, track approval statuses, and view personal/budget insights.
💠Manager: Create budgets, approve or reject expense logs, monitor department utilization, and oversee team submissions.
💠Admin: System-wide dashboard, configure expense categories, manage users, transfer budget ownership, and analyze macro-level financial reports.

💰 2. Budget & Expense Management
💠Budget Planning: Create and assign department-specific or project-based budget caps.
💠Expense Logging: Submit itemized expense requests with automated category tags (e.g., Food, Travel, Entertainment, Office Supplies).
💠Approval Workflows: Real-time pending queue for managers to review, approve, or decline expenses.
💠Ownership Transfer: Admins can seamlessly reassign budget ownership across managers.

 📈 3. Financial Analytics & Visual Reporting
✔️ Real-time metrics for Total Budget, Total Approved Expenses, Utilization Rate (%), and Approval Rate (%).
✔️ Visual department-level expense distribution charts (Donut / Pie Breakdown).
✔️ Detailed remaining budget indicators per department.

🔔 4. Self-Contained In-App Alerts
 Instant in-app notifications for pending approvals, category updates, and budget threshold alerts without third-party email/SMS dependencies.

 📁 Repository Structure

```text
FinalProject/
├── backend/                  # ASP.NET Core 8.0 Web API
│   ├── Controllers/          # API Controllers (Approval, Auth, Budgets, Expenses, etc.)
│   ├── Data/                 # EF Core BudgetDbContext & Migrations
│   ├── Enums/                # User roles, expense & budget statuses
│   └── Program.cs            # App configuration & middleware pipeline
│
└── frontend/                 # Angular Frontend Application
    ├── src/                  # Angular components, services, and modules
    ├── angular.json          # Angular CLI workspace config
    └── package.json          # Frontend dependencies & npm scripts

```

 🚀 Getting Started

 Prerequisites

* [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Node.js (LTS)](https://nodejs.org/) & [Angular CLI](https://angular.dev/tools/cli)
* [SQL Server Express / LocalDB](https://www.microsoft.com/sql-server/)


 1. Backend Setup (.NET 8.0 Web API)

1. Navigate to the backend directory:
```bash
cd backend

```


2. Update the connection string in `appsettings.json` to point to your local SQL Server instance.
3. Apply database migrations:
```bash
dotnet ef database update

```


4. Run the Web API:
```bash
dotnet run

```


For Api testing Swagger UI will be available at:* `https://localhost:<port>/swagger`



 2. Frontend Setup (Angular)

1. Navigate to the frontend directory:
```bash
cd frontend/Budget-Mate-Frontend/frontend

```


2. Install npm packages:
```bash
npm install

```


3. Start the Angular development server:
```bash
ng serve

```


4. Open your browser and navigate to `http://localhost:4200/`.

---

 🔒 Security & System Constraints

💠Self-Contained Architecture: Operates entirely within the enterprise boundary with no external API or third-party service dependencies.

💠Role-Based Authorization: Secure API endpoints guarded by role requirements.

💠Auditability: Automatic tracking of creation dates, approval logs, and user activity history.







