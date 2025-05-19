import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { createMigrator } from '../src/migrator.js';

const parseArgs = () => {
  return yargs(hideBin(process.argv))
    .command('up', 'Run migrations forward', {}, (argv) => {
      argv.command = 'up';
    })
    .command('down', 'Revert migrations', {}, (argv) => {
      argv.command = 'down';
    })
    .option('to', {
      describe: 'Migrate to a specific migration',
      type: 'string',
    })
    .option('migrations', {
      describe: 'Run specific migrations (comma-separated)',
      type: 'string',
      coerce: (arg) => arg.split(','),
    })
    .option('step', {
      describe: 'Run a specific number of migrations',
      type: 'number',
      demandOption: false,
      coerce: (arg) => {
        const stepValue = parseInt(arg, 10);
        if (isNaN(stepValue) || stepValue <= 0) {
          throw new Error('--step requires a positive integer');
        }
        return stepValue;
      },
    })
    .option('db-path', {
      describe: 'Specify database path',
      type: 'string',
    })
    .help('help')
    .wrap(null)
    .example('$0 up', 'Run all pending migrations')
    .example(
      '$0 up --to 20250514140001-initial.js',
      'Migrate up to a specific migration'
    )
    .example(
      '$0 up --migrations 20250514140001-initial.js,20250514140002-user-table.js',
      'Run specific migrations'
    )
    .example('$0 up --step 2', 'Run 2 pending migrations')
    .example('$0 down', 'Revert the last applied migration')
    .example('$0 down --step 2', 'Revert the last 2 applied migrations')
    .default('command', 'up')
    .parseSync();
};

const run = async () => {
  try {
    const options = parseArgs();
    const migrator = await createMigrator(options.dbPath);

    // Apply the priority order: to > step > migrations
    const migrateOptions: Record<string, any> = {};

    if (options.to !== undefined) {
      migrateOptions.to = options.to;
    } else if (options.step !== undefined) {
      migrateOptions.step = options.step;
    } else if (options.migrations !== undefined) {
      migrateOptions.migrations = options.migrations;
    }

    console.log(`Running migrations (${options.command})...`);

    // Run the appropriate command
    const results =
      options.command === 'up'
        ? await migrator.up(migrateOptions)
        : await migrator.down(migrateOptions);

    if (results.length === 0) {
      console.log(
        `No migrations were ${
          options.command === 'up' ? 'executed' : 'reverted'
        }. Database is ${
          options.command === 'up' ? 'up to date' : 'at base state'
        }.`
      );
    } else {
      console.log(
        `Successfully ${options.command === 'up' ? 'ran' : 'reverted'} ${
          results.length
        } migrations:`
      );
      results.forEach((migration) => {
        console.log(`- ${migration.name}`);
      });
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

run();
