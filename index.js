require('dotenv').config();
const OpenAI = require("openai");
const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());
const port = 3000;
const openai = new OpenAI({ apiKey: process.env.CHAT_GPT_KEY });
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.post('/chat-gpt', async (req, res) => {
    const messages = req.body;
    
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-3.5-turbo",
    });

    res.send(completion.choices[0].message.content);
});

app.post('/gigachat', async (req, res) => {
    const messages = req.body;

    const getAuthRes = await fetch("https://ngw.devices.sberbank.ru:9443/api/v2/oauth",{
        method: "POST",
        headers: {
            'Authorization': `Basic ${process.env.GIGA_CHAT_KEY}`,
            'RqUID': crypto.randomUUID(),
            'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: [
            `${encodeURIComponent("scope")}=${encodeURIComponent("GIGACHAT_API_PERS")}`
        ]
            
    });

    let json = await getAuthRes.json();
    let token = json.access_token;

    const getCompletionsRes = await fetch("https://gigachat.devices.sberbank.ru/api/v1/chat/completions",{
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "model": "GigaChat:latest",
            "messages": messages,
            "temperature": 0.7
        })
            
    });

    let jsonData = await getCompletionsRes.json();

    res.send(jsonData.choices[0].message.content);
});

app.listen(port, () => {});