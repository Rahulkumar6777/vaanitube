// import express
import express from "express";


// import security-realted middleware 
import helmet from "helmet";
import hpp from "hpp";



// import dotenv
import { configDotenv } from "dotenv";



// use dotenv
configDotenv();



// import database path
import { dbConnect} from './src/Configs/DbConnect.js'


// Connection with database
await dbConnect();

// import other 
import cors from "cors";
import { corsOptions } from "./src/Utils/CorsUtils.js";


// create express app
const app = express();


// use security-related middleware
app.use(helmet());
app.use(hpp());


//  other middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors(corsOptions));





export default app;







