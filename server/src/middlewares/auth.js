const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    console.log("USER ID:", req.cookies);
    const token = req.cookies.token;


    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    req.user = { _id: decoded.userId };
    console.log("USER ID:", req.user._id);
    console.log("Auth Middleware Passed");
    next();
  } catch (error) 
  {
    console.log("Auth Middleware Error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
