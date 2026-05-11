package com.gmc.musicplayer

import com.getcapacitor.BridgeActivity
import com.getcapacitor.Plugin
import com.gmc.musicplayer.plugins.LibraryPlugin
import com.gmc.musicplayer.plugins.MusicPlaybackPlugin

class MainActivity : BridgeActivity() {
    override fun registerPlugins(plugins: MutableList<Class<out Plugin>>) {
        super.registerPlugins(plugins)
        plugins.add(MusicPlaybackPlugin::class.java)
        plugins.add(LibraryPlugin::class.java)
    }
}
