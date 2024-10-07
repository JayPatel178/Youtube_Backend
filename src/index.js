import dotenv from "dotenv";
dotenv.config({path : " ./env"})
import connectDb from "./db/db.js";
import { app } from "./app.js";

connectDb()
.then(()=>{
    
    /* app.on("Error",(err)=>{
        console.log("Error", err);
        throw err;
    })*/

    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running successfully on port no : ${process.env.port}`);
    })
})
.catch((err) => {
    console.log("Database connection fail!!!" , err);
})