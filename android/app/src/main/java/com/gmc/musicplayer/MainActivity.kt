package com.gmc.musicplayer

import com.getcapacitor.BridgeActivity
import com.gmc.musicplayer.plugins.LibraryPlugin
import com.gmc.musicplayer.plugins.MusicPlaybackPlugin

class MainActivity : BridgeActivity() {
    override fun registerPlugins() {
        super.registerPlugins()
        registerPlugin(MusicPlaybackPlugin::class.java)
        registerPlugin(LibraryPlugin::class.java)
    }
}
