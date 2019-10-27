const path = require('path')

exports.default = async (config) => {
    return new Promise(async (resolve, reject) => {
        if (typeof config.plugins !== 'undefined') {
            for (const plugin of config.plugins) {
                let [pluginRelativePath, pluginInstance] = [false, false]

                try {
                    let regex = /^(.\/|..\/|\/).+/i
                    pluginRelativePath = regex.test(plugin)
                    pluginInstance = pluginRelativePath
                        ? require(path.join(process.cwd(), `${plugin}/index.js`))
                        : require(plugin)
                } catch (err) {
                    console.log(err)
                    reject(`Plugin "${plugin}" doesn't exist, or badly formed.`)
                    break
                }

                if (pluginInstance) {
                    config = await pluginInstance.plugin(
                        config,
                        pluginRelativePath
                            ? path.join(process.cwd(), `${plugin}/index.js`)
                            : path.join('node_modules', plugin)
                    )
                }
            }
        }

        resolve(config)
    })
}