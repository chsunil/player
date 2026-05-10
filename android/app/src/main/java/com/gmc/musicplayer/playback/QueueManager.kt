package com.gmc.musicplayer.playback

import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.exoplayer.ExoPlayer

/**
 * Manages ExoPlayer's media item list (the queue).
 * All methods must be called on the main thread.
 */
class QueueManager(private val player: ExoPlayer) {

    fun setQueue(items: List<QueueItem>, startIndex: Int = 0) {
        val mediaItems = items.map { it.toMediaItem() }
        player.setMediaItems(mediaItems, startIndex, 0L)
        player.prepare()
    }

    fun addTrackById(trackId: Long, next: Boolean) {
        // TODO: look up track URI from SQLite and build MediaItem
        // Placeholder: full implementation in Phase 4 (indexing engine)
    }

    fun insertAt(item: QueueItem, index: Int) {
        player.addMediaItem(index, item.toMediaItem())
    }

    fun removeAt(index: Int) {
        player.removeMediaItem(index)
    }

    fun moveItem(from: Int, to: Int) {
        player.moveMediaItem(from, to)
    }
}

data class QueueItem(
    val id: String,
    val trackId: Long,
    val uri: String,
    val title: String,
    val artist: String,
    val album: String,
    val artworkUri: String?,
    val durationMs: Long,
)

fun QueueItem.toMediaItem(): MediaItem =
    MediaItem.Builder()
        .setUri(uri)
        .setMediaId(id)
        .setMediaMetadata(
            MediaMetadata.Builder()
                .setTitle(title)
                .setArtist(artist)
                .setAlbumTitle(album)
                .setArtworkUri(artworkUri?.let { android.net.Uri.parse(it) })
                .build(),
        )
        .build()
