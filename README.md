# ABT-CLI (BETA v1.2.0) 🚀

A professional, modular CLI tool to generate and build full native Android projects with deep structure and advanced configurations.

## 🌟 Core Features
- **Deep Official Structure**: Generates the exact directory hierarchy used by Android Studio.
- **Future-Ready SDKs**: Support for **Android 12 (API 31)** through **Android 16+ (API 36/Experimental)**.
- **Smart Permissions**:
    - **Categorized Presets**: Easy selection for Camera, Location, Bluetooth (Modern), Storage, and more.
    - **Custom Input**: Support for manual entry of any custom or experimental permissions.
- **Optimized Pipeline**: 
    - **Cached SDK**: Skips redundant downloads if the Android SDK or build tools are already present.
    - **Auto-Installation**: Automatically downloads and configures the environment on first run.
- **Native & Libs**: Pre-configured `app/libs` and `app/src/main/cpp` for external libraries and NDK development.

## 🚀 Quick Start
```bash
# Start the interactive project generator
abt generate

# Trigger a manual build (APK & AAB)
abt build
```

## 📁 Generated Structure
- `app/src/main/`: Core production code (Java/Kotlin).
- `app/src/androidTest/` & `test/`: Native UI and Unit testing folders.
- `app/src/main/res/xml/`: Professional configurations (e.g., network security).
- `gradle/wrapper/`: Pre-configured Gradle environment.

## 🛠 Tech Stack
- **Node.js + TypeScript (ESM)**
- **Gradle 9.x + AGP 8.7.2 + Kotlin 2.0.21**
- **AndroidX & Material Design 3 Components**

---
*Note: This tool is currently in BETA. Native binary support (NDK) requires manual uncommenting of the CMake block in `app/build.gradle`.*
