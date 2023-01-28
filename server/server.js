import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();  // to use the .env variables

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);  // creating an instance of openai

const app = express();   // initializing our express app
app.use(cors());   
app.use(express.json()); // allow us to pass json from frontend to backend

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello from Conversant',
    });
});

app.post('/', async (req, res) => {
    try{
        const prompt = req.body.prompt;

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0,   // higher temperature value means the model will take more risk
            max_tokens: 3000,   // maximum no.s of token to generate in a completion
            top_p: 1,
            frequency_penalty: 0.5, // means that it's not going to repeat similar sentences often, higher this means lower possibility of repitition
            presence_penalty: 0,
        });
        
        res.status(200).send({
            bot: response.data.choices[0].text
        });

    }catch(error){
        console.log(error);
        res.status(500).send({ error });
    }
});

app.listen(5000, () => { // listen() binds itself with the specified host and port to bind and listen for any connections
    console.log('Server is running on http://localhost:5000');
});