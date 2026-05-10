package com.gmc.musicplayer.playback

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection

/**
 * Manages binding to PlaybackService.
 * Calls onConnected/onDisconnected when the service connection changes.
 */
class PlaybackServiceConnection(
    private val onConnected: () -> Unit,
    private val onDisconnected: () -> Unit,
) {
    var service: PlaybackService? = null
        private set

    private var bound = false

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, binder: android.os.IBinder?) {
            service = (binder as? PlaybackService.LocalBinder)?.getService()
            bound = true
            onConnected()
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            service = null
            bound = false
            onDisconnected()
        }
    }

    fun bind(context: Context) {
        if (bound) return
        val intent = Intent(context, PlaybackService::class.java)
        context.startService(intent)
        context.bindService(intent, connection, Context.BIND_AUTO_CREATE)
    }

    fun unbind(context: Context) {
        if (!bound) return
        context.unbindService(connection)
        bound = false
        service = null
    }
}
