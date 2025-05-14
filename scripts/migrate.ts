import { createMigrator } from '../src/migrator.js'

const showHelp = () => {
  console.log(`
Migration Runner

Usage:
  node migrate.js <command> [options]

Commands:
  up      Run migrations forward (default if no command specified)
  down    Revert migrations

Options:
  --to <migration>     Migrate to a specific migration
  --migrations <list>  Run specific migrations (comma-separated)
  --step <number>      Run a specific number of migrations
  --db <path>          Specify database path (default: dev.db)
  --help               Show this help message

Examples:
  node migrate.js up
  node migrate.js up --to 20250514140001-initial.js
  node migrate.js up --migrations 20250514140001-initial.js,20250514140002-user-table.js
  node migrate.js up --step 2
  node migrate.js up --db custom.db

  node migrate.js down
  node migrate.js down --to 20250514140001-initial.js
  node migrate.js down --migrations 20250514140001-initial.js,20250514140002-user-table.js
  node migrate.js down --step 2
  node migrate.js down --db custom.db
  `)
}

const parseArgs = () => {
  const args = process.argv.slice(2)
  const options: {
    command: 'up' | 'down'
    to?: string
    migrations?: string[]
    step?: number
    dbPath?: string
  } = { command: 'up' } // Default to 'up'

  // First check for command
  if (args.length > 0 && (args[0] === 'up' || args[0] === 'down')) {
    options.command = args.shift() as 'up' | 'down'
  }

  // Then parse remaining options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--to' && i + 1 < args.length) {
      options.to = args[++i]
    } else if (arg === '--migrations' && i + 1 < args.length) {
      options.migrations = args[++i].split(',')
    } else if (arg === '--step' && i + 1 < args.length) {
      const stepValue = parseInt(args[++i], 10)
      if (!isNaN(stepValue) && stepValue > 0) {
        options.step = stepValue
      } else {
        console.error('Error: --step requires a positive integer')
        process.exit(1)
      }
    } else if (arg === '--db' && i + 1 < args.length) {
      options.dbPath = args[++i]
    } else if (arg === '--help') {
      showHelp()
      process.exit(0)
    }
  }

  return options
}

const run = async () => {
  try {
    const options = parseArgs()
    console.log('options:', options)
    const migrator = await createMigrator(options.dbPath)

    // Apply the priority order: to > step > migrations
    const migrateOptions: Record<string, any> = {}

    if (options.to !== undefined) {
      migrateOptions.to = options.to
    } else if (options.step !== undefined) {
      migrateOptions.step = options.step
    } else if (options.migrations !== undefined) {
      migrateOptions.migrations = options.migrations
    }

    console.log(`Running migrations (${options.command})...`)

    // Run the appropriate command
    const results =
      options.command === 'up'
        ? await migrator.up(migrateOptions)
        : await migrator.down(migrateOptions)

    if (results.length === 0) {
      console.log(
        `No migrations were ${options.command === 'up' ? 'executed' : 'reverted'}. Database is ${options.command === 'up' ? 'up to date' : 'at base state'}.`,
      )
    } else {
      console.log(
        `Successfully ${options.command === 'up' ? 'ran' : 'reverted'} ${results.length} migrations:`,
      )
      results.forEach((migration) => {
        console.log(`- ${migration.name}`)
      })
    }
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

run()
