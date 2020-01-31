const flattenDeep = require('lodash.flattendeep')
const vinmVars = require('./vars.js').default

const getTasks = (tasks, config, options, forceAll) => {
    let runTasks = []

    tasks.forEach((task) => {

        // this is a task
        if (typeof task.task !== 'undefined') {
            if (typeof config.tasks[task.task] === 'undefined') {
                throw(`Task "${task.task}" not found.`)
            } else {
                let isActive = typeof task.active === 'undefined' || task.active
                let isConditionMet = typeof task.condition === 'undefined' || eval( vinmVars(task.condition, options) )

                if ((isActive || forceAll) && isConditionMet) {
                    runTasks.push( Object.assign({}, config.tasks[task.task], { name: task.task }) )
                }
            }
        }

        // this is a pipeline
        else if (typeof task.pipeline !== 'undefined') {
            if (typeof config.pipelines[task.pipeline] === 'undefined') {
                throw(`Pipeline "${task.pipeline}" not found.`)
            } else {
                let isActive = typeof task.active === 'undefined' || task.active
                let isConditionMet = typeof task.condition === 'undefined' || eval( vinmVars(task.condition, options) )

                if ((isActive || forceAll) && isConditionMet) {
                    let pipelineTasks = getTasks(
                        config.pipelines[task.pipeline], config, options, forceAll
                    )
                    runTasks = runTasks.concat(pipelineTasks)
                }
            }
        }

        // this is nothing
        else {
            throw(`Pipeline with no "task" or "pipeline" parameters.`)
        }

    })

    return runTasks
}

exports.default = (config, pipeline, options, forceAll = false) => {
    return new Promise(async (resolve, reject) => {
        if (typeof config.pipelines[pipeline] !== 'undefined') {
            try {
                let tasks = flattenDeep( 
                    getTasks(config.pipelines[pipeline], config, options, forceAll)
                )
                resolve(tasks)
            } catch (err) {
                reject(err)
            }
        } else {
            reject(`Pipeline "${pipeline}" not found.`)
        }
    })
}
