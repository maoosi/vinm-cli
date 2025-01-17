const vinm = require('vinm-nodejs-emitter')()
const publicIp = require('public-ip')

const myip = async ({ vinmVar }) => {

    // read my IP address
    let myip = await publicIp.v4()

    // send it to Vinm
    vinm(vinmVar, myip)

}

module.exports.run = async (params) => {
    try {
        let func = params.exec
        delete params.exec
        eval(`await ${func}(${params})`)
        process.exit()
    } catch (err) {
        console.error(err)
        process.exit()
    }

    require('make-runnable/custom')({
        printOutputFrame: false
    })
}

module.exports.plugin = () => {

    const afterReadYmlConfig = async ({ ymlConfig, pluginDirectory }) => {
        for (let task in ymlConfig.tasks) {
            ymlConfig.tasks[task].shell =
                ymlConfig.tasks[task].shell.replace('vinm@utils', `node "${pluginDirectory}" run`)
        }
        return Promise.resolve(ymlConfig)
    }

    return {
        afterReadYmlConfig
    }

}