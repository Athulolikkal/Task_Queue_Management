import taskRouter from "./taskRoutes.js";
import configRouter from "./configRouter.js";


export default function routes(app, router) {
    app.use('/api/v1', router);
    router.use('/task', taskRouter(router))
    router.use('/configure',configRouter(router))
}