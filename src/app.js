import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "16kb"})) // configration of json data access
app.use(express.urlencoded({extended : true, limit :"16kb"})) //configration for url
app.use(express.static("public")) // configration for 
app.use(cookieParser()) //configration for cookies -> browser and server manage or send and recive cookies 

// import routes
import userRouter from './routes/user.router.js'

// routes decleratrion
// -> we use middleware because our router is in seprate file 

app.use("/api/v1/users", userRouter)

export {app};