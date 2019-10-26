const path = require('path')

exports.default = async (config) => {
    return new Promise(async (resolve) => {
        if (typeof config.plugins !== 'undefined') {
            for (const plugin of config.plugins) {
                let [pluginRelativePath, pluginInstance] = [false, false]

                try {
                    pluginRelativePath = plugin.startsWith('./')
                    pluginInstance = pluginRelativePath
                        ? require( path.join(process.cwd(), `${plugin}/index.js`) )
                        : require( plugin )
                } catch (err) {
                    throw (`Plugin "${plugin}" doesn't exist, or badly formed.`)
                    break
                }

                if (pluginInstance) {
                    config = await pluginInstance.plugin(
                        config,
                        pluginRelativePath
                            ? path.join( process.cwd(), `${plugin}/index.js` )
                            : path.join( 'node_modules', plugin )
                    )
                }
            }
        }

        resolve(config)
    })
}