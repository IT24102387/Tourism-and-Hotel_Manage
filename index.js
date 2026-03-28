import express from "express"
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import jwt from "jsonwebtoken" ;
import dotenv from "dotenv";
import reviewRouter from "./routes/reviewRouter.js";
import productRouter from "./routes/ProductRouter.js";
import inquiryRouter from "./routes/inquiryRouter.js";
import cors from "cors";
import orderRouter from "./routes/orderRouter.js";
import dns from 'node:dns';
import packageRouter from "./routes/packageRouter.js";
import packageBookingRouter from "./routes/packageBookingRouter.js";
import packageVehicleRouter from "./routes/packageVehicleRouter.js";
import addonRouter from "./routes/addonRouter.js";
import router from "./routes/eventRouter.js";
import OpenAI from "openai";
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app=express()
app.use(cors());

app.use(bodyParser.json());
app.use((req,res,next)=>{

    let token=req.header
    ("Authorization")
    
    if(token != null){
        token = token.replace("Bearer ","")

        jwt.verify(token,process.env.JWT_SECRET,
            (err,decoded)=>{
                if(!err){
                    req.user=decoded;
                }
            })
    }
    next();
    

})

let mongoUrl=process.env.MONGO_URL;

mongoose.connect(mongoUrl)

const connection=mongoose.connection

connection.once("open",()=>{
    console.log("MongoDB connection established successfully")

})

app.use("/api/users",userRouter);
app.use("/api/products",productRouter);
app.use("/api/reviews",reviewRouter);
app.use("/api/inquiries",inquiryRouter);
app.use("/api/orders",orderRouter);
app.use("/api/packages", packageRouter);
app.use("/api/package-bookings", packageBookingRouter);
app.use("/api/package-vehicles", packageVehicleRouter);
app.use("/api/addons", addonRouter);
app.use("/api/events",router);



// openapi call
app.post("/api/describe", async (req, res) => {
  try {
    const { place } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a travel guide. Write engaging, tourist-friendly descriptions.",
        },
        {
          role: "user",
          content: `Write a detailed, attractive travel description about ${place} in Sri Lanka. Include history, attractions, and visitor experience.`,
        },
      ],
    });

    res.json({
      description: response.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      description: "Failed to generate description.",
    });
  }
});



app.listen(5000,()=>{
    console.log("Server is running on port 5000")
});

//customer
// "email": "kusal1@example.com",
// "password": "123",

//Admin
// "email": "kusal2@example.com",
// "password": "123",



