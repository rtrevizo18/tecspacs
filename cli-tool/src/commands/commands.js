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
  searchTecsAction,
} from '../controllers/tecs-controllers.js';
import {
  getPacAction,
  createPacAction,
  updatePacAction,
  deletePacAction,
  searchPacsAction,
} from '../controllers/pacs-controllers.js';

export async function loadCommands(program) {
  // FIXME: Make this a search, then make user select the tec or package
  // FIXME: Make this tec/package agnostic
  program
    .command('get <name>')
    .description('Get a snippet by name')
    .option('-o, --online', 'Search for your online snippets')
    .action(getTecAction);

  // FIXME: Make this tec/package agnostic
  program
    .command('create <name>')
    .description('Create a new snippet')
    .action(async name => {
      const answers = await createTecPrompter();
      await createTecAction(name, answers);
    });

  // FIXME: Make this tec/package agnostic
  program
    .command('update <name>')
    .description('Update an existing snippet')
    .action(async name => {
      const answers = await updateTecPrompter();
      await updateTecAction(name, answers);
    });

  // FIXME: Make this tec/package agnostic
  program
    .command('delete <name>')
    .description('Delete a snippet')
    .action(async name => {
      const willDelete = await deleteTecPrompter();
      if (willDelete) {
        await deleteTecAction(name);
      } else {
        console.log('Operation canceled');
      }
    });

  // List all tecs command
  //FIXME: So it'll show a list
  program
    .command('list')
    .description('List all your code')
    .option('-o, --online', 'List all of your code online')
    .action(getAllTecsAction);

  // Login command
  //FIXME: Just take a look at this
  program
    .command('login')
    .description('Login to your tecspacs account')
    .action(loginAction);

  // Logout command
  //FIXME: Just take a look at this
  program
    .command('logout')
    .description('Logout from your account')
    .action(logoutAction);

  // Profile command
  //FIXME: Just take a look at this
  program
    .command('whoami')
    .description('View your profile information')
    .action(profileAction);

  //FIXME: Make this tec/package agnostic
  program
    .command('publish <name>')
    .description('Publish a local snippet to your online account')
    .option('-t, --tags <tags>', 'Comma-separated tags for the snippet')
    .action(publishTecAction);

  // Improve tec command with AI
  //FIXME: Make this tec/package agnostic
  program
    .command('improve <id>')
    .description('Get AI-powered improvement suggestions for your snippet')
    .action(improveTecAction);

  // Summarize tec command with AI
  //FIXME: Make this tec/package agnostic
  program
    .command('summarize <id>')
    .description('Get an AI-generated summary of your snippet')
    .action(summarizeTecAction);
}
