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
    'app/src/main/res/mipmap-mdpi',
  ];

  for (const dir of dirs) {
    await fs.ensureDir(path.join(root, dir));
  }

  // settings.gradle
  await fs.writeFile(path.join(root, 'settings.gradle'), `
pluginManagement {
    repositories { google(); mavenCentral(); gradlePluginPortal() }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories { google(); mavenCentral() }
}
rootProject.name = "${config.appName}"
include ':app'
`);

  // Root build.gradle (using modern plugins DSL)
  await fs.writeFile(path.join(root, 'build.gradle'), `
plugins {
    id 'com.android.application' version '8.5.0' apply false
    id 'com.android.library' version '8.5.0' apply false
}
`);

  // App build.gradle
  await fs.writeFile(path.join(root, 'app/build.gradle'), `
plugins {
    id 'com.android.application'
}

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

    buildTypes {
        release {
            minifyEnabled false
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }
}
`);

  // AndroidManifest.xml
  await fs.writeFile(path.join(root, 'app/src/main/AndroidManifest.xml'), `
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:allowBackup="true"
        android:label="${config.appName}"
        android:supportsRtl="true">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`);

  // MainActivity.java
  await fs.writeFile(path.join(root, 'app/src/main/java/', packagePath, 'MainActivity.java'), `
package ${config.packageName};

import android.app.Activity;
import android.os.Bundle;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
}
`);

  // Detect Android SDK
  const sdkPath = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || '/usr/lib/android-sdk';
  await fs.writeFile(path.join(root, 'local.properties'), `sdk.dir=${sdkPath}\n`);

  // Basic styles/strings to avoid build errors
  await fs.writeFile(path.join(root, 'app/src/main/res/values/strings.xml'), `
<resources>
    <string name="app_name">${config.appName}</string>
</resources>`);

  console.log(chalk.green('✔ Fixed Android project structure generated (AGP 8.5.0 compatibility).'));
};
