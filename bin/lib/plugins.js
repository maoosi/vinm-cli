const path = require('path')

exports.default = async (config) => {
    return new Promise(async (resolve, reject) => {
        let plugins = []

        if (typeof config.plugins !== 'undefined') {
            for (const plugin of config.plugins) {
                let [pluginRelativePath, pluginModule] = [false, false]

                try {
                    let regex = /^(.\/|..\/|\/).+/i
                    pluginRelativePath = regex.test(plugin)
                    pluginModule = pluginRelativePath
                        ? require(path.join(process.cwd(), `${plugin}/index.js`))
                        : require(plugin)
                } catch (err) {
                    console.log(err)
                    reject(`Plugin "${plugin}" doesn't exist, or badly formed.`)
                    break
                }

                if (pluginModule) {
                    plugins.push({
                        name: plugin,
                        instance: pluginModule.plugin(),
                        directory: pluginRelativePath
                            ? path.join(process.cwd(), `${plugin}/index.js`)
                            : path.join('node_modules', plugin)
                    })
                }
            }
        }

        resolve({
            hook: (hook, args) => {
                return new Promise(async (resolve, reject) => {
                    for (let index in plugins) {
                        let plugin = plugins[index]
                        if (typeof plugin.instance !== 'undefined' &&
                            typeof plugin.instance[hook] !== 'undefined') {
                            try {
                                if (hook === 'afterReadYmlConfig') {
                                    args.pluginDirectory = plugin.directory
                                    args.ymlConfig = await plugin.instance[hook](args)
                                }
                            } catch (err) {
                                reject(`Plugin "${plugin.name}" badly formed.`)
                            }
                        }
                    }
                    if (hook === 'afterReadYmlConfig') {
                        resolve(args.ymlConfig)
                    }
                })
            }
        })
    })
}
