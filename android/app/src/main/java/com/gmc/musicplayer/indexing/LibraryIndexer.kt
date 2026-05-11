package com.gmc.musicplayer.indexing

import android.content.ContentUris
import android.content.Context
import android.database.Cursor
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.provider.MediaStore
import android.util.Base64
import com.getcapacitor.JSObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.isActive
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import java.io.IOException
import kotlin.coroutines.coroutineContext

data class TrackRow(
    val id: Long,
    val uri: String,
    val title: String,
    val artist: String,
    val album: String,
    val albumId: Long,
    val artistId: Long,
    val durationMs: Long,
    val sizeBytes: Long,
    val dateAdded: Long,
    val dateModified: Long,
    val trackNum: Int,
    val year: Int,
    val mimeType: String,
    val data: String,
) {
    fun toJSObject(): JSObject = JSObject().apply {
        put("id",           id)
        put("source",       "local")
        put("uri",          uri)
        put("title",        title)
        put("artist",       artist)
        put("album",        album)
        put("artistId",     artistId)
        put("albumId",      albumId)
        put("durationMs",   durationMs)
        put("sizeBytes",    sizeBytes)
        put("dateAdded",    dateAdded * 1000L)
        put("dateModified", dateModified * 1000L)
        put("trackNum",     trackNum)
        put("year",         year)
        put("format",       mimeType.substringAfterLast('/'))
        put("folderPath",   data.substringBeforeLast('/'))
    }
}

data class AlbumRow(val id: Long, val title: String, val artist: String, val trackCount: Int) {
    fun toJSObject(): JSObject = JSObject().apply {
        put("id", id); put("title", title); put("artist", artist); put("trackCount", trackCount)
    }
}

data class ArtistRow(val id: Long, val name: String, val albumCount: Int) {
    fun toJSObject(): JSObject = JSObject().apply {
        put("id", id); put("name", name); put("albumCount", albumCount)
    }
}

/**
 * Queries Android MediaStore for audio tracks.
 * Supports incremental scans (only files modified after lastScanEpoch).
 * Runs entirely on IO dispatcher — safe to call from coroutine.
 */
