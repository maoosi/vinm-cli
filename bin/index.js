#!/usr/bin/env node
'use strict'

const meow = require('meow')
const inquirer = require('inquirer')
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
      --stage, -s     Stage vars to use    # optional
      --force, -f     Force run all tasks  # optional
      --help, -h      Show help            # optional
      --version, -v   Current version      # optional 

	Examples
      $ vinm deploy           # run 'deploy' pipeline
      $ vinm @api-create      # run 'api-create' task
`, {
    flags: {
        stage: {
            type: 'string',
            alias: 's',
            default: ''
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

        let selectedStage
        let allStages = Object.keys(config.stages)

        if (cli.flags['stage'].length < 1) {
            let response = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'value',
                    message: 'What stage do you want to run?',
                    choices: allStages,
                    default: allStages[0]
                }
            ])
            selectedStage = response.value
        } else {
            selectedStage = cli.flags['stage']
        }

        console.log(selectedStage)

        const options = await getStageVars(config, selectedStage)
        const forceAll = typeof cli.flags['force'] !== 'undefined'
            ? cli.flags['force']
            : false

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
            let error = reportResults[reportResults.length - 1].tasks.filter(
                t => t.report !== 'success'
            ).length
            logger.log(error ? 'warn' : 'success', `${pipeline}`, `[pipeline]`)
        }

        let reportSummary = ``
        console.log('')
        logger.log('log', `\n$ Vinm CLI, report summary:`)
        reportResults.forEach(p => {
            let [passed, aborted, failed, total] = [0, 0, 0, 0]
            p.tasks.forEach(t => {
                if (t.report === 'success') passed++
                else if (t.report === 'aborted') aborted++
                else failed++
                total++
            })
            reportSummary += `\nPipeline [${p.pipeline}]: ${passed} passed, ${aborted} aborted, ${failed} failed, ${total} total`
            logger.log(passed !== total ? 'error' : 'success', reportSummary)
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
    typeof cli.flags['help'] === 'undefined'
) {
    exec()
} else {
    logger.log('log', cli.help)
    process.exit()
}
