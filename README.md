# umzug-db-migrate-with-better-sqlite3

A simple database migration tool built with [Umzug](https://github.com/sequelize/umzug) and [better-sqlite3](https://github.com/WiseLibs/better-sqlite3).

## Overview

This project provides a lightweight database migration system that allows you to version control your database schema. It uses Umzug as the migration framework and better-sqlite3 as the database driver.

## Installation

```bash
npm install
npm run build
```

## Usage

### Creating a Migration

To create a new migration:

```bash
npm run create-migration <migration-name>
```

This will create a new migration file in your migrations directory with the appropriate timestamp.

### Running Migrations

To run all pending migrations:

```bash
npm run migrate
```

To run migrations up to a specific one:

```bash
npm run migrate -- --to <migration-name>
# npm run migrate -- --to 20250514T004449-add-user.js
```

To revert migrations:

```bash
npm run migrate down
```

To revert to a specific migration:

```bash
npm run migrate down -- --to <migration-name>
# npm run migrate down -- --to 20250514T004449-add-user.js
```

View all available migration commands and options:

```bash
npm run migrate -- --help
```
