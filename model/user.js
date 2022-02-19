const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const validator = require("validator")

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,    
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Invalid Email");
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true
  },
  token: {
    type: String,
    unique: true
  }
})

// populating virtual => populte Contact's owner feild
UserSchema.virtual("contacts", {
  ref: "Contact",
  localField: "_id",
  foreignField: "owner",
});

// instance method to generate auth token for each user
UserSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECRET);
  // sadd token to user 
  user.token=token 
  // save user to db
  await user.save()
  return token
}

// static method to find user
UserSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Unable to login. Incorrect Email")
  // compare entered password with saved password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Unable to login. Incorrect Password");
  return user;
}

// Hash the plain text password before saving
UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model('User', UserSchema)

module.exports = User