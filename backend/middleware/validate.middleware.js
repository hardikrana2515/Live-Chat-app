import { validationResult } from "express-validator";
import { ApiResponse } from "../utils/Apiresponse.js";

// express-validator rules were registered on the routes but their result was
// never checked, so they ran as dead code. This middleware turns them into
// real request validation. (Issue 1.4)
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const message = errors
    .array()
    .map((e) => e.msg)
    .join(", ");
  return res.status(400).json(new ApiResponse(400, null, message));
};

export { validate };
