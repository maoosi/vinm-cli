exports.default = (config, stage) => {
    return new Promise(async (resolve, reject) => {
        if (typeof config.stages[stage] !== 'undefined') {
            resolve(config.stages[stage])
        } else {
            reject(`Stage "${stage}" not found.`)
        }
    })
}
