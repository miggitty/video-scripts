# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.4.3 application using TypeScript and the App Router architecture. The project uses React 19.1.0 and Tailwind CSS 4 for styling.

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

### Directory Structure
- `/app` - Next.js App Router pages and layouts
- `/public` - Static assets served directly
- Components use `.tsx` extension with TypeScript

### Styling
- Tailwind CSS 4 with @tailwindcss/postcss plugin
- Global styles in `app/globals.css`
- CSS variables for theming (--background, --foreground)
- Dark mode support via `@media (prefers-color-scheme: dark)`

### Fonts
- Geist Sans and Geist Mono fonts loaded via next/font/google
- Applied as CSS variables: --font-geist-sans, --font-geist-mono

### TypeScript Configuration
- Strict mode enabled
- Path alias: `@/*` maps to project root
- Target: ES2017 with bundler module resolution

## MCP Servers

### Context7
- **Package**: @upstash/context7-mcp
- **Purpose**: Provides up-to-date, version-specific documentation for frameworks and libraries
- **Usage**: Include "use context7" in prompts to access current documentation
- **Configuration**: Located in `.mcp-config.json`

### Playwright
- **Package**: @playwright/mcp
- **Purpose**: Browser automation capabilities using Playwright for web testing and interaction
- **Features**: Web page interaction through accessibility snapshots, screenshot capture, JavaScript execution
- **Usage**: Enable browser automation tasks and web testing workflows
- **Configuration**: Located in `.mcp-config.json`

### PostgreSQL
- **Package**: @henkey/postgres-mcp-server
- **Purpose**: Comprehensive PostgreSQL database management and interaction
- **Features**: Database schema inspection, SQL query execution, 18 intelligent database tools
- **Usage**: Connect to PostgreSQL databases for data operations and management
- **Configuration**: Located in `.mcp-config.json`

## Important Notes

- No test framework is currently configured
- ESLint 9 is configured with Next.js recommended rules
- The project uses Turbopack for faster development builds
- Always run `npm run lint` before committing changes
- No API routes or database connections are set up yet
- Context7, Playwright, and PostgreSQL MCP servers are installed for enhanced functionality