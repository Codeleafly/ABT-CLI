import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export interface AndroidConfig {
  appName: string;
  packageName: string;
  sdkVersion: string;
}

export const generateAndroidProject = async (config: AndroidConfig) => {
  const root = process.cwd();
  const packagePath = config.packageName.replace(/\./g, '/');
  
  const dirs = [
    'app/src/main/java/' + packagePath,
    'app/src/main/res/layout',
    'app/src/main/res/values',
    'gradle/wrapper',
  ];

  for (const dir of dirs) {
    await fs.ensureDir(path.join(root, dir));
  }

  await fs.writeFile(path.join(root, 'build.gradle'), `
buildscript {
    repositories { google(); mavenCentral() }
    dependencies { classpath 'com.android.tools.build:gradle:8.1.0' }
}
allprojects { repositories { google(); mavenCentral() } }
`);

  await fs.writeFile(path.join(root, 'app/build.gradle'), `
plugins { id 'com.android.application' }
android {
    namespace '${config.packageName}'
    compileSdk ${config.sdkVersion}
    defaultConfig {
        applicationId '${config.packageName}'
        minSdk 24
        targetSdk ${config.sdkVersion}
        versionCode 1
        versionName "1.0"
    }
}
`);

  await fs.writeFile(path.join(root, 'app/src/main/AndroidManifest.xml'), `
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:label="${config.appName}">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`);

  console.log(chalk.green('✔ Android project structure generated.'));
};
