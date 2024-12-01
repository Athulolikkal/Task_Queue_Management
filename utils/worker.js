import { parentPort } from 'worker_threads';

parentPort.on('message', (task) => {
    console.log(`Worker processing task: ${task.type}`);
    process(task)
        .then(() => {
            parentPort.postMessage({ success: true, task });
        })
        .catch((error) => {
            console.log(error,'error came');
            parentPort.postMessage({ success: false, task, error: error.message });
        });
});

async function process(task) {
    return new Promise((resolve, reject) => {
        if (task.type === 'email') {
            setTimeout(() => {
                console.log(`Email sent to: ${task.payload.id}`);
                resolve();
            }, Math.random() * 2000);
        } else {
            setTimeout(() => {
                reject(new Error(`Unknown task type: ${task.type}`));
            }, Math.random() * 2000);
        }
    });
}
