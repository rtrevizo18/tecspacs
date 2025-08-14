import { Command } from 'commander';
import { loadCommands } from './commands/commands.js';
import { ErrorHandler } from './util/error-handler.js';
import { DatabaseManager } from './db/db-manager.js';

const program = new Command();

program
  .name('tecspacs')
  .description('Command line tool for tecspacs')
  .version('1.0.0');

async function main() {
  try {
    // await db.initialize();

    await loadCommands(program);

    //FIXME: Parse async...
    await program.parseAsync();
  } catch (err) {
    ErrorHandler.handle(err, 'Application Startup');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  // db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  // db.close();
  process.exit(0);
});

main();
