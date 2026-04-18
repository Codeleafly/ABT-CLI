import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import os from 'os';

export interface AndroidConfig {
  appName: string;
  packageName: string;
  sdkVersion: string;
  language: 'java' | 'kotlin';
  iconPath?: string;
  permissions?: string[];
}

export const generateAndroidProject = async (config: AndroidConfig) => {
  const root = process.cwd();
  const packagePath = config.packageName.replace(/\./g, '/');
  
  console.log(chalk.blue(`🚀 Generating Advanced Android Project: ${config.appName}`));

  // 1. Clean and Create Folders (Including Native and Libs)
  const baseDirs = ['app', 'gradle', '.idea', '.gradle'];
  for (const d of baseDirs) {
    if (fs.existsSync(path.join(root, d))) await fs.remove(path.join(root, d));
  }

  const dirs = [
    'app/libs',
    'app/src/main/cpp', // For Custom Binaries / JNI
    'app/src/main/java/' + packagePath,
    'app/src/main/kotlin/' + packagePath,
    'app/src/main/res/drawable',
    'app/src/main/res/layout',
    'app/src/main/res/values',
    'app/src/main/res/xml',
    'gradle/wrapper',
  ];

  for (const dir of dirs) {
    await fs.ensureDir(path.join(root, dir));
  }

  // 2. Handle Permissions
  const defaultPermissions = ['android.permission.INTERNET'];
  const finalPermissions = Array.from(new Set([...defaultPermissions, ...(config.permissions || [])]));
  const permissionsXml = finalPermissions.map(p => `    <uses-permission android:name="${p}" />`).join('\n');

  // 3. Project Files (settings.gradle, build.gradle, etc.)
  await fs.writeFile(path.join(root, 'settings.gradle'), `rootProject.name = "${config.appName}"\ninclude ':app'\n`);
  await fs.writeFile(path.join(root, 'gradle.properties'), `android.useAndroidX=true\nandroid.nonTransitiveRClass=true\n`);

  await fs.writeFile(path.join(root, 'build.gradle'), `
plugins {
    id 'com.android.application' version '8.7.2' apply false
    id 'org.jetbrains.kotlin.android' version '2.0.21' apply false
}
`);

  // 4. App-level build.gradle with Libs support
  const kotlinPlugin = config.language === 'kotlin' ? "id 'org.jetbrains.kotlin.android'" : "";
  await fs.writeFile(path.join(root, 'app/build.gradle'), `
plugins {
    id 'com.android.application'
    ${kotlinPlugin}
}

android {
    namespace '${config.packageName}'
    compileSdk ${config.sdkVersion}
    compileSdkVersion ${config.sdkVersion}

    defaultConfig {
        applicationId '${config.packageName}'
        minSdk 24
        targetSdk ${config.sdkVersion}
        versionCode 1
        versionName "1.0"
    }

    // Support for Custom Binaries (JNI)
    externalNativeBuild {
        // cmake { path "src/main/cpp/CMakeLists.txt" }
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar', '*.aar']) // Native Libs support
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
}
`);

  // 5. AndroidManifest.xml with Permissions
  await fs.writeFile(path.join(root, 'app/src/main/AndroidManifest.xml'), `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
${permissionsXml}
    <application android:label="${config.appName}" android:theme="@style/Theme.AppCompat.Light">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`);

  // 6. MainActivity
  const mainActivityContent = config.language === 'java' 
    ? `package ${config.packageName};\nimport androidx.appcompat.app.AppCompatActivity;\nimport android.os.Bundle;\n\npublic class MainActivity extends AppCompatActivity {\n    @Override\n    protected void onCreate(Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n    }\n}`
    : `package ${config.packageName}\nimport androidx.appcompat.app.AppCompatActivity\nimport android.os.Bundle\n\nclass MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n    }\n}`;

  const sourceDir = config.language === 'java' ? 'java' : 'kotlin';
  await fs.writeFile(path.join(root, `app/src/main/${sourceDir}/`, packagePath, `MainActivity.${config.language === 'java' ? 'java' : 'kt'}`), mainActivityContent);

  // SDK detection
  const homeDir = os.homedir();
  const sdkPath = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || path.join(homeDir, 'android-sdk');
  await fs.writeFile(path.join(root, 'local.properties'), `sdk.dir=${sdkPath}\n`);

  console.log(chalk.green(`✔ Project generated with Native & Libs support. Permissions added: ${finalPermissions.join(', ')}`));
};