class LibraryIndexer(
    private val context: Context,
    private val onProgress: (found: Int, indexed: Int, total: Int, path: String) -> Unit,
    private val onComplete: (trackCount: Int) -> Unit,
    private val onError: (message: String) -> Unit,
) {
    private var cancelled = false

    // ── Scan ──────────────────────────────────────────────────────────────

    suspend fun scan(incremental: Boolean, lastScanEpoch: Long = 0L) = withContext(Dispatchers.IO) {
        cancelled = false
        try {
            val projection = arrayOf(
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Media.TITLE,
                MediaStore.Audio.Media.ARTIST,
                MediaStore.Audio.Media.ALBUM,
                MediaStore.Audio.Media.ALBUM_ID,
                MediaStore.Audio.Media.ARTIST_ID,
                MediaStore.Audio.Media.DURATION,
                MediaStore.Audio.Media.SIZE,
                MediaStore.Audio.Media.DATE_ADDED,
                MediaStore.Audio.Media.DATE_MODIFIED,
                MediaStore.Audio.Media.TRACK,
                MediaStore.Audio.Media.YEAR,
                MediaStore.Audio.Media.MIME_TYPE,
                MediaStore.Audio.Media.DATA,
            )

            val selection = buildString {
                append("${MediaStore.Audio.Media.IS_MUSIC} != 0")
                if (incremental && lastScanEpoch > 0) {
                    append(" AND ${MediaStore.Audio.Media.DATE_MODIFIED} > ${lastScanEpoch / 1000}")
                }
            }

            val cursor: Cursor? = context.contentResolver.query(
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                projection,
                selection,
                null,
                "${MediaStore.Audio.Media.DATE_MODIFIED} DESC",
            )

            cursor?.use { c ->
                val total = c.count
                var indexed = 0

                while (c.moveToNext() && !cancelled && coroutineContext.isActive) {
                    val track = c.toTrackRow()
                    // TODO: upsert track into SQLite (Phase 2 — DB layer)
                    indexed++
                    onProgress(indexed, indexed, total, track.data)
                }

                onComplete(indexed)
            } ?: onError("MediaStore query returned null cursor")

        } catch (e: Exception) {
            onError(e.message ?: "Unknown scan error")
        }
    }

    fun cancel() {
        cancelled = true
    }

    // ── Queries ───────────────────────────────────────────────────────────

    suspend fun getTracks(offset: Int, limit: Int): List<TrackRow> = withContext(Dispatchers.IO) {
        val results = mutableListOf<TrackRow>()
        val cursor = context.contentResolver.query(
            MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
            null,
            "${MediaStore.Audio.Media.IS_MUSIC} != 0",
            null,
            "${MediaStore.Audio.Media.TITLE} ASC LIMIT $limit OFFSET $offset",
        ) ?: return@withContext results

        cursor.use { c ->
            while (c.moveToNext()) results.add(c.toTrackRow())
        }
        results
    }

    suspend fun getAlbums(): List<AlbumRow> = withContext(Dispatchers.IO) {
        val results = mutableListOf<AlbumRow>()
        val cursor = context.contentResolver.query(
            MediaStore.Audio.Albums.EXTERNAL_CONTENT_URI,
            arrayOf(
                MediaStore.Audio.Albums._ID,
                MediaStore.Audio.Albums.ALBUM,
                MediaStore.Audio.Albums.ARTIST,
                MediaStore.Audio.Albums.NUMBER_OF_SONGS,
            ),
            null, null, "${MediaStore.Audio.Albums.ALBUM} ASC",
        ) ?: return@withContext results

        cursor.use { c ->
            while (c.moveToNext()) {
                results.add(AlbumRow(
                    id = c.getLong(c.getColumnIndexOrThrow(MediaStore.Audio.Albums._ID)),
                    title = c.getString(c.getColumnIndexOrThrow(MediaStore.Audio.Albums.ALBUM)) ?: "",
                    artist = c.getString(c.getColumnIndexOrThrow(MediaStore.Audio.Albums.ARTIST)) ?: "",
                    trackCount = c.getInt(c.getColumnIndexOrThrow(MediaStore.Audio.Albums.NUMBER_OF_SONGS)),
                ))
            }
        }
        results
    }

    suspend fun getArtists(): List<ArtistRow> = withContext(Dispatchers.IO) {
        val results = mutableListOf<ArtistRow>()
        val cursor = context.contentResolver.query(
            MediaStore.Audio.Artists.EXTERNAL_CONTENT_URI,
            arrayOf(
                MediaStore.Audio.Artists._ID,
                MediaStore.Audio.Artists.ARTIST,
                MediaStore.Audio.Artists.NUMBER_OF_ALBUMS,
            ),
            null, null, "${MediaStore.Audio.Artists.ARTIST} ASC",
        ) ?: return@withContext results

        cursor.use { c ->
            while (c.moveToNext()) {
                results.add(ArtistRow(
                    id = c.getLong(c.getColumnIndexOrThrow(MediaStore.Audio.Artists._ID)),
                    name = c.getString(c.getColumnIndexOrThrow(MediaStore.Audio.Artists.ARTIST)) ?: "",
                    albumCount = c.getInt(c.getColumnIndexOrThrow(MediaStore.Audio.Artists.NUMBER_OF_ALBUMS)),
                ))
            }
        }
        results
    }

    suspend fun getArtworkDataUri(trackId: Long): String? = withContext(Dispatchers.IO) {
        try {
            val trackUri = ContentUris.withAppendedId(
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, trackId,
            )
            val artworkUri = Uri.parse("content://media/external/audio/albumart").let {
                val albumId = context.contentResolver.query(
                    trackUri,
                    arrayOf(MediaStore.Audio.Media.ALBUM_ID),
                    null, null, null,
                )?.use { c ->
                    if (c.moveToFirst()) c.getLong(0) else null
                }
                albumId?.let { ContentUris.withAppendedId(it.let {
                    Uri.parse("content://media/external/audio/albumart")
                }, it) }
            } ?: return@withContext null

            val bmp = context.contentResolver.openInputStream(artworkUri)?.use { stream ->
                BitmapFactory.decodeStream(stream)
            } ?: return@withContext null

            val compressed = ByteArrayOutputStream()
            bmp.compress(Bitmap.CompressFormat.JPEG, 80, compressed)
            val base64 = Base64.encodeToString(compressed.toByteArray(), Base64.NO_WRAP)
            "data:image/jpeg;base64,$base64"
        } catch (e: IOException) {
            null
        }
    }

    // ── Cursor helpers ────────────────────────────────────────────────────

    private fun Cursor.toTrackRow(): TrackRow {
        val id = getLong(getColumnIndexOrThrow(MediaStore.Audio.Media._ID))
        return TrackRow(
            id          = id,
            uri         = ContentUris.withAppendedId(
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id
            ).toString(),
            title       = getString(getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)) ?: "",
            artist      = getString(getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)) ?: "",
            album       = getString(getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)) ?: "",
            albumId     = getLong(getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)),
            artistId    = getLong(getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST_ID)),
            durationMs  = getLong(getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)),
            sizeBytes   = getLong(getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE)),
            dateAdded   = getLong(getColumnIndexOrThrow(MediaStore.Audio.Media.DATE_ADDED)),
            dateModified = getLong(getColumnIndexOrThrow(MediaStore.Audio.Media.DATE_MODIFIED)),
            trackNum    = getInt(getColumnIndexOrThrow(MediaStore.Audio.Media.TRACK)),
            year        = getInt(getColumnIndexOrThrow(MediaStore.Audio.Media.YEAR)),
            mimeType    = getString(getColumnIndexOrThrow(MediaStore.Audio.Media.MIME_TYPE)) ?: "",
            data        = getString(getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)) ?: "",
        )
    }
}
