package com.anonymous.petfocus.appblock

import android.app.AppOpsManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.Process
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat

class FocusForegroundService : Service() {

  companion object {
    const val ACTION_START = "com.anonymous.petfocus.action.START_FOCUS"
    const val ACTION_STOP = "com.anonymous.petfocus.action.STOP_FOCUS"
    const val EXTRA_TOTAL_SECONDS = "total_seconds"
    const val EXTRA_BLOCKED_PACKAGES = "blocked_packages"

    private const val CHANNEL_ID = "focus_timer_v2"
    private const val FAIL_CHANNEL_ID = "focus_fail"
    private const val NOTIFICATION_ID = 1001
    private const val FAIL_NOTIFICATION_ID = 1002

    var onTick: ((remainingSeconds: Int) -> Unit)? = null
    var onComplete: (() -> Unit)? = null
    var onPaused: (() -> Unit)? = null
    var onResumed: (() -> Unit)? = null
    var onBlocked: (() -> Unit)? = null
  }

  private enum class TimerState { RUNNING, PAUSED, FAILED }

  private val handler = Handler(Looper.getMainLooper())
  private var remainingSeconds = 0
  private var tickRunnable: Runnable? = null
  private var timerState = TimerState.RUNNING
  private var blockedPackages = setOf<String>()
  private var isScreenOn = true
  private var hasFailed = false
  private var hasCompleted = false
  private var launcherPackage: String? = null
  private var serviceStartedAt = 0L

  private val blockDetectGraceMs = 2000L

  private val screenReceiver = object : BroadcastReceiver() {
    override fun onReceive(_context: Context?, intent: Intent?) {
      when (intent?.action) {
        Intent.ACTION_SCREEN_OFF -> {
          isScreenOn = false
          evaluateState()
        }
        Intent.ACTION_SCREEN_ON -> {
          isScreenOn = true
          evaluateState()
        }
      }
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    createNotificationChannels()
    launcherPackage = resolveLauncherPackage()
    val filter = IntentFilter().apply {
      addAction(Intent.ACTION_SCREEN_OFF)
      addAction(Intent.ACTION_SCREEN_ON)
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      registerReceiver(screenReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
    } else {
      @Suppress("DEPRECATION")
      registerReceiver(screenReceiver, filter)
    }
    isScreenOn = true
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_START -> {
        val total = intent.getIntExtra(EXTRA_TOTAL_SECONDS, 0)
        if (total <= 0) {
          stopSelf()
          return START_NOT_STICKY
        }
        blockedPackages =
          intent.getStringArrayListExtra(EXTRA_BLOCKED_PACKAGES)?.toSet() ?: emptySet()
        remainingSeconds = total
        timerState = TimerState.RUNNING
        hasFailed = false
        hasCompleted = false
        serviceStartedAt = System.currentTimeMillis()
        startForegroundWithNotification()
        scheduleTick()
      }
      ACTION_STOP -> stopTimer()
    }
    return START_STICKY
  }

  override fun onDestroy() {
    try {
      unregisterReceiver(screenReceiver)
    } catch (_: Exception) {
      // ignore if already unregistered
    }
    stopTicking()
    super.onDestroy()
  }

  private fun scheduleTick() {
    tickRunnable?.let { handler.removeCallbacks(it) }
    tickRunnable = object : Runnable {
      override fun run() {
        if (hasFailed || hasCompleted) return

        evaluateState()
        if (hasFailed || hasCompleted) return

        if (timerState == TimerState.RUNNING) {
          if (remainingSeconds <= 0) {
            hasCompleted = true
            onComplete?.invoke()
            stopTimer()
            return
          }
          updateNotification()
          onTick?.invoke(remainingSeconds)
          remainingSeconds -= 1
        } else if (timerState == TimerState.PAUSED) {
          updateNotification()
        }

        handler.postDelayed(this, 1000L)
      }
    }
    handler.post(tickRunnable!!)
  }

  private fun evaluateState() {
    if (hasFailed || hasCompleted) return

    val newState = computeTimerState()
    if (newState == TimerState.FAILED) {
      handleFail()
      return
    }

    if (newState != timerState) {
      val previous = timerState
      timerState = newState
      updateNotification()
      when {
        previous == TimerState.PAUSED && newState == TimerState.RUNNING -> onResumed?.invoke()
        previous == TimerState.RUNNING && newState == TimerState.PAUSED -> onPaused?.invoke()
      }
    }
  }

  private fun computeTimerState(): TimerState {
    if (System.currentTimeMillis() - serviceStartedAt < blockDetectGraceMs) {
      return TimerState.RUNNING
    }
    if (!isScreenOn) return TimerState.RUNNING
    if (!hasUsageAccess()) return TimerState.RUNNING

    val foreground = getForegroundPackage() ?: return TimerState.RUNNING
    return if (blockedPackages.contains(foreground)) TimerState.FAILED else TimerState.RUNNING
  }

  private fun handleFail() {
    if (hasFailed || hasCompleted) return
    hasFailed = true
    timerState = TimerState.FAILED
    stopTicking()
    showFailNotification()
    onBlocked?.invoke()
    stopTimer()
  }

  private fun getForegroundPackage(): String? {
    if (!hasUsageAccess()) return null
    return try {
      val usageStatsManager =
        getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      val end = System.currentTimeMillis()
      val start = end - 5000
      val usageEvents = usageStatsManager.queryEvents(start, end)
      val event = UsageEvents.Event()
      var lastForeground: String? = null
      while (usageEvents.hasNextEvent()) {
        usageEvents.getNextEvent(event)
        val isForegroundEvent = event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND ||
          (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
            event.eventType == UsageEvents.Event.ACTIVITY_RESUMED)
        if (isForegroundEvent) {
          lastForeground = event.packageName
        }
      }
      if (lastForeground != null) return lastForeground

      val stats =
        usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_BEST, start, end)
          ?: return null
      stats
        .filter { it.lastTimeUsed > 0 }
        .maxByOrNull { it.lastTimeUsed }
        ?.packageName
    } catch (_: Exception) {
      null
    }
  }

