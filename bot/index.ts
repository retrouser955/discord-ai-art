import express from "express"
import { InteractionResponseType, APIInteraction, InteractionType, Routes } from "discord-api-types/v10"
import { REST } from "@discordjs/rest"
import { verifyKeyMiddleware } from "discord-interactions"
import { generateViaWorker } from "../imageGeneration/generate"
import "dotenv"

// DEFINE REST
const rest = new REST({
    version: "10"
}).setToken(process.env.TOKEN as string)

const app = express()

app.use(verifyKeyMiddleware(process.env.PUBLIC_KEY as string))

app.post("/interactions", async (req, res) => {
    const body = req.body as APIInteraction
    const { type } = body

    if(type === InteractionType.Ping) {
        return res.json({
            type: InteractionResponseType.Pong
        })
    }
    
    res.json({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
            content: "<a:loading_color:1089371793468432384> **The AI is working its magic! Please wait**"
        }
    })

    const [prompt, nprompt] = req.body.data.options as [any, any|void]

    const b64 = await generateViaWorker(prompt.value, nprompt?.value ?? "blurry, artist name, bad image")

    rest.patch(Routes.webhookMessage(process.env.APP_ID as string, body.token, "@original"), {
        body: {
            content: "Generated Images!",
            attchments: [
                {
                    id: 0,
                    name: "generation.png"
                }
            ]
        },
        files: [
            {
                data: b64,
                name: "generation.png",
                contentType: "image/png"
            }
        ]
    })
})

app.listen(process.env.PORT || 3000, () => console.log("Listening for api calls"))