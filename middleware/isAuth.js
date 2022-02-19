const jwt = require("jsonwebtoken");
const User = require("../model/user");

const isAuth = async (req, res, next) => {
  try{
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      token: token,
    });
    if (!user) throw new Error("Login Again.");
    req.token=token
    req.user=user
    next()
  }catch(e){
    res.status(401).send({error: `Please authenticate. ${e}`})
  }
}

module.exports = isAuth