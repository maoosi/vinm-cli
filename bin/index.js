#!/usr/bin/env node
'use strict'

const meow = require('meow')
const logger = require('./lib/logger.js')
const getVinmYmlFile = require('./lib/yml.js').default
const getStageVars = require('./lib/options.js').default
const getTasks = require('./lib/tasks.js').default
const run = require('./lib/runner.js').default

const cli = meow(`
	Usage
      $ vinm <pipeline> <options>
      $ vinm @<task> <options>

	Options
      --stage, -s  Stage vars to use
      --port, -p   Vinm emitter port   # optional
      --force, -f  Force run inactive  # optional
      --help, -h   Show help           # optional

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
		}
	}
})

const exec = async () => {
    require('events').EventEmitter.defaultMaxListeners = 80

    try {
        const config = await getVinmYmlFile()
        const options = await getStageVars(config, cli.flags['stage'])
        const forceAll = typeof cli.flags['force'] !== 'undefined'
            ? cli.flags['force']
            : false

        options['vinm.port'] = typeof cli.flags['port'] !== 'undefined'
            ? cli.flags['port']
            : 4173

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
            await run(tasks, options)
            logger.log('success', `${pipeline}`, `[pipeline]`)
        }

        process.exit()
    } catch (err) {
        logger.log('fatal', err)
        process.exit()
    }
}

if (
    cli.input.length > 0 &&
    typeof cli.flags['stage'] !== 'undefined' &&
    typeof cli.flags['help'] === 'undefined'
) {
    exec()
} else {
    logger.log('log', cli.help)
    process.exit()
}
