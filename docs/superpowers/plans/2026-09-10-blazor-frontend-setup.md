# Blazor Frontend Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a locally runnable .NET 10 Blazor WebAssembly frontend with basic routes and configurable REST API access.

**Architecture:** A standalone browser client lives in `frontend/Replate.Web`, separate from `backend/Replate.Api`. Blazor handles `/`, `/login`, and `/register`; one scoped `HttpClient` reads its base address from public WebAssembly configuration.

**Tech Stack:** .NET 10, Blazor WebAssembly, Razor components, GitHub Actions

**Spec:** `docs/superpowers/specs/2026-09-10-blazor-frontend-setup-design.md`

## Global Constraints

- Use .NET 10 and the standard standalone `blazorwasm` template without a Node.js wrapper.
- Run locally with `dotnet watch --project frontend/Replate.Web`.
- Default `ApiBaseUrl` to `http://localhost:5000`; browser configuration contains no secrets.
- Skip forms, token persistence, dashboards, business API calls, and CORS.
- Never stage `project-context.md`.

---

### Task 1: Scaffold the standalone frontend

**Files:**
- Create: `frontend/Replate.Web/` from the empty Blazor WebAssembly template.

**Interfaces:**
- Consumes: .NET SDK 10 `blazorwasm` template.
- Produces: buildable `frontend/Replate.Web/Replate.Web.csproj` and root route `/`.

- [ ] **Step 1: Verify the target is absent**

Run: `test ! -e frontend/Replate.Web`

Expected: exit code 0.

- [ ] **Step 2: Generate the project**

```bash
dotnet new blazorwasm --empty --no-restore --framework net10.0 --name Replate.Web --output frontend/Replate.Web
```

Expected: successful creation without package restore.

- [ ] **Step 3: Restore and build**

```bash
dotnet restore frontend/Replate.Web/Replate.Web.csproj
dotnet build frontend/Replate.Web/Replate.Web.csproj --configuration Release --no-restore
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/Replate.Web
git commit -m "build: scaffold Blazor frontend"
```

### Task 2: Configure API access and routes

**Files:**
- Modify: `frontend/Replate.Web/Program.cs`
- Modify: `frontend/Replate.Web/Layout/MainLayout.razor`
- Modify: `frontend/Replate.Web/Pages/Home.razor`
- Create: `frontend/Replate.Web/Pages/Login.razor`
- Create: `frontend/Replate.Web/Pages/Register.razor`
- Create: `frontend/Replate.Web/wwwroot/appsettings.json`
- Modify: `frontend/Replate.Web/wwwroot/css/app.css`

**Interfaces:**
- Consumes: configuration key `ApiBaseUrl` as an absolute URL.
- Produces: injectable `HttpClient` and routes `/`, `/login`, `/register`.

- [ ] **Step 1: Create `wwwroot/appsettings.json`**

```json
{
  "ApiBaseUrl": "http://localhost:5000"
}
```

- [ ] **Step 2: Register the API client in `Program.cs`**

```csharp
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Replate.Web;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

var apiBaseUrl = builder.Configuration["ApiBaseUrl"]
    ?? throw new InvalidOperationException("ApiBaseUrl is required.");

builder.Services.AddScoped(_ => new HttpClient
{
    BaseAddress = new Uri(apiBaseUrl, UriKind.Absolute)
});

await builder.Build().RunAsync();
```

- [ ] **Step 3: Create the reserved auth pages**

`Pages/Login.razor`:

```razor
@page "/login"
<PageTitle>Login | Replate</PageTitle>
<h1>Login</h1>
<p>Halaman login Replate akan tersedia pada tahap implementasi autentikasi frontend.</p>
```

`Pages/Register.razor`:

```razor
@page "/register"
<PageTitle>Register | Replate</PageTitle>
<h1>Register</h1>
<p>Halaman pendaftaran Customer dan Restaurant Owner akan tersedia pada tahap berikutnya.</p>
```

- [ ] **Step 4: Replace the home page and layout**

`Pages/Home.razor`:

```razor
@page "/"
<PageTitle>Replate</PageTitle>
<section class="hero">
    <p class="eyebrow">Food rescue marketplace</p>
    <h1>Selamatkan makanan, kurangi surplus.</h1>
    <p>Replate menghubungkan restoran dengan customer untuk menawarkan makanan surplus yang masih layak konsumsi.</p>
    <div class="actions">
        <a class="button primary" href="/register">Buat akun</a>
        <a class="button" href="/login">Login</a>
    </div>
</section>
```

