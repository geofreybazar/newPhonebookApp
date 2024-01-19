import express from "express";
import userController from "../controller/userController.js";

const userRouter = express.Router();

userRouter.get("/", userController.getUsers);
userRouter.get("/:id/", userController.getUser);
userRouter.post("/", userController.createUser);
userRouter.post("/login", userController.loginUser);
userRouter.put("/:id/", userController.addPhoto);

export default userRouter;