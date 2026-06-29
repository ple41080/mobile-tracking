const fs = require('fs')
const path = require('path')
const {
  withAndroidManifest,
  withMainApplication,
  withDangerousMod,
} = require('@expo/config-plugins')

const PACKAGE_REGISTER = 'packages.add(AppBlockPackage())'

const SOURCE_DIR = path.join(__dirname, 'appblock')
const TEMPLATE_PACKAGE = 'com.anonymous.petfocus'

function packageToDir(androidPackage) {
  return androidPackage.split('.').join(path.sep)
}

function copyAppBlockSources(projectRoot, androidPackage) {
  const targetDir = path.join(
    projectRoot,
    'android/app/src/main/java',
    packageToDir(androidPackage),
    'appblock',
  )
  fs.mkdirSync(targetDir, { recursive: true })
  for (const file of fs.readdirSync(SOURCE_DIR)) {
    if (!file.endsWith('.kt')) continue
    const content = fs
      .readFileSync(path.join(SOURCE_DIR, file), 'utf8')
      .replaceAll(TEMPLATE_PACKAGE, androidPackage)
    fs.writeFileSync(path.join(targetDir, file), content)
  }
}

const withAppBlockModule = (config) => {
  const androidPackage = config.android?.package ?? TEMPLATE_PACKAGE
  const packageImport = `import ${androidPackage}.appblock.AppBlockPackage`

  config = withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest
    const usesPermissions = manifest['uses-permission'] ?? []
    const names = usesPermissions.map((p) => p.$?.['android:name']).filter(Boolean)

    if (!names.includes('android.permission.POST_NOTIFICATIONS')) {
      usesPermissions.push({ $: { 'android:name': 'android.permission.POST_NOTIFICATIONS' } })
    }
    if (!names.includes('android.permission.PACKAGE_USAGE_STATS')) {
      usesPermissions.push({
        $: {
          'android:name': 'android.permission.PACKAGE_USAGE_STATS',
          'tools:ignore': 'ProtectedPermissions',
        },
      })
    }
    if (!names.includes('android.permission.FOREGROUND_SERVICE')) {
      usesPermissions.push({ $: { 'android:name': 'android.permission.FOREGROUND_SERVICE' } })
    }
    if (!names.includes('android.permission.FOREGROUND_SERVICE_SPECIAL_USE')) {
      usesPermissions.push({
        $: { 'android:name': 'android.permission.FOREGROUND_SERVICE_SPECIAL_USE' },
      })
    }
    manifest['uses-permission'] = usesPermissions

    const application = manifest.application?.[0]
    if (application) {
      const services = application.service ?? []
      const serviceName = '.appblock.FocusForegroundService'
      const hasService = services.some((s) => s.$?.['android:name'] === serviceName)
      if (!hasService) {
        services.push({
          $: {
            'android:name': serviceName,
            'android:exported': 'false',
            'android:foregroundServiceType': 'specialUse',
          },
          property: [
            {
              $: {
                'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
                'android:value': 'focus_timer',
              },
            },
          ],
        })
      }
      application.service = services
    }

    return cfg
  })

  config = withMainApplication(config, (cfg) => {
    let contents = cfg.modResults.contents
    if (!contents.includes('AppBlockPackage')) {
      if (!contents.includes(packageImport)) {
        contents = contents.replace(
          'import expo.modules.ReactNativeHostWrapper',
          `import expo.modules.ReactNativeHostWrapper\n\n${packageImport}`,
        )
      }
      if (!contents.includes(PACKAGE_REGISTER)) {
        contents = contents.replace(
          'return packages',
          `${PACKAGE_REGISTER}\n            return packages`,
        )
      }
    }
    cfg.modResults.contents = contents
    return cfg
  })

  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      copyAppBlockSources(cfg.modRequest.projectRoot, androidPackage)
      return cfg
    },
  ])

  return config
}

module.exports = withAppBlockModule
