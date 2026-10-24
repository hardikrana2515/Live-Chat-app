import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { AsyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/Apierror.js";

const Auth = AsyncHandler(async (req, res, next) => {
  const auth_token = req.cookies?.token || req.header("authorization");

  if (!auth_token) {
    res.status(401);
    throw new ApiError(401, "Unauthorized: Authentication token required");
  }

  try {
    const cleanToken = auth_token.startsWith("Bearer ")
      ? auth_token.slice(7).trim()
      : auth_token.trim();

    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    
    // Select user while excluding password hash and sensitive reset fields (Audit H2)
    const user = await User.findById(decoded._id).select("-password -resetPasswordToken -resetPasswordExpire");
    if (!user) {
      throw new ApiError(401, "User not valid for this route");
    }

    // Verify token version / session revocation (Audit H1)
    if (
      decoded.tokenVersion !== undefined &&
      user.tokenVersion !== undefined &&
      decoded.tokenVersion !== user.tokenVersion
    ) {
      throw new ApiError(401, "Session has been revoked or expired. Please login again.");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, "Invalid or expired authentication token");
  }
});

export { Auth };