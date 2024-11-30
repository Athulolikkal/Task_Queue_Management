import taskController from "../controllers/taskController.js";
export default function taskRouter(router) {
    router.route('/add-task').post(taskController.addTask)
    router.route('/exceute').get(taskController.executeTask)
    return router;
}