`Layout/MainLayout.razor`:

```razor
@inherits LayoutComponentBase
<header class="site-header">
    <a class="brand" href="/">Replate</a>
    <nav aria-label="Navigasi utama">
        <NavLink href="/" Match="NavLinkMatch.All">Home</NavLink>
        <NavLink href="/login">Login</NavLink>
        <NavLink href="/register">Register</NavLink>
    </nav>
</header>
<main class="content">@Body</main>
```

- [ ] **Step 5: Replace `wwwroot/css/app.css`**

```css
:root { font-family: system-ui, sans-serif; color: #17372b; background: #f7faf7; }
* { box-sizing: border-box; }
body { margin: 0; }
a { color: inherit; }
.site-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem clamp(1rem, 5vw, 4rem); background: white; border-bottom: 1px solid #dce7df; }
.brand { color: #176b47; font-size: 1.35rem; font-weight: 800; text-decoration: none; }
nav { display: flex; gap: 1rem; }
nav a { text-decoration: none; }
nav a.active { color: #176b47; font-weight: 700; }
.content { width: min(70rem, 100%); margin: auto; padding: clamp(2rem, 8vw, 6rem) clamp(1rem, 5vw, 4rem); }
.hero { max-width: 44rem; }
.eyebrow { color: #176b47; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
h1 { margin: .5rem 0 1rem; font-size: clamp(2.25rem, 6vw, 4.5rem); line-height: 1.05; }
.actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 2rem; }
.button { padding: .75rem 1rem; border: 1px solid #176b47; border-radius: .5rem; text-decoration: none; }
.button.primary { color: white; background: #176b47; }
@media (max-width: 36rem) { .site-header { align-items: flex-start; flex-direction: column; } }
```

- [ ] **Step 6: Build and smoke-test routes**

```bash
dotnet build frontend/Replate.Web/Replate.Web.csproj --configuration Release --no-restore
dotnet watch --project frontend/Replate.Web --no-hot-reload
```

Expected: the server starts; `/`, `/login`, and `/register` return HTTP 200 with no browser startup error.

- [ ] **Step 7: Commit**

```bash
git add frontend/Replate.Web
git commit -m "feat: configure Blazor routes and API client"
```

### Task 3: Add documentation and CI coverage

**Files:**
- Modify: `README.md`
- Modify: `.github/workflows/main.yml`

**Interfaces:**
- Consumes: `frontend/Replate.Web/Replate.Web.csproj`.
- Produces: local run instructions and a CI frontend build gate.

- [ ] **Step 1: Document local development**

Add this section before `Menjalankan Backend` in `README.md`:

```markdown
## Menjalankan Frontend

\`\`\`bash
dotnet watch --project frontend/Replate.Web
\`\`\`

Alamat REST API publik dikonfigurasi melalui `ApiBaseUrl` di `frontend/Replate.Web/wwwroot/appsettings.json`.
```

- [ ] **Step 2: Add frontend build steps to CI**

Add after backend dependency restore in `.github/workflows/main.yml`:

```yaml
      - name: Restore frontend dependencies
        run: dotnet restore frontend/Replate.Web/Replate.Web.csproj

      - name: Build frontend
        run: dotnet build frontend/Replate.Web/Replate.Web.csproj --configuration Release --no-restore
```

- [ ] **Step 3: Run final verification**

```bash
dotnet build backend/Replate.Api/Replate.Api.csproj --configuration Release --no-restore
dotnet test backend/Replate.Api.Tests/Replate.Api.Tests.csproj --configuration Release --no-restore
dotnet build frontend/Replate.Web/Replate.Web.csproj --configuration Release --no-restore
dotnet format backend/Replate.Api.Tests/Replate.Api.Tests.csproj --verify-no-changes --no-restore
dotnet format frontend/Replate.Web/Replate.Web.csproj --verify-no-changes --no-restore
```

Expected: both builds and format checks succeed; all eight backend tests pass.

- [ ] **Step 4: Commit**

```bash
git add README.md .github/workflows/main.yml
git commit -m "ci: build Blazor frontend"
```

- [ ] **Step 5: Finish the issue workflow**

Push `feature/21-setup-blazor-frontend`; open a PR containing `Closes #21`; wait for all checks; merge; verify Issue #21 closed; switch to `main`; pull with `--ff-only`; delete the merged local branch. Confirm only untracked `project-context.md` remains.
