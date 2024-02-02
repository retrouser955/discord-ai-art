import { Worker } from "node:worker_threads"

export function generateViaWorker(prompt: string, negative_prompt: string) {
    return new Promise<Buffer>((resolve, reject) => {
        const worker = new Worker(`${process.cwd()}/imageGeneration/worker.js`, {
            workerData: [prompt, negative_prompt, process.env.HF_TOKEN as string]
        })
        
        worker.on("message", resolve)

        worker.on("error", (err) => {
            worker.terminate()
            
            reject(err)
        })
    })
}