package com.gmc.musicplayer.plugins

import android.Manifest
import android.os.Build
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import com.gmc.musicplayer.indexing.LibraryIndexer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * Capacitor bridge for MediaStore-based library scanning.
 *
 * Permissions:
 *   - Android 13+: READ_MEDIA_AUDIO
 *   - Android <13: READ_EXTERNAL_STORAGE
 *
 * Events emitted to Angular:
 *   - scanProgress  { found: Int, indexed: Int, total: Int, currentPath: String }
 *   - scanComplete  { trackCount: Int }
 *   - scanError     { message: String }
 */
@CapacitorPlugin(
    name = "LibraryPlugin",
    permissions = [
        Permission(
            alias = "readAudio",
            strings = [
                Manifest.permission.READ_MEDIA_AUDIO,  // API 33+
                Manifest.permission.READ_EXTERNAL_STORAGE,
            ],
        ),
    ],
)
class LibraryPlugin : Plugin() {

    private val scope   = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var indexer: LibraryIndexer

    override fun load() {
        super.load()
        indexer = LibraryIndexer(
            context      = context,
            onProgress   = { found, indexed, total, path ->
                notifyListeners("scanProgress", JSObject().apply {
                    put("found",       found)
                    put("indexed",     indexed)
                    put("total",       total)
                    put("currentPath", path)
                })
            },
            onComplete   = { count ->
                notifyListeners("scanComplete", JSObject().apply { put("trackCount", count) })
            },
            onError      = { msg ->
                notifyListeners("scanError", JSObject().apply { put("message", msg) })
            },
        )
    }

    @PluginMethod
    fun requestPermissions(call: PluginCall) {
        requestPermissionForAlias("readAudio", call, "permissionCallback")
    }

    @PermissionCallback
    private fun permissionCallback(call: PluginCall) {
        val granted = hasPermission(audioPermission())
        call.resolve(JSObject().apply { put("granted", granted) })
    }

    @PluginMethod
    fun checkPermissions(call: PluginCall) {
        call.resolve(JSObject().apply {
            put("granted", hasPermission(audioPermission()))
        })
    }

    @PluginMethod
    fun startScan(call: PluginCall) {
        val incremental = call.getBoolean("incremental") ?: true
        if (!hasPermission(audioPermission())) {
            call.reject("PERMISSION_DENIED", "Audio read permission not granted")
            return
        }
        scope.launch {
            indexer.scan(incremental = incremental)
        }
        call.resolve()
    }

    @PluginMethod
    fun stopScan(call: PluginCall) {
        indexer.cancel()
        call.resolve()
    }

    @PluginMethod
    fun getTracks(call: PluginCall) {
        val offset = call.getInt("offset") ?: 0
        val limit  = call.getInt("limit")  ?: 500
        scope.launch {
            val tracks = indexer.getTracks(offset, limit)
            val arr = JSArray()
            tracks.forEach { arr.put(it.toJSObject()) }
            call.resolve(JSObject().apply { put("tracks", arr) })
        }
    }

    @PluginMethod
    fun getAlbums(call: PluginCall) {
        scope.launch {
            val albums = indexer.getAlbums()
            val arr = JSArray()
            albums.forEach { arr.put(it.toJSObject()) }
            call.resolve(JSObject().apply { put("albums", arr) })
        }
    }

    @PluginMethod
    fun getArtists(call: PluginCall) {
        scope.launch {
            val artists = indexer.getArtists()
            val arr = JSArray()
            artists.forEach { arr.put(it.toJSObject()) }
            call.resolve(JSObject().apply { put("artists", arr) })
        }
    }

    @PluginMethod
    fun getArtwork(call: PluginCall) {
        val trackId = call.getLong("trackId") ?: run {
            call.reject("trackId required")
            return
        }
        scope.launch {
            val dataUri = indexer.getArtworkDataUri(trackId)
            call.resolve(JSObject().apply { put("dataUri", dataUri) })
        }
    }

    private fun audioPermission(): String =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
            Manifest.permission.READ_MEDIA_AUDIO
        else
            Manifest.permission.READ_EXTERNAL_STORAGE
}
