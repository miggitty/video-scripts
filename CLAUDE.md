# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.4.3 application using TypeScript and the App Router architecture. The project uses React 19.1.0 and Tailwind CSS 4 for styling. It's configured with Supabase for local development with a complete backend-as-a-service stack.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Architecture

### Core Stack
- **Framework**: Next.js 15.4.3 with App Router (not Pages Router)
- **React**: Version 19.1.0 (cutting-edge features available)
- **TypeScript**: Strict mode with ES2017 target
- **Development**: Turbopack for faster builds

### Directory Structure
- `/app` - Next.js App Router pages and layouts
- `/public` - Static assets served directly
- `/supabase` - Supabase configuration and migrations
- Components use `.tsx` extension with TypeScript

### Styling System
- Tailwind CSS 4 with @tailwindcss/postcss plugin
- Global styles in `app/globals.css`
- CSS variables for theming: `--background`, `--foreground`
- Dark mode support via `@media (prefers-color-scheme: dark)`
- Geist Sans and Geist Mono fonts via next/font/google

#### Typography Standards
- **H1 Headlines**: Always use `font-extrabold tracking-normal leading-none` for optimal readability
  - Global CSS rule applied: `h1 { @apply font-extrabold tracking-normal leading-none; }`
  - This ensures consistent tight line spacing and proper letter spacing across all H1 elements
  - Use responsive sizing: `text-4xl md:text-5xl lg:text-6xl` for scalable headlines
  - The `leading-none` class creates tight, readable line spacing that improves visual impact

### Database & Backend (Supabase)
- **Local Development**: Fully configured Supabase stack
- **Database**: PostgreSQL 17 on port 54322
- **API**: REST/GraphQL on port 54321
- **Studio**: Admin interface on port 54323
- **Email Testing**: Inbucket on port 54324
- **Connection**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

### Authentication & Features
- Supabase Auth with email/password and OAuth ready
- Row Level Security (RLS) configured
- Real-time subscriptions enabled
- File storage with 50MiB limit
- Edge Functions with Deno runtime

### TypeScript Configuration
- Strict mode enabled
- Path alias: `@/*` maps to project root
- Bundler module resolution

## MCP Servers

Three powerful MCP servers are configured for enhanced development:

### Context7
- **Package**: @upstash/context7-mcp
- **Purpose**: Up-to-date, version-specific documentation for frameworks and libraries
- **Usage**: Access current Supabase, Next.js, and other library documentation
- **Example**: Has extensive Supabase docs with 4,711+ code snippets

### Playwright
- **Package**: @playwright/mcp
- **Purpose**: Browser automation and web testing
- **Features**: Page interaction, screenshots, JavaScript execution
- **Usage**: Automated testing and web scraping capabilities

### PostgreSQL
- **Package**: @henkey/postgres-mcp-server
- **Purpose**: Direct database management and operations
- **Features**: Schema inspection, query execution, 18 intelligent DB tools
- **Connection**: Pre-configured with local Supabase database

## Development Workflow

### Local Environment Setup
1. Supabase local development stack runs on dedicated ports
2. Database migrations enabled in `supabase/config.toml`
3. Seed data supported via `./seed.sql`
4. Environment variables in `.env.local`

### Code Quality
- ESLint 9 with Next.js TypeScript rules
- Strict TypeScript throughout
- Always run `npm run lint` before committing

### Current State
- **TRANSFORMO AI CONTENT STRATEGIST** implementation complete
- Landing page with multi-step form for business info and lead capture
- AI-powered script generation using OpenRouter + Google Gemini 1.5 Pro
- Results page with real-time progressive loading of 20 video scripts
- GoHighLevel CRM integration for lead nurturing
- Complete shadcn/ui component library integrated

### Local Supabase Development
- **IMPORTANT**: This project uses LOCAL Supabase instance, not cloud
- Local database runs on `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Supabase Studio available at http://localhost:54323
- All database operations target the local instance

#### Database Migration Commands
```bash
# Deploy all pending migrations to local database
supabase migration up

# Check migration status and differences
supabase db diff

# Create a new migration file (with Brisbane timestamp)
supabase migration new migration_name

# Reset local database and reapply all migrations
supabase db reset

# Check local Supabase services status
supabase status

# Start local Supabase stack (if not running)
supabase start

# Stop local Supabase stack  
supabase stop
```

**Migration File Naming Convention**: Use Brisbane timezone timestamps
- Format: `YYYYMMDDHHMMSS_description.sql`
- Example: `20250724222154_create_tables.sql`
- Generate timestamp: `TZ='Australia/Brisbane' date '+%Y%m%d%H%M%S'`

## Important Architecture Notes

- Uses App Router (not Pages Router) - all routes in `/app` directory
- React 19 features available (Server Components, Suspense improvements)
- Supabase client integration ready for implementation
- MCP servers provide enhanced AI-assisted development capabilities
- No test framework configured yet
- Production-ready configuration for Vercel deployment