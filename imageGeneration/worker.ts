import { parentPort, workerData } from "node:worker_threads"
import { HfInference } from "@huggingface/inference";
import { joinImages } from "join-images"

const [prompt, negative_prompt, token] = workerData as string[]

const ai = new HfInference(token, {
    use_cache: false,
    use_gpu: true
});

(async () => {
    const images: Promise<Blob>[] = []

    for(let i = 0; i < 3; i++) {
        images.push(
            ai.textToImage({
                parameters: {
                    negative_prompt: negative_prompt,
                    width: 800,
                    height: 1000,
                },
                model: "dreamlike-art/dreamlike-anime-1.0",
                inputs: prompt,
            })
        )
    }

    const allImageBlob = await Promise.all(images)

    const allImageArrayBuffer = (await Promise.all(allImageBlob)).map(val => val.arrayBuffer())

    const allImages = (await Promise.all(allImageArrayBuffer)).map(val => Buffer.from(val))

    const sharp = await joinImages(allImages, {
        direction: "horizontal",
    })
    
    const buff = await sharp.toFormat("png").toBuffer()

    parentPort!.postMessage(buff)
})()