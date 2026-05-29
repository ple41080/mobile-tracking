const { withProjectBuildGradle, withGradleProperties } = require('@expo/config-plugins')

// Force androidx.core to a version compatible with AGP 8.6.0 (compileSdk 35)
// and override Kotlin version to 1.9.25 to satisfy Compose Compiler 1.5.15
const withAndroidBuildFix = (config) => {
  // 1. Patch root build.gradle — add resolutionStrategy
  config = withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.contents.includes('androidx.core:core:1.15.0')) {
      return cfg // already patched
    }
    cfg.modResults.contents = cfg.modResults.contents.replace(
      'allprojects {',
      `allprojects {
    configurations.all {
        resolutionStrategy {
            force 'androidx.core:core:1.15.0'
            force 'androidx.core:core-ktx:1.15.0'
        }
    }
`
    )
    // Override Kotlin version in classpath
    cfg.modResults.contents = cfg.modResults.contents.replace(
      "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')",
      "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25')"
    )
    return cfg
  })

  // 2. Patch gradle.properties — force Kotlin version
  config = withGradleProperties(config, (cfg) => {
    const props = cfg.modResults
    if (!props.find((p) => p.key === 'android.kotlinVersion')) {
      props.push({ type: 'property', key: 'android.kotlinVersion', value: '1.9.25' })
    }
    return cfg
  })

  return config
}

module.exports = withAndroidBuildFix
