

import express from 'express';
import lotteryRoutes from './routes/lotteryRoutes';
import cors from 'cors';
const app = express();

app.use(express.json());
app.use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    })
  );

app.use("/api/lottery", lotteryRoutes);



export default app;