import {
  getTecAction,
  createTecAction,
  updateTecAction,
  deleteTecAction,
} from '../controllers/tecs-controllers.js';
import {
  getPacAction,
  createPacAction,
  updatePacAction,
  deletePacAction,
} from '../controllers/pacs-controllers.js';

export async function loadCommands(program) {
  program
    .command('get-tec <name>')
    .description('Get a snippet by name')
    .action(getTecAction);

  program
    .command('create-tec <name>')
    .description('Create a new snippet')
    .option('-d, --description <description>', 'Snippet description')
    .requiredOption('-l, --language <language>', 'Programming language')
    .option('-c, --category <category>', 'Snippet category', 'general')
    .requiredOption('--content <content>', 'Snippet content')
    .action(createTecAction);

  program
    .command('update-tec <name>')
    .description('Update an existing snippet')
    .option('-d, --description <description>', 'Update description')
    .option('-l, --language <language>', 'Update programming language')
    .option('-c, --category <category>', 'Update category')
    .option('--content <content>', 'Update content')
    .action(updateTecAction);

  program
    .command('delete-tec <name>')
    .description('Delete a snippet')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(deleteTecAction);

  program
    .command('get-pac <name>')
    .description('Get a package by name')
    .action(getPacAction);

  program
    .command('create-pac <name>')
    .description('Create a new package')
    .requiredOption('-v, --version <version>', 'Package version')
    .option('-d, --description <description>', 'Package description')
    .option('-a, --author <author>', 'Package author')
    .requiredOption('-l, --language <language>', 'Programming language')
    .option('-c, --category <category>', 'Package category', 'general')
    .option('-s, --source-path <path>', 'Path to source files/folder to copy')
    .action(createPacAction);

  program
    .command('update-pac <name>')
    .description('Update an existing package')
    .option('-v, --version <version>', 'Update version')
    .option('-d, --description <description>', 'Update description')
    .option('-a, --author <author>', 'Update author')
    .option('-l, --language <language>', 'Update programming language')
    .option('-c, --category <category>', 'Update category')
    .action(updatePacAction);

  program
    .command('delete-pac <name>')
    .description('Delete a package')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(deletePacAction);
}
