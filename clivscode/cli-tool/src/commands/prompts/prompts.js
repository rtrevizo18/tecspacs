import inquirer from 'inquirer';

const createTecPrompter = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Add a description?',
    },
    {
      type: 'input',
      name: 'language',
      message: 'What language are you using (Use full name)?',
      validate: input => {
        if (!input || input.trim() === '') {
          return 'Language is required';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'category',
      message: 'Add a category to snippet?',
    },
    {
      type: 'input',
      name: 'content',
      message: 'Copy and paste your snippet:',
      validate: input => {
        if (!input || input.trim() === '') {
          return 'Content is required';
        }
        return true;
      },
    },
  ]);

  return answers;
};

const updateTecPrompter = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Add a description?',
    },
    {
      type: 'input',
      name: 'language',
      message: 'What language are you using (Use full name)?',
      validate: input => {
        if (!input || input.trim() === '') {
          return 'Language is required';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'category',
      message: 'Add a category to snippet?',
    },
    {
      type: 'input',
      name: 'content',
      message: 'Copy and paste your snippet:',
      validate: input => {
        if (!input || input.trim() === '') {
          return 'Content is required';
        }
        return true;
      },
    },
  ]);

  return answers;
};

const deleteTecPrompter = async () => {
  const willDelete = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Are you sure you want to delete this snippet?',
      default: false,
    },
  ]);

  return willDelete.proceed;
};

const createPacPrompter = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Add a description?',
    },
    {
      type: 'input',
      name: 'version',
      message: 'Specify version of package?',
    },
    {
      type: 'input',
      name: 'language',
      message: 'What language are you using (Use full name)?',
      validate: input => {
        if (!input || input.trim() === '') {
          return 'Language is required';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'category',
      message: 'Add a category to snippet?',
    },
    {
      type: 'input',
      name: 'author',
      message: 'Specify author of the package?',
    },
    {
      type: 'input',
      name: 'sourcePath',
      message: 'Please enter the source path of your package:',
      validate: input => {
        if (!input || input.trim() === '') {
          return 'Source path is required';
        }
        return true;
      },
    },
  ]);

  return answers;
};

const updatePacPrompter = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Add a description?',
    },
    {
      type: 'input',
      name: 'version',
      message: 'Specify version of package?',
    },
    {
      type: 'input',
      name: 'language',
      message: 'What language are you using (Use full name)?',
      validate: input => {
        if (!input || input.trim() === '') {
          return 'Language is required';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'category',
      message: 'Add a category to snippet?',
    },
    {
      type: 'input',
      name: 'author',
      message: 'Specify author of the package?',
    },
    {
      type: 'input',
      name: 'sourcePath',
      message: 'Please enter the source path of your package:',
      validate: input => {
        if (!input || input.trim() === '') {
          return 'Source path is required';
        }
        return true;
      },
    },
  ]);
  return answers;
};

const deletePacPrompter = async () => {
  const willDelete = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Are you sure you want to delete this package?',
      default: false,
    },
  ]);

  return willDelete.proceed;
};

export {
  createTecPrompter,
  updateTecPrompter,
  deleteTecPrompter,
  createPacPrompter,
  updatePacPrompter,
  deletePacPrompter,
};
