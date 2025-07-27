import {
  loginAction,
  logoutAction,
  profileAction,
} from '../controllers/auth-controllers.js';
import {
  publishTecAction,
  getAllTecsAction,
  deleteTecAction,
  improveTecAction,
  getTecByIdAction,
  summarizeTecAction,
  getPacByIdAction,
  getAllPacsAction,
  createPacAction,
  deletePacAction,
  summarizePacAction,
  searchTecsAction,
  searchPacsAction,
} from '../controllers/online-controllers.js';

export async function loadOnlineCommands(program) {
  // Login command
  program
    .command('login')
    .description('Login to your tecspacs account')
    .action(loginAction);

  // Logout command
  program
    .command('logout')
    .description('Logout from your account')
    .action(logoutAction);

  // Profile command
  program
    .command('whoami')
    .description('View your profile information')
    .action(profileAction);

  // Publish tec command
  program
    .command('publish-tec-online <name>')
    .description('Publish a local snippet to your online account')
    .option('-t, --tags <tags>', 'Comma-separated tags for the snippet')
    .action(publishTecAction);

  // List all tecs command
  program
    .command('list-tecs-online')
    .description('List all your snippets from the server')
    .action(getAllTecsAction);

  // Search tecs command
  program
    .command('search-tecs-online <searchTerm>')
    .description('Search for snippets by name (supports * as wildcard)')
    .option('-l, --limit <limit>', 'Maximum number of results to display', '20')
    .action(searchTecsAction);

  // Get TEC by ID command
  program
    .command('get-tec-online <id>')
    .description('View a specific snippet by ID')
    .action(getTecByIdAction);

  // Delete tec command
  program
    .command('delete-tec-online <id>')
    .description('Delete a snippet from your online account')
    .action(deleteTecAction);

  // Improve tec command with AI
  program
    .command('improve-tec-online <id>')
    .description('Get AI-powered improvement suggestions for your snippet')
    .action(improveTecAction);

  // Summarize tec command with AI
  program
    .command('summarize-tec-online <id>')
    .description('Get an AI-generated summary of your snippet')
    .action(summarizeTecAction);

  // List all pacs command
  program
    .command('list-pacs-online')
    .description('List all your packages from the server')
    .action(getAllPacsAction);

  // Search pacs command
  program
    .command('search-pacs-online <searchTerm>')
    .description('Search for packages by name (supports * as wildcard)')
    .option('-l, --limit <limit>', 'Maximum number of results to display', '20')
    .action(searchPacsAction);

  // Get PAC by ID command
  program
    .command('get-pac-online <id>')
    .description('View a specific package by ID')
    .action(getPacByIdAction);

  // Create new pac command
  program
    .command('create-pac-online <name>')
    .description('Create a new package on your online account')
    .action(createPacAction);

  // Delete PAC command
  program
    .command('delete-pac-online <id>')
    .description('Delete a package from your online account')
    .action(deletePacAction);

  // Summarize PAC command with AI
  program
    .command('summarize-pac-online <id>')
    .description('Get an AI-generated summary of your package')
    .action(summarizePacAction);
}
