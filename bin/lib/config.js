const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

exports.default = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const vinmFile = fs.readFileSync(
                path.join(process.cwd(), 'vinm.yml'),
                'utf8'
            )
            resolve( yaml.safeLoad(vinmFile) )
        } catch (err) {
            if (err.name === 'YAMLException') reject(`File "vinm.yml" contains error(s): ${err.reason}.`)
            else reject(`File "vinm.yml" not found.`)
        }
    })
}
