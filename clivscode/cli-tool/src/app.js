import { Command } from 'commander';
import { loadCommands } from './commands/commands.js';
import { ErrorHandler } from './util/error-handler.js';

const program = new Command();

program
  .name('tcspcs')
  .description('Command line tool for tecspacs')
  .version('0.0.1');

try {
  await loadCommands(program);
  program.parse();
} catch (err) {
  ErrorHandler.handle(err, 'Application Startup');
}
