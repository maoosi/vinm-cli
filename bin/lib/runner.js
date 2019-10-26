const io = require('socket.io')
const spawn = require('child_process').spawn
const logger = require('./logger.js')
const memory = require('./memory.js')
const vinmVars = require('./vars.js').default

const execShell = (shell) => {
    return new Promise((resolve) => {

        // report results
        let reportSuccess = true

        // read options from memory
        let options = memory.read()

        // inject vars
        shell = vinmVars(shell, options)

        // execute shell command
        let child = spawn(shell, {
            cwd: process.cwd(),
            shell: true
        })

        // log outputs
        child.stdout.on('data', (data) => {
            logger.log('log', `${data}`)
            process.stdin.pipe(child.stdin)
        })
        child.stderr.on('data', (data) => {
            let errorType = data.toString().substr(1, 6) === 'arning' ? 'warn' : 'fatal'
            if (errorType === 'fatal') reportSuccess = false
            logger.log(errorType, data)
        })
        child.on('error', (error) => {
            reportSuccess = false
            logger.log('fatal', error)
        })
        child.on('close', (code) => {
            if (code !== 0) {
                reportSuccess = false
                logger.log('fatal', `Child process exited with code ${code}`)
            }
            resolve(reportSuccess)
        })

    })
}

const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

const startServer = (options) => {
    memory.write(options)
    let server = io(options['vinm.port'])

    server.on('connection', (socket) => {
        socket.on('vinm', (data) => {
            memory.write({ [data.name]: JSON.parse(data.value) })
        })
    })

    return server
}

exports.default = async (tasks, options) => {
    let server = startServer(options)
    let reportResults = []
    await asyncForEach(tasks, async (task) => {
        logger.log('pending', `${task.name}`, `[task]`)
        reportResults.push({
            task: task.name,
            success: await execShell(task.shell)
        })
        logger.log('complete', `${task.name}`, `[task]`)
    })
    server.close()
    return reportResults
}
