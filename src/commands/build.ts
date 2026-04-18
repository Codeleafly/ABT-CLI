import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import os from 'os';
import { runCommand, checkCommand } from '../utils/shell.js';

export const buildAndroidProject = async () => {
  console.log(chalk.yellow.bold('\n🏗 Validating Environment and Building (BETA)...\n'));
  
  const homeDir = os.homedir();
  const sdkPath = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || path.join(homeDir, 'android-sdk');
  const sdkManager = path.join(sdkPath, 'cmdline-tools/latest/bin/sdkmanager');

  // 1. Check if SDK Base exists
  if (!fs.existsSync(sdkManager)) {
    console.log(chalk.cyan(`🚀 SDK Tools not found at ${sdkPath}. Downloading...`));
    await fs.ensureDir(sdkPath);
    const zipPath = path.join(homeDir, 'cmdline-tools.zip');
    
    await runCommand('wget', ['-O', zipPath, 'https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip']);
    await runCommand('unzip', ['-q', zipPath, '-d', sdkPath]);
    await fs.remove(zipPath);
    
    const cmdlineToolsDir = path.join(sdkPath, 'cmdline-tools');
    const latestDir = path.join(cmdlineToolsDir, 'latest');
    await fs.ensureDir(latestDir);
    
    const items = await fs.readdir(cmdlineToolsDir);
    for (const item of items) {
        if (item !== 'latest') {
            await fs.move(path.join(cmdlineToolsDir, item), path.join(latestDir, item));
        }
    }
  } else {
    console.log(chalk.gray('✔ Android Command Line Tools already installed.'));
  }

  // 2. Check if Licenses are already accepted
  const licenseFile = path.join(sdkPath, 'licenses/android-sdk-license');
  if (!fs.existsSync(licenseFile)) {
    console.log(chalk.cyan('⚖ Accepting Android SDK licenses...'));
    await runCommand('bash', ['-c', `yes | ${sdkManager} --sdk_root=${sdkPath} --licenses`]);
  } else {
    console.log(chalk.gray('✔ SDK Licenses already accepted.'));
  }

  // 3. Check if Platform and Build-Tools are already installed
  const platformPath = path.join(sdkPath, 'platforms/android-34');
  const buildToolsPath = path.join(sdkPath, 'build-tools/34.0.0');

  if (!fs.existsSync(platformPath) || !fs.existsSync(buildToolsPath)) {
    console.log(chalk.cyan('📥 Installing missing Platform 34 or Build-Tools...'));
    await runCommand(sdkManager, [`--sdk_root=${sdkPath}`, 'platforms;android-34', 'build-tools;34.0.0']);
  } else {
    console.log(chalk.gray('✔ Android Platform 34 and Build-Tools already present.'));
  }

  // 4. Update local.properties for the current project
  const localProps = path.join(process.cwd(), 'local.properties');
  await fs.writeFile(localProps, `sdk.dir=${sdkPath}\n`);

  console.log(chalk.green('✔ Environment Ready. Starting Build...'));
  
  // 5. Build
  const apkSuccess = await runCommand('gradle', ['assembleDebug']);
  const aabSuccess = await runCommand('gradle', ['bundleDebug']);
  
  // 6. Verify Artifacts
  const apkPath = path.join(process.cwd(), 'app/build/outputs/apk/debug/app-debug.apk');
  const aabPath = path.join(process.cwd(), 'app/build/outputs/bundle/debug/app-debug.aab');
  
  const apkExists = fs.existsSync(apkPath);
  const aabExists = fs.existsSync(aabPath);

  if (apkExists && aabExists) {
    console.log(chalk.green.bold('\n✔ Build Successful! Artifacts Verified.'));
    console.log(chalk.blue(`APK: ${apkPath}`));
    console.log(chalk.blue(`AAB: ${aabPath}`));
  } else {
    console.log(chalk.red.bold('\n❌ Build verification failed. Artifacts not found.'));
  }
  
  return apkSuccess && aabSuccess && apkExists && aabExists;
};
