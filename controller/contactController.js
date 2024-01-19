import { Query } from "mongoose";
import Contact from "../models/Contact.js";
import User from "../models/User.js"
import jwt from "jsonwebtoken";
import getTokenFrom from "../utils/getTokenFrom.js";
import config from "../utils/config.js";
import uploadFile from "../utils/uploadFile.js";
import { deleteObject, ref } from "firebase/storage";
import storage from "../utils/firebaseConfig.js";

async function getContactInfo (_req,res,next) {
    
    try{
        const contacts = await Contact.find({});
        const totalNumber = contacts.length;
        return res.send(`<p> Contacts app have ${totalNumber} contacts</p>`)
    } catch (error){
        next(error);
    }
   
};

async function getFavorites(req,res,next) {
    try {
        const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
    
        const contacts = await Contact.find({ userId: decodedToken.id, favorite: true}).populate(
          "userId",
          {
            username: 1,
            name: 1,
          }
        );
        return res.json(contacts);
      } catch (error) {
        next(error);
      }
}

async function getContacts(req, res, next) {
    try {
      const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
  
      const contacts = await Contact.find({ userId: decodedToken.id}).populate(
        "userId",
        {
          username: 1,
          name: 1,
        }
      );
      return res.json(contacts);
    } catch (error) {
      next(error);
    }
  }

async function getContact (req,res, next) {
    const id = req.params.id;

    try {
        const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
        
        if (!decodedToken.id) {
          return res.status(401).json({ error: "token invalid" });
        }
        
        const contact = await Contact.findById(id);
        if (!contact) return res.status(404).json({message: "Contact not Found!"});             
        return res.json(contact);              
    } catch (error) {
        next(error);
    }
};

async function deleteContact(req, res, next) {
    const id = req.params.id;
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
  
    try {
      const user = await User.findById(decodedToken.id);
      const contact = await Contact.findByIdAndDelete(id);
  
      // Delete photo from Firebase Storage
      const photoRef = ref(storage, contact.photoInfo.filename);
      await deleteObject(photoRef);
  
      user.contacts = user.contacts.filter(
        (contactId) => contactId.toString() !== contact._id.toString()
      );
      await user.save();
  
      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

async function createContact (req,res,next) {
    const body = req.body; 
    const file = req.file;  

    try{
    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
    
    if (!decodedToken.id) {
        return res.status(401).json ({ error: "token invalid"});
    } 

    if (!file) {
        return res.status(400).json({ error: "Upload Profile Picture" });
    }

    const photoInfo = await uploadFile(file);

    const user = await User.findById(decodedToken.id);

    const errors = {
        firstName: "Enter First Name",
        lastName: "Enter Last Name",
        address: "Enter Address",
        emailAdd: "Enter a valid email address",
        number: "Enter a valid mobile number",
    };
    
    for (const [field, errorMessage] of Object.entries(errors)) {
        if (
            (!body[field] ||
                (field === "emailAdd" && !isValidEmail(body.emailAdd)) ||
                (field === "number" && body.number.length !== 11))
        ) {
            return res.status(400).json({ error: errorMessage });
        }
    }
        
        const contact = new Contact ({
            firstName: body.firstName,
            lastName: body.lastName,
            address: body.address,
            emailAdd: body.emailAdd,
            number: body.number,
            favorite: body.favorite || false,
            userId: user.id,
            photoInfo,
        });
    
        const saveContact = await contact.save().then((result) => result);
        user.contacts = user.contacts.concat(saveContact._id);
        await user.save();
    
        res.status(201).json(contact);
    }catch(error){
        next(error);
    }
   
};


async function updateContact (req,res,next) {
  const id = req.params.id;
  const body = req.body;   
  const file = req.file;  
  console.log(body);

  try{
      const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
      if (!decodedToken.id) {
        return res.status(401).json({ error: "token invalid" });
      }
      
      if (file) {
        
        const photoRef = ref(storage, body.photoInfo);
        await deleteObject(photoRef);

        const photoInfo = await uploadFile(file)
        const updatedContact = {
          firstName: body.firstName,
          lastName: body.lastName,
          address: body.address,
          emailAdd: body.emailAdd,
          number: body.number,
          favorite: body.favorite,
          photoInfo,
        };      

        const returnedContact = await Contact.findByIdAndUpdate(id, updatedContact, { 
            new: true,
            runValidators: true,
            context: "query",
        });        
        if(!returnedContact){
            res.status(404).send({error: "Contact not found!"})
        };
        res.status(200).json(returnedContact);
        } else {
          const updatedContact = {
          firstName: body.firstName,
          lastName: body.lastName,
          address: body.address,
          emailAdd: body.emailAdd,
          number: body.number,
          favorite: body.favorite,
          photoInfo: body.photoInfo,
        }
          const returnedContact = await Contact.findByIdAndUpdate(id, updatedContact, { 
          new: true,
          runValidators: true,
          context: "query",
        });
    
        if(!returnedContact){ 
            res.status(404).send({error: "Contact not found!"})
        }
        res.status(200).json(returnedContact);
        
        }}catch(error){
           next(error);
      };   
}

async function toggleFavorite (req,res,next) {
    const id = req.params.id;
    const {firstName,lastName,address,emailAdd, number, favorite} = req.body;
   
    try{

        const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);

        if (!decodedToken.id) {
          return res.status(401).json({ error: "token invalid" });
        }


        const updatedContact = {
            firstName,
            lastName,
            address,
            emailAdd,
            number,
            favorite,
        };
            const returnedContact = await Contact.findByIdAndUpdate(id, updatedContact, { 
                new: true,
                runValidators: true,
                context: "query",
            });

            if(!returnedContact){
                res.status(404).send({error: "Contact not found!"})
            }

            res.status(200).json(returnedContact);
    }catch(error){
    next(error);
    };   
}

function isValidEmail(email) {
    // Use a simple regex to check for a basic email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export default {
    getContactInfo,
    getContacts,
    getContact,
    deleteContact,
    createContact,
    toggleFavorite,
    getFavorites,
    updateContact,
}