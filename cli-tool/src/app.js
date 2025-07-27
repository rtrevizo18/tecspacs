import { Command } from 'commander';
import { loadCommands } from './commands/commands.js';
import { ErrorHandler } from './util/error-handler.js';
import { db } from './db/db-manager.js';

import { loadOnlineCommands } from './commands/online-commands.js';

const program = new Command();

program
  .name('tecspacs')
  .description('Command line tool for tecspacs')
  .version('1.0.0');

async function main() {
  try {
    await db.initialize();

    await loadCommands(program);
    await loadOnlineCommands(program);

    program.parse();
  } catch (err) {
    ErrorHandler.handle(err, 'Application Startup');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});

main();
