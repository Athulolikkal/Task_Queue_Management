import { addTasks, getAllTasks, getConfigDetails, updateActiveStatus, updateConfigQuery } from "../db/query.js";
import { toCompleteAllTasks } from "../utils/queue-management-main.js";

const taskController = {

    addTask: async (req, res) => {
        try {
            const { type, payload, retryConfig } = req?.body
            // if details are present
            if (type && payload && retryConfig) {
                const addTask = await addTasks(type, payload, retryConfig)
                if (addTask && addTask[0]?.id) {
                    return res.status(201).json({ message: "task added" })
                }
                return res.status(500).json({ message: 'faild to add the values' })
            }
            return res.status(409).json({ message: 'expected values are missing' })
        } catch (err) {
            console.log(err, 'error is this');
            return res.status(500).json({ message: 'Something went wrong...' })
        }
    },
    updateConfig: async (req, res) => {
        try {
            const { maxConcurrentTasks, isolationLevel } = req?.body
            if (maxConcurrentTasks && isolationLevel) {
                //updating config
                const parsedConcurrentTaskNumber = parseInt(maxConcurrentTasks)
                const isUpdateConfig = await updateConfigQuery(1, parsedConcurrentTaskNumber, isolationLevel)
                if (isUpdateConfig) {
                    return res.status(200).json({ message: "updated successfully" })
                }
                return res.status(401).json({ message: "updation failed" })
            }
            return res.status(409).json({ message: 'expected values are missing' })
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Something went wrong...' })
        }
    },
    executeTask: async (req, res) => {
        try {
            //finding config details
            const getConfigResult = await getConfigDetails()
            if (getConfigResult && getConfigResult.length > 0) {
                const configDetails = getConfigResult[0]
                //fetching all the active tasks
                const allTasks = await getAllTasks()
                if (allTasks && allTasks.length > 0) {
                    const taskQueue = allTasks;
                    await updateActiveStatus()
                    await toCompleteAllTasks(taskQueue, configDetails?.max_concurrent_tasks)
                    return res.status(200).json({ message: 'completed' })
                } else {
                    // no more tasks left
                    return res.status(404).json({ message: 'All tasks are completed please add more tasks' })
                }
            }
            return res.status(500).json({ message: 'Something went wrong...' })

            //changing the status of tasks
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Something went wrong...' })
        }
    }
}
export default taskController;