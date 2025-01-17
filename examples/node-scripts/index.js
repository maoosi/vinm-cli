const vinm = require('vinm-nodejs-emitter')()
const publicIp = require('public-ip')

module.exports.myip = async () => {

    // read my IP address
    let myip = await publicIp.v4()

    // send it to Vinm
    vinm('ip', myip)

}

module.exports.wait = async (seconds) => {

    // wait
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true)
        }, seconds)
    })

}