import express from "express";
import morgan from "morgan";
import cors from "cors";
import contactRouter from "./routes/contactRouter.js";
import unknownEndpoint from "./middlewares/unknownEndpoint.js"
import connectToDB from "./utils/connectToDB.js";
import errorHandler from "./middlewares/errorHandler.js";
import config from "./utils/config.js";
import userRouter from "./routes/userRouter.js";
import upload from "./utils/multer.js";

const MONGODB_URL = config.MONGODB_URL;
const app = express();

connectToDB(MONGODB_URL);

morgan.token("body", function (req,res){
    return JSON.stringify(req.body)
});

app.use(cors());
app.use(morgan(":method :url :status :body"));
app.use(express.json());
app.use(express.static("dist"));

app.use("/users", upload.single("image"), userRouter);
app.use("/contacts", upload.single("image"),contactRouter);

app.use(unknownEndpoint);
app.use(errorHandler)

export default app;