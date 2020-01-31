const spawn = require('child_process').spawn
const logger = require('./logger.js')
const memory = require('./memory.js')
const vinmVars = require('./vars.js').default

const execShell = (shell) => {
    return new Promise((resolve) => {

        // report results
        let report = 'success'

        // read options from memory
        let options = memory.read()

        // inject vars
        shell = vinmVars(shell, options)

        // execute shell command
        const child = spawn(shell, {
            cwd: process.cwd(),
            shell: true,
            stdio: ['inherit', 'pipe', 'pipe']
        })

        // log outputs
        child.stderr.on('data', (data) => {
            if (data.toString().toLowerCase().includes('error')) {
                report = 'error'
                logger.log('fatal', data)
            } else {
                logger.log('log', `${data}`)
            }
        })
        child.stdout.on('data', (data) => {
            if (data.lastIndexOf('vinm.stdout:', 0) === 0) {
                const vinmData = JSON.parse(`${data}`.replace('vinm.stdout:', ''))
                memory.write({ [vinmData.name]: JSON.parse(vinmData.value) })
            } else {
                logger.log('log', `${data}`)
            }
        })
        child.on('error', (error) => {
            report = 'error'
            logger.log('fatal', error)
        })
        child.on('close', (code) => {
            if (code > 0) report = 'error'
            resolve(report)
        })

    })
}

const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

exports.default = async (tasks, options) => {
    memory.write(options)
    let reportResults = []
    await asyncForEach(tasks, async (task) => {
        logger.log('pending', `${task.name}`, `[task]`)
        reportResults.push({
            task: task.name,
            report: await execShell(task.shell)
        })
        logger.log('complete', `${task.name}`, `[task]`)
    })
    return reportResults
}
