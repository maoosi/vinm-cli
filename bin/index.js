#!/usr/bin/env node
'use strict'

const meow = require('meow')
const logger = require('./lib/logger.js')
const getVinmYmlFile = require('./lib/yml.js').default
const getStageVars = require('./lib/options.js').default
const getTasks = require('./lib/tasks.js').default
const run = require('./lib/runner.js').default
const loadPlugins = require('./lib/plugins.js').default

const cli = meow(`
	Usage
      $ vinm <pipeline> <options>
      $ vinm @<task> <options>

	Options
      --stage, -s     Stage vars to use
      --port, -p      Vinm emitter port    # optional
      --force, -f     Force run all tasks  # optional
      --help, -h      Show help            # optional
      --version, -v   Current version      # optional 

	Examples
      $ vinm deploy --stage dev       # run 'deploy' pipeline
      $ vinm @api-create --stage dev  # run 'api-create' task
`, {
    flags: {
        stage: {
            type: 'string',
            alias: 's'
        },
        port: {
            type: 'string',
            alias: 'p'
        },
        force: {
            type: 'boolean',
            alias: 'f',
            default: false
        },
        help: {
            type: 'string',
            alias: 'h'
        },
        version: {
            type: 'string',
            alias: 'v'
        }
    }
})

const exec = async () => {
    require('events').EventEmitter.defaultMaxListeners = 80

    try {
        const ymlConfig = await getVinmYmlFile()
        const plugins = await loadPlugins(ymlConfig)
        const config = await plugins.hook('afterReadYmlConfig', { ymlConfig })
        const options = await getStageVars(config, cli.flags['stage'])
        const forceAll = typeof cli.flags['force'] !== 'undefined'
            ? cli.flags['force']
            : false

        options['vinm.port'] = typeof cli.flags['port'] !== 'undefined'
            ? cli.flags['port']
            : 4173

        let reportResults = []
        console.log('')

        for (const pipeline of cli.input) {
            if (pipeline.includes('@')) {
                config.pipelines[pipeline] = [{ task: pipeline.replace('@', '') }]
            }

            let tasks = await getTasks(
                config,
                pipeline,
                options,
                forceAll
            )

            logger.log('start', `${pipeline}`, `[pipeline]`)
            reportResults.push({
                pipeline: pipeline,
                tasks: await run(tasks, options)
            })
            let error = reportResults[reportResults.length - 1].tasks.filter(t => !t.success).length
            logger.log(error ? 'warn' : 'success', `${pipeline}`, `[pipeline]`)
        }

        let reportSummary = ``
        console.log('')
        logger.log('log', `\n$ Vinm CLI, report summary:`)
        reportResults.forEach(p => {
            let [passed, failed, total] = [0, 0, 0]
            p.tasks.forEach(t => {
                if (t.success) passed++
                else failed++
                total++
            })
            reportSummary += `\nPipeline [${p.pipeline}]: ${passed} passed, ${failed} failed, ${total} total`
            logger.log(failed > 0 ? 'error' : 'success', reportSummary)
        })

        process.exit()
    } catch (err) {
        logger.log('fatal', err)
        process.exit()
    }
}

if (typeof cli.flags['version'] !== 'undefined') {
    const packageJson = require('../package.json')
    logger.log('log', packageJson.version)
    process.exit()
} else if (
    cli.input.length > 0 &&
    typeof cli.flags['stage'] !== 'undefined' &&
    typeof cli.flags['help'] === 'undefined'
) {
    exec()
} else {
    logger.log('log', cli.help)
    process.exit()
}
