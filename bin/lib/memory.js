var vinmMemory = {}

exports.write = (data) => {
    vinmMemory = Object.assign(vinmMemory, data)
}

exports.read = () => {
    return vinmMemory
}
