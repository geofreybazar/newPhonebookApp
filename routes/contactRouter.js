import express from "express";
import contactController from "../controller/contactController.js"

const contactRouter = express.Router();

contactRouter.get("/info", contactController.getContactInfo);
contactRouter.get("/", contactController.getContacts );
contactRouter.get("/:id", contactController.getContact);
contactRouter.delete("/:id", contactController.deleteContact);
contactRouter.post ("/", contactController.createContact);
contactRouter.put("/:id", contactController.updateContact);


export default contactRouter;