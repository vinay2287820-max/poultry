const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = req.cookies.adminToken || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(" ")[1] : null);

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    if (decoded.role !== 'Admin') {
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    const message = err.name === "TokenExpiredError" ? "Token has expired." : "Invalid or expired token.";
    return res.status(401).json({ success: false, message });
  }
};

module.exports = { verifyAdmin };
