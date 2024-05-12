import express, { Request, Response } from 'express';
import { SimpleCircle } from 'shared';


const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    const circle:SimpleCircle = {
        type:"CIRCLE",
        p1:0,
        id:'10'
    }
    res.json(circle);
  });
  

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
  