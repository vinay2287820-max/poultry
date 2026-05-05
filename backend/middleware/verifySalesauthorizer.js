const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

const verifySalesauthorizer = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = req.cookies.salesAuthorizerToken || (authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(" ")[1]
    : null);

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    // Optional: enforce role
    if (decoded.role !== 'SalesAuthorizer') {
      return res.status(403).json({ success: false, message: "Access denied. SalesAuthorizers only." });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (err) {
    const message = err.name === "TokenExpiredError" ? "Token has expired." : "Invalid token.";
    return res.status(401).json({ success: false, message });
  }
};

module.exports = { verifySalesauthorizer };
