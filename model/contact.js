const mongoose = require('mongoose')
const validator = require("validator")
const { ObjectId } = mongoose.Schema.Types

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "Jhon Doe"
  },
  phone: {
    type: String,
    trim: true,
    validate(value) {
      if (!validator.isMobilePhone(value)) throw new Error("Invalid Mobile Phone");
    }
  },
  address: {
    type: String,
    required: true
  },
  email: {
    type: String,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Invalid Email");
    }
  },
  owner: {
    type: ObjectId,
    ref: "User",
    required: true
  }
}, {timestamps: true})

const Contact = mongoose.model('Contact', ContactSchema)

module.exports = Contact