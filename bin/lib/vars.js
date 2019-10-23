exports.default = (input, options = {}) => {
    let output = input

    // inject ${vinm}
    output = output.replace('${vinm}', JSON.stringify(options).replace(/"/g, '\\\"'))

    // inject ${vinm.*} vars
    let matches = output.match(/(\$\{vinm\.[a-zA-Z0-9\.]+(?:[\[\']+[a-zA-Z0-9]+[\'\]]+)*\})/gm)
    if (matches !== null && matches.length > 0) {
        matches.forEach((m) => {
            let varname = m.replace('${vinm.', '').replace('}', '')
            let variable = varname.split('.')[0]
            let childs = varname.replace(variable, '')
            let result = eval( `options['${variable}']${childs}` )
            output = output.replace(m, result)
        })
    }

    // inject $vinm.* vars
    let matches2 = output.match(/(\$vinm\.[a-zA-Z0-9\.]+(?:[\[\']+[a-zA-Z0-9]+[\'\]]+)*)/gm)
    if (matches2 !== null && matches2.length > 0) {
        matches2.forEach((m) => {
            let varname = m.replace('$vinm.', '')
            let variable = varname.split('.')[0]
            let childs = varname.replace(variable, '')
            let result = eval( `options['${variable}']${childs}` )
            output = output.replace(m, result)
        })
    }

    return output
}