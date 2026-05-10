package com.gmc.musicplayer.session

import android.content.Context
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession

/**
 * Creates and manages the MediaSession attached to ExoPlayer.
 * MediaSession enables:
 *   - Lock screen controls
 *   - Bluetooth headset button handling
 *   - Android Auto integration
 *   - Now-playing metadata in system UI
 */
class MediaSessionHandler(
    context: Context,
    player: ExoPlayer,
) {
    val session: MediaSession = MediaSession.Builder(context, player)
        .setId("melodia_session")
        .build()

    fun release() {
        session.release()
    }
}
