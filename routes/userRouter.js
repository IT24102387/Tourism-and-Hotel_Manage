import express from "express";
import { getUsers, loginUser, registerUser } from "../controllers/userController.js";

const userRouter=express.Router()

userRouter.post("/",registerUser)
userRouter.post("/login",loginUser)
userRouter.get("",getUsers)

export default userRouter;