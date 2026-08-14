const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Don't send password around in req.user
    delete user.password;
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied for this role" });
    }
    next();
  };
}

module.exports = { protect, authorize };