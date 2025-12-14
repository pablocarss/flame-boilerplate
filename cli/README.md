# create-flame-app

CLI generator for Flame Boilerplate - Create Next.js projects with authentication, payments, and more.

## Features

- 🚀 **Interactive setup** - Choose your project name, modules, and configuration
- 🎯 **Modular architecture** - Select only the features you need
- 🐳 **Docker automation** - Automatic setup of PostgreSQL, Redis, MinIO, and MailHog
- 🔐 **Secure by default** - Auto-generated JWT secrets and secure configurations
- 📦 **Package manager support** - Works with pnpm, npm, or yarn

## Available Modules

- **Leads/CRM** - Kanban board, sales pipeline, lead management
- **Submissions** - Forms and submissions management system
- **Billing/Stripe** - Payments and subscriptions with Stripe
- **Storage/MinIO** - S3-compatible file uploads and storage

## Usage

### Create a new project

```bash
npx create-flame-app my-project
```

Or with a package manager:

```bash
npm create flame-app my-project
pnpm create flame-app my-project
yarn create flame-app my-project
```

### Interactive mode

Simply run without arguments to enter interactive mode:

```bash
npx create-flame-app
```

## What it does

1. **Validates environment** - Checks for Node.js 18+, Docker, and Docker Compose
2. **Collects configuration** - Interactive prompts for project setup
3. **Creates project** - Copies boilerplate and removes unselected modules
4. **Generates configs** - Creates custom docker-compose.yml and .env files
5. **Starts services** - Launches Docker containers automatically
6. **Sets up database** - Creates PostgreSQL database and runs migrations
7. **Installs dependencies** - Runs package manager install
8. **Ready to go!** - Your project is ready for development

## Requirements

- **Node.js** 18 or higher
- **Docker** and **Docker Compose**
- **Package manager** - pnpm (recommended), npm, or yarn

## Development

### Build the CLI

```bash
cd cli
pnpm install
pnpm build
```

### Test locally

```bash
pnpm dev my-test-project
```

### Link globally (for testing)

```bash
npm link
create-flame-app my-test-project
```

## Project Structure

```
cli/
├── bin/
│   └── create-flame-app.js     # Executable entry point
├── src/
│   ├── index.ts                # Main CLI logic
│   ├── prompts.ts              # Interactive prompts
│   ├── modules/
│   │   └── module-mapper.ts    # Module definitions
│   ├── generators/
│   │   ├── copy-files.ts
│   │   ├── remove-modules.ts
│   │   └── prisma-schema.ts
│   ├── templates/
│   │   ├── docker-compose.ts
│   │   ├── env.ts
│   │   └── placeholders.ts
│   ├── docker/
│   │   └── compose.ts
│   ├── database/
│   │   └── setup.ts
│   └── utils/
│       ├── logger.ts
│       ├── validation.ts
│       └── rollback.ts
├── package.json
└── tsconfig.json
```

## Rollback on Failure

The CLI includes automatic rollback functionality. If any step fails during project creation:

- Project directory is removed
- Docker containers are stopped and removed
- Clear error messages are displayed

## Environment Variables

The CLI automatically generates a `.env` file with:

- Auto-generated JWT secrets
- Database connection string
- Module-specific configurations (Stripe, MinIO, Redis)
- Email settings (MailHog for development)

## Docker Services

Depending on selected modules, the following services are configured:

- **postgres** - PostgreSQL 16 (always)
- **mailhog** - Email testing (always)
- **redis** - Background jobs (if Leads module selected)
- **minio** - S3-compatible storage (if Storage module selected)

## Troubleshooting

### Docker not running

Make sure Docker Desktop is running before using the CLI.

### Port conflicts

If you get port conflict errors, choose different ports during setup or stop conflicting services.

### Permission errors

On Linux/macOS, you may need to run with sudo or fix Docker permissions.

## License

MIT

## Support

For issues and questions, please visit:
https://github.com/your-username/flame-boilerplate/issues
