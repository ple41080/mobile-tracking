package com.anonymous.petfocus.appblock

import android.Manifest
import android.app.AppOpsManager
import android.app.NotificationManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.os.Build
import android.os.Process
import android.provider.Settings
import android.util.Base64
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.ByteArrayOutputStream
import java.util.Calendar

class AppBlockModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  init {
    instance = this
    FocusForegroundService.onTick = { remaining ->
      emitFocusTick(remaining)
    }
    FocusForegroundService.onComplete = {
      emitFocusComplete()
    }
    FocusForegroundService.onPaused = {
      emitFocusPaused()
    }
    FocusForegroundService.onResumed = {
      emitFocusResumed()
    }
    FocusForegroundService.onBlocked = {
      emitBlockedAppDetected()
    }
  }

  override fun getName(): String = "AppBlockModule"

  @ReactMethod
  fun addListener(eventName: String) {
    // Required for NativeEventEmitter
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // Required for NativeEventEmitter
  }

  @ReactMethod
  fun isUsageAccessEnabled(promise: Promise) {
    promise.resolve(hasUsageAccess())
  }

  @ReactMethod
  fun openUsageAccessSettings(promise: Promise) {
    try {
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      reactContext.startActivity(intent)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("OPEN_USAGE_SETTINGS_FAILED", e.message, e)
    }
  }

  @ReactMethod
  fun openNotificationSettings(promise: Promise) {
    try {
      val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
          putExtra(Settings.EXTRA_APP_PACKAGE, reactContext.packageName)
        }
      } else {
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
          data = android.net.Uri.parse("package:${reactContext.packageName}")
        }
      }.apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      reactContext.startActivity(intent)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("OPEN_NOTIFICATION_SETTINGS_FAILED", e.message, e)
    }
  }

  @ReactMethod
  fun getTodayUsage(promise: Promise) {
    if (!hasUsageAccess()) {
      promise.resolve(Arguments.createArray())
      return
    }

    try {
      val usageStatsManager =
        reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      val calendar = Calendar.getInstance().apply {
        set(Calendar.HOUR_OF_DAY, 0)
        set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0)
        set(Calendar.MILLISECOND, 0)
      }
      val start = calendar.timeInMillis
      val end = System.currentTimeMillis()
      val stats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, end)
      val pm = reactContext.packageManager
      val result = Arguments.createArray()

      for (stat in stats ?: emptyList()) {
        if (stat.totalTimeInForeground <= 0) continue
        val minutes = (stat.totalTimeInForeground / 60000).toInt()
        if (minutes < 1) continue

        val map = Arguments.createMap()
        map.putString("packageName", stat.packageName)
        map.putInt("minutes", minutes)
        try {
          val appInfo = pm.getApplicationInfo(stat.packageName, PackageManager.GET_META_DATA)
          map.putString("name", appInfo.loadLabel(pm).toString())
          appIconToBase64(pm, stat.packageName)?.let { map.putString("iconBase64", it) }
        } catch (_: Exception) {
          map.putString("name", stat.packageName)
        }
        result.pushMap(map)
      }

      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("GET_USAGE_FAILED", e.message, e)
    }
  }

  @ReactMethod
  fun isAccessibilityEnabled(promise: Promise) {
    promise.resolve(false)
  }

  @ReactMethod
  fun areNotificationsEnabled(promise: Promise) {
    try {
      val manager =
        reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      val enabled = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        manager.areNotificationsEnabled()
      } else {
        true
      }
      promise.resolve(enabled)
    } catch (e: Exception) {
      promise.reject("CHECK_NOTIFICATIONS_FAILED", e.message, e)
    }
  }

  @ReactMethod
  fun startBlocking(_packages: ReadableArray, promise: Promise) {
    promise.resolve(null)
  }

  @ReactMethod
  fun stopBlocking(promise: Promise) {
    promise.resolve(null)
  }

  @ReactMethod
  fun startFocusService(totalSeconds: Int, blockedPackages: ReadableArray, promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        val granted = ContextCompat.checkSelfPermission(
          reactContext,
          Manifest.permission.POST_NOTIFICATIONS
        ) == PackageManager.PERMISSION_GRANTED
        if (!granted) {
          promise.reject(
            "NOTIFICATION_PERMISSION_DENIED",
            "POST_NOTIFICATIONS permission not granted"
          )
          return
        }
      }

      val manager =
        reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && !manager.areNotificationsEnabled()) {
        promise.reject("NOTIFICATIONS_DISABLED", "Notifications disabled in system settings")
        return
      }

      val packages = ArrayList<String>()
      for (i in 0 until blockedPackages.size()) {
        blockedPackages.getString(i)?.let { packages.add(it) }
      }
      val intent = Intent(reactContext.applicationContext, FocusForegroundService::class.java).apply {
        action = FocusForegroundService.ACTION_START
        putExtra(FocusForegroundService.EXTRA_TOTAL_SECONDS, totalSeconds)
        putStringArrayListExtra(FocusForegroundService.EXTRA_BLOCKED_PACKAGES, packages)
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        reactContext.applicationContext.startForegroundService(intent)
      } else {
        reactContext.applicationContext.startService(intent)
      }
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("START_FOCUS_SERVICE_FAILED", e.message, e)
    }
  }

  @ReactMethod
  fun stopFocusService(promise: Promise) {
    try {
      val intent = Intent(reactContext, FocusForegroundService::class.java).apply {
        action = FocusForegroundService.ACTION_STOP
      }
      reactContext.startService(intent)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("STOP_FOCUS_SERVICE_FAILED", e.message, e)
    }
  }

  private fun sendEvent(eventName: String, params: WritableMap?) {
    if (!reactContext.hasActiveReactInstance()) return
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  private fun emitFocusTick(remainingSeconds: Int) {
    val params = Arguments.createMap().apply {
      putInt("remainingSeconds", remainingSeconds)
    }
    sendEvent("onFocusTick", params)
  }

  private fun emitFocusComplete() {
    sendEvent("onFocusComplete", null)
  }

  private fun emitFocusPaused() {
    sendEvent("onFocusPaused", null)
  }

  private fun emitFocusResumed() {
    sendEvent("onFocusResumed", null)
  }

  private fun emitBlockedAppDetected() {
    sendEvent("onBlockedAppDetected", null)
  }

  private fun appIconToBase64(pm: PackageManager, packageName: String, sizePx: Int = 48): String? {
    return try {
      val drawable = pm.getApplicationIcon(packageName)
      val bitmap = drawableToBitmap(drawable, sizePx)
      val stream = ByteArrayOutputStream()
      bitmap.compress(Bitmap.CompressFormat.PNG, 80, stream)
      Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
    } catch (_: Exception) {
      null
    }
  }

  private fun drawableToBitmap(drawable: Drawable, sizePx: Int): Bitmap {
    if (drawable is BitmapDrawable && drawable.bitmap != null) {
      val source = drawable.bitmap
      return Bitmap.createScaledBitmap(source, sizePx, sizePx, true)
    }

    val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    drawable.setBounds(0, 0, canvas.width, canvas.height)
    drawable.draw(canvas)
    return bitmap
  }

  private fun hasUsageAccess(): Boolean {
    val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        reactContext.packageName
      )
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        reactContext.packageName
      )
    }
    return mode == AppOpsManager.MODE_ALLOWED
  }

  companion object {
    @Volatile
    private var instance: AppBlockModule? = null
  }
}
