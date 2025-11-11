import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (!tokenDecode?.id) {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }

    req.userId = tokenDecode.id; // ✅ userId attach to request
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
