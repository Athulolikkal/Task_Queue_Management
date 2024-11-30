import express ,{Router} from 'express'
import cors from 'cors'
import morgan from 'morgan';
import helmet from 'helmet';
import routes from './routes/index.js'
import { connectToDb } from './db/config.js';

const app = express();
const router = Router();
app.use(express.json());
app.use(cors());
app.use(helmet())
app.use(morgan('dev'))
app.use(express.urlencoded({extended:true}))
routes(app,router)

let taskQueue = [
    { type: "email", payload: { mailId: "tuttuz@gmail.com" }, retryConfig: { retryCount: 2 } },
    { type: "email", payload: { mailId: "athul@gmail.com" }, retryConfig: { retryCount: 3 } },
    { type: "report", payload: { mailId: "athul@gmail.com" }, retryConfig: { retryCount: 3 } },
    { type: "email", payload: { mailId: "athul@gmail.com" }, retryConfig: { retryCount: 2 } },
];

let activeTasks = 0;
let maxConcurrentTasks = 3;



//main logic function
async function scheduleTasks() {
    while (activeTasks < maxConcurrentTasks && taskQueue.length > 0) {
        const task = taskQueue.shift();
        activeTasks++;
        processTaskWithRetry(task).then(() => {
            activeTasks--;
            scheduleTasks();
        }).catch((err) => {
            console.error(`Error processing task: ${err.message}`);
            activeTasks--;
            scheduleTasks();
        })
    }
}

//commetting the task and retring if it fail
async function processTaskWithRetry(task) {
    const { retryCount } = task?.retryConfig || { retryCount: 1 }
    let attemptLeft = retryCount;

    const processTask = async () => {
        //reducing the number of attempt
        attemptLeft--
        try {
            //invoking the process
            await process(task)
            console.log(`Task ${task.type} completed successfully.`);
        } catch (err) {
            console.error(`Task ${task.type} failed: ${err.message}`);
            // in case error happen then
            if (attemptLeft > 0) {
                console.log(`Retrying task ${task.type}, attempts left: ${attemptLeft}`);
                await processTask()
            } else {
                throw new Error(`Task ${task.type} failed after ${retryCount} retries.`);
            }
        }

    };
    return processTask()
}

//handling the task
async function process(task) {
    console.log(`Processing task: ${task.type}`);
    return new Promise((resolve,reject) => {
        if (task.type === 'email') {
            setTimeout(() => {
                console.log(`Task completed: ${task.type}`);
                resolve();
            }, Math.random() * 2000);
        } else {
            setTimeout(() => {
                console.log(`Task failed: ${task.type}`);
                reject(new Error(`Failed to process task: ${task.type}`));
            }, Math.random() * 2000);
        }

    });
}

// scheduleTasks()

app.listen(3000, () => {
    console.log('Task Queue Manager running on port 3000');
});

connectToDb();