package com.gmc.musicplayer.plugins

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.gmc.musicplayer.playback.PlaybackService
import com.gmc.musicplayer.playback.PlaybackServiceConnection

/**
 * Capacitor bridge for ExoPlayer-based playback.
 *
 * Events emitted to Angular:
 *   - playbackStateChanged  { state: "idle"|"loading"|"buffering"|"playing"|"paused"|"error" }
 *   - trackChanged          { queueIndex: Int }
 *   - progressUpdate        { positionMs: Long, durationMs: Long, bufferedMs: Long }
 *   - queueChanged          { items: Array, currentIndex: Int }
 *   - playbackError         { code: String, message: String }
 *
 * Thread-safety: all @PluginMethod calls run on the main thread by default.
 * ExoPlayer operations are dispatched to the main thread via PlaybackService.
 */
@CapacitorPlugin(name = "MusicPlaybackPlugin")
class MusicPlaybackPlugin : Plugin() {

    private val serviceConnection = PlaybackServiceConnection(
        onConnected  = { notifyListeners("serviceConnected", JSObject()) },
        onDisconnected = { notifyListeners("serviceDisconnected", JSObject()) },
    )

    private val service: PlaybackService? get() = serviceConnection.service

    override fun load() {
        super.load()
        serviceConnection.bind(context)
    }

    override fun handleOnDestroy() {
        serviceConnection.unbind(context)
        super.handleOnDestroy()
    }

    // ── Playback commands ─────────────────────────────────────────────────

    @PluginMethod
    fun play(call: PluginCall) {
        service?.play()
        call.resolve()
    }

    @PluginMethod
    fun pause(call: PluginCall) {
        service?.pause()
        call.resolve()
    }

    @PluginMethod
    fun togglePlayPause(call: PluginCall) {
        service?.togglePlayPause()
        call.resolve()
    }

    @PluginMethod
    fun next(call: PluginCall) {
        service?.seekToNext()
        call.resolve()
    }

    @PluginMethod
    fun previous(call: PluginCall) {
        service?.seekToPrevious()
        call.resolve()
    }

    @PluginMethod
    fun seekTo(call: PluginCall) {
        val positionMs = call.getLong("positionMs") ?: run {
            call.reject("positionMs required")
            return
        }
        service?.seekTo(positionMs)
        call.resolve()
    }

    @PluginMethod
    fun setVolume(call: PluginCall) {
        val volume = call.getFloat("volume") ?: 1f
        service?.setVolume(volume.coerceIn(0f, 1f))
        call.resolve()
    }

    @PluginMethod
    fun setSpeed(call: PluginCall) {
        val speed = call.getFloat("speed") ?: 1f
        service?.setSpeed(speed.coerceIn(0.25f, 3f))
        call.resolve()
    }

    @PluginMethod
    fun setShuffle(call: PluginCall) {
        val enabled = call.getBoolean("enabled") ?: false
        service?.setShuffle(enabled)
        call.resolve()
    }

    @PluginMethod
    fun setRepeat(call: PluginCall) {
        val mode = call.getString("mode") ?: "none"
        service?.setRepeat(mode)
        call.resolve()
    }

    @PluginMethod
    fun playQueueAt(call: PluginCall) {
        val index = call.getInt("index") ?: run {
            call.reject("index required")
            return
        }
        service?.playQueueAt(index)
        call.resolve()
    }

    @PluginMethod
    fun addToQueue(call: PluginCall) {
        val trackId = call.getLong("trackId") ?: run {
            call.reject("trackId required")
            return
        }
        val next = call.getBoolean("next") ?: false
        service?.addToQueue(trackId, next)
        call.resolve()
    }

    @PluginMethod
    fun clearQueue(call: PluginCall) {
        service?.clearQueue()
        call.resolve()
    }

    @PluginMethod
    fun getPlaybackState(call: PluginCall) {
        val state = service?.getStateSnapshot() ?: JSObject().apply {
            put("state", "idle")
            put("positionMs", 0L)
            put("durationMs", 0L)
            put("bufferedMs", 0L)
        }
        call.resolve(state)
    }

    // ── Called by PlaybackService to push events to Angular ───────────────

    fun emitStateChanged(state: String) {
        notifyListeners("playbackStateChanged", JSObject().apply { put("state", state) })
    }

    fun emitTrackChanged(queueIndex: Int) {
        notifyListeners("trackChanged", JSObject().apply { put("queueIndex", queueIndex) })
    }

    fun emitProgress(positionMs: Long, durationMs: Long, bufferedMs: Long) {
        notifyListeners("progressUpdate", JSObject().apply {
            put("positionMs", positionMs)
            put("durationMs", durationMs)
            put("bufferedMs", bufferedMs)
        })
    }

    fun emitError(code: String, message: String) {
        notifyListeners("playbackError", JSObject().apply {
            put("code", code)
            put("message", message)
        })
    }
}
