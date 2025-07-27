import { program } from 'commander';
import {
  loginAction,
  logoutAction,
  profileAction,
} from '../controllers/auth-controllers.js';

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

export { program as authCommands };
