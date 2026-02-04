import express from "express"
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";

const app=express()

app.use(bodyParser.json());

let mongoUrl="mongodb+srv://admin_36:1234@cluster0.rawrfc0.mongodb.net/HotelManagement?appName=Cluster0"

mongoose.connect(mongoUrl)

const connection=mongoose.connection

connection.once("open",()=>{
    console.log("MongoDB connection established successfully")

})

app.use("/api/users",userRouter);

app.listen(5000,()=>{
    console.log("Server is running on port 5000")
})