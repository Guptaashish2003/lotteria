import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import app from './app';
import { connectDatabase } from './config/dbConnect';

// connect database
process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception occured! Shutting down....');
    process.exit(1);
})
//  connect to Database 
connectDatabase()

// running the server
const server = app.listen(process.env.PORT, () => {
    console.log(`server has started... on PORT ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
})

process.on('unhandledRejection', (err) => {
    console.log('Unhandled rejection occured! Shutting down...');

    server.close(() => {
        process.exit(1);
    })
})