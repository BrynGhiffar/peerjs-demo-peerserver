import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send("Hello World, my name is Bryn");
    next();
});

app.listen(port, () => {
    console.log(`[server]: Server is running at https://localhost:${port}`);
});