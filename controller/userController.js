import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../utils/config.js";
import uploadFile from "../utils/uploadFile.js";
import getTokenFrom from "../utils/getTokenFrom.js";
import { deleteObject, ref } from "firebase/storage";
import storage from "../utils/firebaseConfig.js";

async function getUsers(req, res) {
  const users = await User.find({}).populate("contacts", {
    firstName: 1,
    lastName: 1,
    address: 1,
    emailAdd: 1,
    number: 1,
    favorite: 1,
  });
  return res.json(users);
}

async function getUser (req,res, next) {
  const id = req.params.id;

  try {
      const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
      
      if (!decodedToken.id) {
        return res.status(401).json({ error: "token invalid" });
      }
      
      const user = await User.findById(id);
      if (!user) return res.status(404).json({message: "user not Found!"});             
      return res.json(user);              
  } catch (error) {
      next(error);
  }
};


async function createUser(req, res, next) {
  const body = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
    photoInfo2: {
      url: "https://lh3.googleusercontent.com/u/0/drive-viewer/AEYmBYSoNQ0OxnX7i17NTPiEA4aPILdeOPJrJFKG78C9lYDnoj5btSzk8M4_L49Ap_XivQ2xVaEy2GQuX3NuZEIFQ3nIlWIH=w1920-h912",
      filename: "Untitled design (3).png",
    }
  });
 
  try {
    const savedUser = await user.save();

    return res.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
}

async function loginUser(req, res, next) {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
    photoInfo2: user.photoInfo2,
  };

  const token = jwt.sign(userForToken, config.JWT_SECRET, {
    expiresIn: 60 * 60,
  });

  return res
    .status(200)
    .json({ token, username: user.username, name: user.name, photoInfo2: user.photoInfo2, id:user.id});
}

// async function addPhoto(req, res, next) {
//   const id = req.params.id;
//   const body = req.body;
//   const file = req.file;

//   try {
//     const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
//     if (!decodedToken.id) {
//       return res.status(401).json({ error: "token invalid" });
//     }

//     if (body.photoInfo2 !== "Untitled design (3).png"){
//       const photoRef = ref(storage, body.photoInfo2);
//         await deleteObject(photoRef);
//         const photoInfo2 = await uploadFile(file);
//         const updatedUserPic = {
//           photoInfo2: photoInfo2,
//         };
    
//         const returnedContact = await User.findByIdAndUpdate(id, updatedUserPic, {
//           new: true,
//           context: "query",
//         });
    
//         if (!returnedContact) {
//           return res.status(404).json({ error: "Contact not found!" });
//         };
//     }else{

//     const photoInfo2 = await uploadFile(file);
//     const updatedUserPic = {
//       photoInfo2: photoInfo2,
//     };

//     const returnedContact = await User.findByIdAndUpdate(id, updatedUserPic, {
//       new: true,
//       context: "query",
//     });

//     if (!returnedContact) {
//       return res.status(404).json({ error: "Contact not found!" });
//     };

//     return res.status(200).json(returnedContact);
//   }} catch (error) {
//     next(error);
//   };
// };

async function addPhoto(req, res, next) {
  try {
    const id = req.params.id;
    const body = req.body;
    const file = req.file;

    const decodedToken = jwt.verify(getTokenFrom(req), config.JWT_SECRET);
    if (!decodedToken.id) {
      return res.status(401).json({ error: "token invalid" });
    }

    const photoInfo2 = await uploadFile(file);

    if (body.photoInfo2 !== "Untitled design (3).png") {
      const photoRef = ref(storage, body.photoInfo2);
      await deleteObject(photoRef);
    }

    const updatedUserPic = { photoInfo2 };

    const returnedContact = await User.findByIdAndUpdate(id, updatedUserPic, {
      new: true,
      context: "query",
    });

    if (!returnedContact) {
      return res.status(404).json({ error: "Contact not found!" });
    }

    return res.status(200).json(returnedContact);
  } catch (error) {
    next(error);
  }
}


export default {
  createUser,
  getUsers,
  loginUser,
  addPhoto,
  getUser,
};
