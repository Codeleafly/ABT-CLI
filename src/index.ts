import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { generateAndroidProject } from './commands/generate.js';
import { buildAndroidProject } from './commands/build.js';
import { autoCommitAndPush } from './utils/git.js';

const program = new Command();

const runInteractive = async () => {
  console.log(chalk.magenta.bold('\nWelcome to ABT-CLI Professional (BETA v1.2.0)\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'appName',
      message: 'App Name:',
      default: 'MyNativeApp'
    },
    {
      type: 'input',
      name: 'packageName',
      message: 'Package Name:',
      default: 'com.abt.native.app'
    },
    {
      type: 'list',
      name: 'sdkVersion',
      message: 'Select SDK Version (Android 12 to 16+):',
      choices: [
        { name: 'Android 12 (API 31)', value: '31' },
        { name: 'Android 12L (API 32)', value: '32' },
        { name: 'Android 13 (API 33)', value: '33' },
        { name: 'Android 14 (API 34)', value: '34' },
        { name: 'Android 15 (API 35)', value: '35' },
        { name: 'Android 16+ (API 36/Experimental)', value: '36' }
      ],
      default: '34'
    },
    {
      type: 'list',
      name: 'language',
      message: 'Select Language:',
      choices: ['java', 'kotlin'],
      default: 'kotlin'
    },
    {
      type: 'input',
      name: 'iconPath',
      message: 'Custom Icon Path (optional):',
      default: ''
    },
    {
      type: 'checkbox',
      name: 'presetPermissions',
      message: 'Select Common Permissions:',
      pageSize: 15,
      choices: [
        new inquirer.Separator('--- Basic ---'),
        { name: 'INTERNET', value: 'android.permission.INTERNET', checked: true },
        { name: 'VIBRATE', value: 'android.permission.VIBRATE' },
        { name: 'WAKE_LOCK', value: 'android.permission.WAKE_LOCK' },
        new inquirer.Separator('--- Hardware ---'),
        { name: 'CAMERA', value: 'android.permission.CAMERA' },
        { name: 'RECORD_AUDIO', value: 'android.permission.RECORD_AUDIO' },
        { name: 'FLASHLIGHT', value: 'android.permission.FLASHLIGHT' },
        new inquirer.Separator('--- Storage ---'),
        { name: 'READ_EXTERNAL_STORAGE', value: 'android.permission.READ_EXTERNAL_STORAGE' },
        { name: 'WRITE_EXTERNAL_STORAGE', value: 'android.permission.WRITE_EXTERNAL_STORAGE' },
        { name: 'MANAGE_EXTERNAL_STORAGE (API 30+)', value: 'android.permission.MANAGE_EXTERNAL_STORAGE' },
        new inquirer.Separator('--- Location ---'),
        { name: 'ACCESS_FINE_LOCATION', value: 'android.permission.ACCESS_FINE_LOCATION' },
        { name: 'ACCESS_COARSE_LOCATION', value: 'android.permission.ACCESS_COARSE_LOCATION' },
        { name: 'ACCESS_BACKGROUND_LOCATION', value: 'android.permission.ACCESS_BACKGROUND_LOCATION' },
        new inquirer.Separator('--- Bluetooth (Modern) ---'),
        { name: 'BLUETOOTH_SCAN', value: 'android.permission.BLUETOOTH_SCAN' },
        { name: 'BLUETOOTH_CONNECT', value: 'android.permission.BLUETOOTH_CONNECT' },
        { name: 'BLUETOOTH_ADVERTISE', value: 'android.permission.BLUETOOTH_ADVERTISE' },
        new inquirer.Separator('--- Contacts & SMS ---'),
        { name: 'READ_CONTACTS', value: 'android.permission.READ_CONTACTS' },
        { name: 'SEND_SMS', value: 'android.permission.SEND_SMS' }
      ]
    },
    {
      type: 'input',
      name: 'customPermissions',
      message: 'Enter Custom Permissions (comma separated, e.g. com.myapp.MY_PERMISSION):',
      default: ''
    },
    {
      type: 'confirm',
      name: 'shouldBuild',
      message: 'Would you like to build the project immediately?',
      default: true
    }
  ]);

  // Merge preset and custom permissions
  const customList = answers.customPermissions
    ? answers.customPermissions.split(',').map((p: string) => p.trim())
    : [];
  const allPermissions = Array.from(new Set([...answers.presetPermissions, ...customList]));

  await generateAndroidProject({
    ...answers,
    permissions: allPermissions
  });
  
  if (answers.shouldBuild) {
    await buildAndroidProject();
  }

  await autoCommitAndPush(`chore: generate project ${answers.appName} with SDK ${answers.sdkVersion}`);
};

program
  .name('abt')
  .description('ABT-CLI: Professional Android Project Generator')
  .version('1.2.0');

program
  .command('generate')
  .description('Generate Android structure')
  .option('-i, --interactive', 'Run interactively', true)
  .option('-n, --name <name>', 'App Name', 'MyNativeApp')
  .option('-p, --package <package>', 'Package Name', 'com.abt.native.app')
  .option('-s, --sdk <version>', 'SDK Version', '34')
  .option('-l, --language <lang>', 'Language (java/kotlin)', 'kotlin')
  .action(async (options) => {
    // If any specific flags are passed (other than default interactive true), skip interactive
    if (process.argv.length > 3 && !process.argv.includes('-i') && !process.argv.includes('--interactive')) {
      await generateAndroidProject({
        appName: options.name,
        packageName: options.package,
        sdkVersion: options.sdk,
        language: options.language,
        permissions: ['android.permission.INTERNET'] // Default for scripted
      });
      await buildAndroidProject();
    } else {
      await runInteractive();
    }
  });

program
  .command('build')
  .description('Build the current Android project')
  .action(async () => {
    await buildAndroidProject();
    await autoCommitAndPush('chore: build android project');
  });

program.parse();
