import {
  createPacPrompter,
  createTecPrompter,
  deletePacPrompter,
  deleteTecPrompter,
  updatePacPrompter,
  updateTecPrompter,
} from './prompts.js';
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
    .action(async name => {
      const answers = await createTecPrompter();
      await createTecAction(name, answers);
    });

  program
    .command('update-tec <name>')
    .description('Update an existing snippet')
    .option('-d, --description <description>', 'Update description')
    .option('-l, --language <language>', 'Update programming language')
    .option('-c, --category <category>', 'Update category')
    .option('--content <content>', 'Update content')
    .action(async name => {
      const answers = await updateTecPrompter();
      await updateTecAction(name, answers);
    });

  program
    .command('delete-tec <name>')
    .description('Delete a snippet')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(async name => {
      const willDelete = await deleteTecPrompter();
      if (willDelete) {
        await deleteTecAction(name);
      } else {
        console.log('Operation canceled');
      }
    });

  program
    .command('get-pac <name>')
    .description('Get a package by name')
    .action(getPacAction);

  program
    .command('create-pac <name>')
    .description('Create a new package')
    .action(async name => {
      const answers = await createPacPrompter();
      await createPacAction(name, answers);
    });

  program
    .command('update-pac <name>')
    .description('Update an existing package')
    .action(async name => {
      const answers = await updatePacPrompter();
      await updatePacAction(name, answers);
    });

  program
    .command('delete-pac <name>')
    .description('Delete a package')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(async name => {
      const willDelete = await deletePacPrompter();
      if (willDelete) {
        await deletePacAction(name);
      } else {
        console.log('Operation canceled');
      }
    });
}
