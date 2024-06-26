const jwt = require("jsonwebtoken");
const User = require("../../models/user");

module.exports = {
  create,
  login,
  checkToken,
  getUser,
};

async function create(req, res) {
  try {
    // Add the user to the database
    const user = await User.create(req.body);
    // token will be a string
    const token = createJWT(user);
    // Yes, we can use res.json to send back just a string
    // The client code needs to take this into consideration
    res.json(token);
  } catch (err) {
    // Client will check for non-2xx status code
    // 400 = Bad Request
    res.status(400).json(err);
  }
}

async function login(req, res) {
  try {
    const user = await User.findOne({email: req.body.email});
    if (!user) throw new Error();
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) throw new Error();
    const token = createJWT(user);
    res.json(token);
  } catch (err) {
    res.status(400).json('Bad Credentials');
  }
}

async function getUser(req, res) {
  try{
    const user = await User.findOne({email: req.params.id});
    if (!user) throw new Error();
    if (user.role === 'customer') {
      const customer = await Customer.findOne({user: user._id});
      res.json({user, customer});
    } else if (user.role === 'vendor') {
      const customer = await Customer.findOne({user: user._id});
      const vendor = await Vendor.findOne({user: user._id});
      res.json({user, customer, vendor});
    }
  } catch (err) {
    res.status(400).json('Profile not found');
  }
}

function checkToken(req, res) {
  // req.user will always be there for you when a token is sent
  console.log('req.user', req.user);
  res.json(req.exp);
}

function createJWT(user) {
  return jwt.sign(
    // data payload
    { user },
    process.env.SECRET,
    { expiresIn: "24h" }
  );
}
