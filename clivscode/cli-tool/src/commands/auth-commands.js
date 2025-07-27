import {
  loginAction,
  logoutAction,
  profileAction,
} from '../controllers/auth-controllers.js';
import {
  publishTecAction,
  getAllTecsAction,
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
    .command('publish-tec <name>')
    .description('Publish a local snippet to your online account')
    .option('-t, --tags <tags>', 'Comma-separated tags for the snippet')
    .action(publishTecAction);

  // List all tecs command
  program
    .command('list-tecs')
    .description('List all your snippets from the server')
    .action(getAllTecsAction);
}