  private fun resolveLauncherPackage(): String? {
    val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
    val resolveInfo = packageManager.resolveActivity(
      intent,
      PackageManager.MATCH_DEFAULT_ONLY
    )
    return resolveInfo?.activityInfo?.packageName
  }

  private fun isLauncherPackage(pkg: String): Boolean {
    if (launcherPackage == pkg) return true
    val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
    val activities = packageManager.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY)
    return activities.any { it.activityInfo.packageName == pkg }
  }

  private fun hasUsageAccess(): Boolean {
    val appOps = getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        packageName
      )
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        packageName
      )
    }
    return mode == AppOpsManager.MODE_ALLOWED
  }

  private fun stopTicking() {
    tickRunnable?.let { handler.removeCallbacks(it) }
    tickRunnable = null
  }

  private fun stopTimer() {
    stopTicking()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      stopForeground(STOP_FOREGROUND_REMOVE)
    } else {
      @Suppress("DEPRECATION")
      stopForeground(true)
    }
    stopSelf()
  }

  private fun startForegroundWithNotification() {
    val notification = buildNotification(remainingSeconds, timerState)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      ServiceCompat.startForeground(
        this,
        NOTIFICATION_ID,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
      )
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
  }

  private fun updateNotification() {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.notify(NOTIFICATION_ID, buildNotification(remainingSeconds, timerState))
  }

  private fun showFailNotification() {
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    val pendingIntent = PendingIntent.getActivity(
      this,
      1,
      launchIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val notification = NotificationCompat.Builder(this, FAIL_CHANNEL_ID)
      .setContentTitle("ล้มเหลวในการทำ focus")
      .setContentText("เปิดแอปที่ห้ามใช้ระหว่างโฟกัส — ลองใหม่เมื่อพร้อมนะ")
      .setSmallIcon(notificationIconRes())
      .setAutoCancel(true)
      .setContentIntent(pendingIntent)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .build()

    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.notify(FAIL_NOTIFICATION_ID, notification)
  }

  private fun buildNotification(seconds: Int, state: TimerState): Notification {
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    val pendingIntent = PendingIntent.getActivity(
      this,
      0,
      launchIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val contentText = when (state) {
      TimerState.PAUSED -> "หยุดชั่วคราว — กลับหน้า home หรือปิดหน้าจอเพื่อนับต่อ (${formatTime(seconds)})"
      else -> "เหลือเวลา ${formatTime(seconds)}"
    }

    val builder = NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Focus Mode ⏱")
      .setContentText(contentText)
      .setSmallIcon(notificationIconRes())
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setContentIntent(pendingIntent)
      .setPriority(NotificationCompat.PRIORITY_DEFAULT)
      .setCategory(NotificationCompat.CATEGORY_PROGRESS)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      builder.foregroundServiceBehavior = NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE
    }

    return builder.build()
  }

  private fun notificationIconRes(): Int {
    val appIcon = applicationInfo.icon
    return if (appIcon != 0) appIcon else android.R.drawable.ic_menu_info_details
  }

  private fun createNotificationChannels() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    val timerChannel = NotificationChannel(
      CHANNEL_ID,
      "Focus Timer",
      NotificationManager.IMPORTANCE_DEFAULT
    ).apply {
      description = "แสดงเวลานับถอยหลังขณะโฟกัส"
      setShowBadge(true)
    }
    manager.createNotificationChannel(timerChannel)

    val failChannel = NotificationChannel(
      FAIL_CHANNEL_ID,
      "Focus Failed",
      NotificationManager.IMPORTANCE_HIGH
    ).apply {
      description = "แจ้งเตือนเมื่อโฟกัสล้มเหลว"
    }
    manager.createNotificationChannel(failChannel)
  }

  private fun formatTime(seconds: Int): String {
    val minutes = seconds / 60
    val secs = seconds % 60
    return String.format("%02d:%02d", minutes, secs)
  }
}
