# Overview

This is a Kids Account Manager application built as a full-stack web application for managing children's financial accounts and transactions. The application allows parents to create accounts for their children, track balances, and manage transactions (credits and debits). It features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration using Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with React 18 and TypeScript, using a modern component-based architecture:

- **Framework**: React with TypeScript and Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation schemas
- **Component Structure**: Organized into reusable components with clear separation between UI components, business logic components, and pages

The application follows a dashboard-centric design where users can view account statistics, manage accounts, and handle transactions from a single interface.

## Backend Architecture

The backend uses Express.js with TypeScript in a RESTful API pattern:

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **API Design**: RESTful endpoints following standard HTTP conventions
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Logging**: Custom request logging middleware for API monitoring

The server implements a storage abstraction pattern with both in-memory and database implementations, allowing for flexible data persistence strategies.

## Database Architecture

- **ORM**: Drizzle ORM provides type-safe database operations with PostgreSQL
- **Schema**: Well-defined tables for accounts, transactions, and users with proper relationships
- **Migrations**: Managed through Drizzle Kit with version-controlled schema changes
- **Data Types**: Uses appropriate PostgreSQL data types (decimal for money, timestamps, UUIDs)

Key database tables include:
- `accounts`: Stores child account information with name, age, and balance
- `transactions`: Records all financial transactions with type (credit/debit), amount, and descriptions
- `users`: Basic user authentication structure (legacy, maintained for compatibility)

## Development Architecture

- **Build System**: Vite for fast development and optimized production builds
- **TypeScript**: Full TypeScript coverage across frontend, backend, and shared code
- **Code Organization**: Monorepo structure with shared types and schemas between frontend and backend
- **Development Server**: Integrated Vite development server with Express API proxy
- **Hot Reload**: Full hot reload support for both frontend and backend development

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database using `@neondatabase/serverless` driver
- **Connection**: Uses `DATABASE_URL` environment variable for database connectivity

## UI and Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives for building the design system
- **shadcn/ui**: Pre-built component library based on Radix UI with Tailwind CSS styling
- **TanStack Query**: Powerful data synchronization library for React applications
- **Tailwind CSS**: Utility-first CSS framework for styling

## Development Tools
- **Vite**: Next-generation frontend build tool with fast HMR
- **Drizzle Kit**: CLI tool for managing database schemas and migrations
- **TypeScript**: Static type checking across the entire application
- **React Hook Form**: Performant forms library with easy validation
- **Zod**: TypeScript-first schema declaration and validation library

## Third-party Integrations
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Web fonts (Inter, DM Sans, Fira Code, etc.)
- **Wouter**: Lightweight routing library for React applications

The application is designed to be deployed on platforms that support Node.js applications with PostgreSQL database connectivity.