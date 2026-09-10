# Blazor Frontend Setup Design

## Goal

Create a standalone .NET 10 Blazor WebAssembly frontend in `frontend/Replate.Web` that runs locally, has basic routes, and is ready to call the existing Replate REST API.

Issue #21 is complete when the project builds and can be started with:

```bash
dotnet watch --project frontend/Replate.Web
```

This replaces the ticket's `npm run dev` wording because the agreed frontend stack uses .NET instead of Node.js.

## Architecture

Use the standard `blazorwasm` template as a separate browser client. Keep the existing ASP.NET Core API in `backend/Replate.Api`; the frontend communicates with it over HTTP through a configured `HttpClient`.

Blazor WebAssembly is preferred over another server-hosted Blazor application because Replate already has a backend service. It keeps the frontend independently deployable as static files and avoids adding a second application server.

## Project Structure

- `frontend/Replate.Web`: Blazor WebAssembly project.
- `Pages/Home.razor`: project landing page.
- `Pages/Login.razor`: reserved route for the existing login API.
- `Pages/Register.razor`: reserved route for the existing register API.
- `Layout`: shared navigation and page shell.
- `wwwroot/appsettings.json`: public REST API base URL configuration.

The setup does not implement login/register forms or business features. Those belong to later issues.

## Routing and API Configuration

Provide these initial routes:

- `/` for the project landing page.
- `/login` for the future login flow.
- `/register` for the future registration flow.

Register one `HttpClient` using `ApiBaseUrl` from Blazor configuration. The default local value is `http://localhost:5000`; deployment can replace the public configuration file for each environment. No secret is stored in frontend configuration.

Standalone WebAssembly runs inside the browser and cannot read server operating-system environment variables at runtime. A public configuration file is therefore the direct Blazor equivalent of a frontend environment variable. The backend must later allow the deployed frontend origin through a scoped CORS policy before cross-origin API calls are enabled.

## Verification

- Restore and build the frontend in Release mode.
- Start the development server and verify the home, login, and register routes respond.
- Keep the existing backend build, tests, and migration check in CI; add a frontend build step.

## Out of Scope

- Authentication forms and token persistence.
- Customer or Restaurant Owner dashboards.
- Business API calls beyond registering the configured `HttpClient`.
- Broad CORS configuration or deployment infrastructure.
