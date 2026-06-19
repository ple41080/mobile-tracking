const fs = require('fs')
const path = require('path')
const {
  withAndroidManifest,
  withMainApplication,
  withDangerousMod,
} = require('@expo/config-plugins')

const PACKAGE_IMPORT = 'import com.anonymous.petfocus.appblock.AppBlockPackage'
const PACKAGE_REGISTER = 'packages.add(AppBlockPackage())'

const SOURCE_DIR = path.join(__dirname, 'appblock')

function copyAppBlockSources(projectRoot) {
  const targetDir = path.join(
    projectRoot,
    'android/app/src/main/java/com/anonymous/petfocus/appblock'
  )
  fs.mkdirSync(targetDir, { recursive: true })
  for (const file of fs.readdirSync(SOURCE_DIR)) {
    if (!file.endsWith('.kt')) continue
    fs.copyFileSync(path.join(SOURCE_DIR, file), path.join(targetDir, file))
  }
}

const withAppBlockModule = (config) => {
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
    if (!contents.includes(PACKAGE_IMPORT)) {
      contents = contents.replace(
        'import expo.modules.ReactNativeHostWrapper',
        `import expo.modules.ReactNativeHostWrapper\n\n${PACKAGE_IMPORT}`
      )
    }
    if (!contents.includes(PACKAGE_REGISTER)) {
      contents = contents.replace(
        'return packages',
        `${PACKAGE_REGISTER}\n            return packages`
      )
    }
    cfg.modResults.contents = contents
    return cfg
  })

  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      copyAppBlockSources(cfg.modRequest.projectRoot)
      return cfg
    },
  ])

  return config
}

module.exports = withAppBlockModule
