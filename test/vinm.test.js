// dependencies
const path = require('path')

// functions to test
const getTasks = require('../bin/lib/tasks.js').default
const getVinmYmlFile = require('../bin/lib/yml.js').default

// store process
const realProcess = process

// read vinm file
var config = false
beforeEach(async (done) => {
    jest.resetModules()
    process = { ...realProcess, cwd: () => path.join(realProcess.cwd(), '/test/')}
    config = await getVinmYmlFile()
    done()
})

afterEach(() => {
    process = realProcess
})

// tasks
describe('Tasks', () => {

    test('Only active tasks should be executed', async () => {
        let tasks = await getTasks(config, 'test', {}, false)
        expect(tasks.length).toBe(3)
    })

    test('All tasks should be executed with --force', async () => {
        let tasks = await getTasks(config, 'test', {}, true)
        expect(tasks.length).toBe(4)
    })

})