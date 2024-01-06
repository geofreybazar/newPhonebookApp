import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../utils/config.js";

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

async function createUser(req, res, next) {
  const { username, name, password } = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
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
  };

  const token = jwt.sign(userForToken, config.JWT_SECRET, {
    expiresIn: 60 * 60,
  });

  return res
    .status(200)
    .json({ token, username: user.username, name: user.name });
}

export default {
  createUser,
  getUsers,
  loginUser,
};
