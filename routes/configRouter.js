import taskController from "../controllers/taskController.js";

export default function configRouter(router) {
    router.route('/').post(taskController.updateConfig)
    return router
}