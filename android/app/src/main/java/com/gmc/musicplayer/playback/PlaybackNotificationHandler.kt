package com.gmc.musicplayer.playback

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import androidx.media3.common.Player
import androidx.media3.session.MediaSession
import androidx.media3.ui.PlayerNotificationManager

private const val CHANNEL_ID   = "melodia_playback"
private const val NOTIFICATION_ID = 1001

/**
 * Manages the media playback foreground notification.
 * Uses PlayerNotificationManager (Media3) which automatically handles
 * play/pause/next/prev actions and integrates with MediaSession.
 */
class PlaybackNotificationHandler(
    private val service: PlaybackService,
    private val player: Player,
    private val mediaSession: MediaSession,
) {
    private val notificationManager: PlayerNotificationManager

    init {
        createChannel()

        notificationManager = PlayerNotificationManager.Builder(
            service,
            NOTIFICATION_ID,
            CHANNEL_ID,
        )
            .setMediaDescriptionAdapter(MelodiaDescriptionAdapter(service))
            .setNotificationListener(object : PlayerNotificationManager.NotificationListener {
                override fun onNotificationPosted(
                    notificationId: Int,
                    notification: Notification,
                    ongoing: Boolean,
                ) {
                    if (ongoing) {
                        service.startForeground(notificationId, notification)
                    } else {
                        service.stopForeground(false)
                    }
                }

                override fun onNotificationCancelled(notificationId: Int, dismissedByUser: Boolean) {
                    service.stopSelf()
                }
            })
            .build()

        notificationManager.setPlayer(player)
        notificationManager.setMediaSessionToken(mediaSession.sessionCompatToken)
        notificationManager.setUseNextAction(true)
        notificationManager.setUsePreviousAction(true)
        notificationManager.setUseStopAction(false)
    }

    fun update() {
        notificationManager.invalidate()
    }

    fun release() {
        notificationManager.setPlayer(null)
    }

    private fun createChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Music Playback",
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = "Melodia music player controls"
            setShowBadge(false)
        }
        val mgr = service.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        mgr.createNotificationChannel(channel)
    }
}

class MelodiaDescriptionAdapter(
    private val context: Context,
) : PlayerNotificationManager.MediaDescriptionAdapter {
    override fun getCurrentContentTitle(player: Player): CharSequence =
        player.currentMediaItem?.mediaMetadata?.title ?: "Unknown"

    override fun createCurrentContentIntent(player: Player): android.app.PendingIntent? = null

    override fun getCurrentContentText(player: Player): CharSequence? =
        player.currentMediaItem?.mediaMetadata?.artist

    override fun getCurrentLargeIcon(
        player: Player,
        callback: PlayerNotificationManager.BitmapCallback,
    ): android.graphics.Bitmap? = null
}
