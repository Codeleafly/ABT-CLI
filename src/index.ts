import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { generateAndroidProject } from './commands/generate.js';
import { buildAndroidProject } from './commands/build.js';
import { autoCommitAndPush } from './utils/git.js';

const program = new Command();

const runInteractive = async () => {
  console.log(chalk.magenta.bold('\nWelcome to the Modular ABT-CLI\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'appName',
      message: 'App Name:',
      default: 'MyModularApp'
    },
    {
      type: 'input',
      name: 'packageName',
      message: 'Package Name:',
      default: 'com.abt.modular'
    },
    {
      type: 'list',
      name: 'sdkVersion',
      message: 'Select SDK Version:',
      choices: ['31', '33', '34'],
      default: '34'
    },
    {
      type: 'confirm',
      name: 'shouldBuild',
      message: 'Would you like to build the project immediately?',
      default: true
    }
  ]);

  await generateAndroidProject(answers);
  
  if (answers.shouldBuild) {
    await buildAndroidProject();
  }

  await autoCommitAndPush(`chore: generate android project ${answers.appName}`);
};

program
  .name('abt')
  .description('Modular Android CLI')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate Android structure')
  .option('-i, --interactive', 'Run interactively', true)
  .action(async () => {
    await runInteractive();
  });

program
  .command('build')
  .description('Build the current Android project')
  .action(async () => {
    await buildAndroidProject();
    await autoCommitAndPush('chore: build android project');
  });

program.parse();
