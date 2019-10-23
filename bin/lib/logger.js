const signale = require('signale')
const DateTime = require('luxon').DateTime

exports.log = (logger, data = '', prefix = null) => {
    data = typeof data !== 'string' ? data.toString('ascii') : data

    if (logger === 'log' || prefix === null) {
        data = `${data.trim()}`
    } else {
        prefix = `${DateTime.local().toFormat('HH:mm:ss')} > ${prefix}`
    }

    signale[logger]({ prefix: prefix, message: data })
}
