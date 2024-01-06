import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: 2,
        required: true,
    },
    lastName: {
        type: String,
        minLength: 2,
        required: true,
    },
    address:{
        type: String,
        minLength: 10,
        required: true,
    },
    emailAdd:{
        type: String,
        minLength: 10,
        required: true,
    },
    number: {
        type: String,
        minLength: 11,
        maxLength: 11,
        required: true,
    },
    favorite: Boolean,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    photoInfo: {
        url: String,
        filename: String,
      },
});


contactSchema.set("toJSON", {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
})

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;