import { Worker } from 'worker_threads';
import path from 'path';


export const toCompleteAllTasks = (taskQueue, maxConcurrentTasks) => {
    let activeTasks = 0;
    const maxWorkers = 5;

    async function scheduleTasks() {
        while (activeTasks < maxConcurrentTasks && taskQueue.length > 0) {
            const task = taskQueue.shift();
            activeTasks++;
            processTaskWithRetry(task)
                .then(() => {
                    console.log(`Task ${task.type} completed successfully.`);
                })
                .catch((err) => {
                    console.error(`Task ${task.type} failed after retries:`, err.message);
                })
                .finally(() => {
                    activeTasks--;
                    if (taskQueue.length === 0 && activeTasks === 0) {
                        return true
                    } else {
                        scheduleTasks();
                    }
                });
        }


        // Scale worker pool if queue depth increases
        if (taskQueue.length > maxWorkers) {
            maxConcurrentTasks = Math.min(maxWorkers, maxConcurrentTasks + 1);
        }
        return true;
    }

    async function processTaskWithRetry(task) {
        const retryLimit = task.retry_config?.retryCount || 1;
        let attemptsLeft = retryLimit;
        let completed = false;

        return new Promise((resolve, reject) => {
            const runTask = () => {
                console.log(`Processing task: ${task.type}, attempts left: ${attemptsLeft}`);
                const worker = new Worker("./utils/worker.js");
                worker.postMessage(task);
                worker.on('message', (result) => {
                    if (result.success) {
                        console.log(`Task ${task.type} completed successfully.`);
                        completed = true
                        resolve();
                    } else {
                        if (attemptsLeft > 1) {
                            attemptsLeft--;
                            console.log(`Retrying task ${task.type}, attempts left: ${attemptsLeft}`);
                            runTask();
                        } else {
                            console.error(`Task ${task.type} failed after ${retryLimit} retries.`);
                            reject(new Error(result.error));
                        }
                    }
                    worker.terminate();
                });

                worker.on('error', (error) => {
                    console.error(`Worker error: ${error.message}`);
                    reject(error);
                });

                worker.on('exit', (code) => {
                    if (code !== 0 && attemptsLeft <= 0) {
                        const errorMessage = `Worker stopped with exit code ${code}`;
                        console.error(`Worker stopped with exit code ${code}`);
                        reject(new Error(errorMessage));
                    } else if (code !== 0 && !completed) {
                        console.log(`Worker stopped with exit code ${code}, but retrying task...`);
                        attemptsLeft--;
                        runTask()
                    }
                });

            };

            runTask();
        });
    }

    scheduleTasks();
}