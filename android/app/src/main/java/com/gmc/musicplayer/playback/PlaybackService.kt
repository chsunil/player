package com.gmc.musicplayer.playback

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import com.getcapacitor.JSObject
import com.gmc.musicplayer.session.MediaSessionHandler

/**
 * Foreground service that owns the ExoPlayer instance.
 *
 * Lifecycle:
 *   - Started via startForegroundService() when first track is played
 *   - Stays alive while playing (or in buffering state) even when app is backgrounded
 *   - Binds to MainActivity/plugin via ServiceConnection
 *   - Stopped when queue is empty AND user explicitly stops
 *
 * Threading:
 *   - ExoPlayer must be created and used on the main thread
 *   - All public methods called on main thread via plugin bridge
 */
class PlaybackService : Service() {

    inner class LocalBinder : Binder() {
        fun getService(): PlaybackService = this@PlaybackService
    }

    private val binder = LocalBinder()

    lateinit var player: ExoPlayer
        private set

    private lateinit var mediaSessionHandler: MediaSessionHandler
    private lateinit var notificationHandler: PlaybackNotificationHandler
    private lateinit var audioFocusHandler: AudioFocusHandler
    private lateinit var queueManager: QueueManager

    var pluginRef: com.gmc.musicplayer.plugins.MusicPlaybackPlugin? = null

    private val playerListener = object : Player.Listener {
        override fun onPlaybackStateChanged(playbackState: Int) {
            val state = when (playbackState) {
                Player.STATE_IDLE     -> "idle"
                Player.STATE_BUFFERING -> "buffering"
                Player.STATE_READY    -> if (player.playWhenReady) "playing" else "paused"
                Player.STATE_ENDED    -> "idle"
                else                  -> "idle"
            }
            pluginRef?.emitStateChanged(state)
            notificationHandler.update()
        }

        override fun onIsPlayingChanged(isPlaying: Boolean) {
            val state = if (isPlaying) "playing" else "paused"
            pluginRef?.emitStateChanged(state)
            notificationHandler.update()
            if (isPlaying) startProgressTimer() else stopProgressTimer()
        }

        override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
            pluginRef?.emitTrackChanged(player.currentMediaItemIndex)
        }

        override fun onPlayerError(error: androidx.media3.common.PlaybackException) {
            pluginRef?.emitError("PLAYBACK_ERROR", error.message ?: "Unknown error")
        }
    }

    private var progressTimer: java.util.Timer? = null

    override fun onCreate() {
        super.onCreate()

        player = ExoPlayer.Builder(this)
            .setHandleAudioBecomingNoisy(true)
            .build()
            .also { it.addListener(playerListener) }

        audioFocusHandler   = AudioFocusHandler(this, player)
        queueManager        = QueueManager(player)
        mediaSessionHandler = MediaSessionHandler(this, player)
        notificationHandler = PlaybackNotificationHandler(this, player, mediaSessionHandler.session)
    }

    override fun onBind(intent: Intent?): IBinder = binder

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onDestroy() {
        stopProgressTimer()
        audioFocusHandler.release()
        mediaSessionHandler.release()
        notificationHandler.release()
        player.removeListener(playerListener)
        player.release()
        super.onDestroy()
    }

    // ── Public API (called from plugin, main thread) ──────────────────────

    fun play() {
        audioFocusHandler.requestFocus()
        player.play()
    }

    fun pause() {
        player.pause()
        audioFocusHandler.abandonFocus()
    }

    fun togglePlayPause() {
        if (player.isPlaying) pause() else play()
    }

    fun seekToNext() {
        if (player.hasNextMediaItem()) player.seekToNextMediaItem()
    }

    fun seekToPrevious() {
        if (player.currentPosition > 3000L) {
            player.seekTo(0L)
        } else if (player.hasPreviousMediaItem()) {
            player.seekToPreviousMediaItem()
        }
    }

    fun seekTo(positionMs: Long) {
        player.seekTo(positionMs)
    }

    fun setVolume(volume: Float) {
        player.volume = volume
    }

    fun setSpeed(speed: Float) {
        player.setPlaybackSpeed(speed)
    }

    fun setShuffle(enabled: Boolean) {
        player.shuffleModeEnabled = enabled
    }

    fun setRepeat(mode: String) {
        player.repeatMode = when (mode) {
            "one" -> Player.REPEAT_MODE_ONE
            "all" -> Player.REPEAT_MODE_ALL
            else  -> Player.REPEAT_MODE_OFF
        }
    }

    fun playQueueAt(index: Int) {
        player.seekToDefaultPosition(index)
        play()
    }

    fun addToQueue(trackId: Long, next: Boolean) {
        queueManager.addTrackById(trackId, next)
    }

    fun clearQueue() {
        player.clearMediaItems()
        pluginRef?.emitStateChanged("idle")
    }

    fun getStateSnapshot(): JSObject = JSObject().apply {
        put("state",       if (player.isPlaying) "playing" else if (player.isLoading) "buffering" else "paused")
        put("positionMs",  player.currentPosition)
        put("durationMs",  player.duration.coerceAtLeast(0L))
        put("bufferedMs",  player.bufferedPosition)
    }

    // ── Progress timer ────────────────────────────────────────────────────

    private fun startProgressTimer() {
        stopProgressTimer()
        progressTimer = java.util.Timer().also { timer ->
            timer.scheduleAtFixedRate(object : java.util.TimerTask() {
                override fun run() {
                    val pos = player.currentPosition
                    val dur = player.duration.coerceAtLeast(0L)
                    val buf = player.bufferedPosition
                    android.os.Handler(mainLooper).post {
                        pluginRef?.emitProgress(pos, dur, buf)
                    }
                }
            }, 0L, 500L)
        }
    }

    private fun stopProgressTimer() {
        progressTimer?.cancel()
        progressTimer = null
    }
}
