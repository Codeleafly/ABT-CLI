import chalk from 'chalk';
import { runCommand, checkCommand } from '../utils/shell.js';

export const buildAndroidProject = async () => {
  console.log(chalk.yellow.bold('\n🏗 Validating Environment and Building...\n'));
  
  const hasJava = await checkCommand('java');
  const hasGradle = await checkCommand('gradle');

  if (!hasJava) {
    console.log(chalk.cyan('🚀 Java not found. Installing OpenJDK in background...'));
    await runCommand('sudo', ['apt-get', 'update', '-y']);
    await runCommand('sudo', ['apt-get', 'install', '-y', 'default-jdk']);
  }

  if (!hasGradle) {
    console.log(chalk.cyan('🚀 Gradle not found. Installing Gradle in background...'));
    await runCommand('sudo', ['apt-get', 'install', '-y', 'gradle']);
  }

  console.log(chalk.green('✔ Environment Ready. Starting Build...'));
  
  // Real build command
  const success = await runCommand('gradle', ['assembleDebug']);
  
  if (success) {
    console.log(chalk.green.bold('\n✔ Build Successful! APK: app/build/outputs/apk/debug/app-debug.apk'));
  } else {
    console.log(chalk.red.bold('\n❌ Build Failed. Please check the logs above.'));
  }
  
  return success;
};
