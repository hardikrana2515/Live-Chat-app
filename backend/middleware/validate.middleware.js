import { validationResult } from "express-validator";
import { ApiResponse } from "../utils/Apiresponse.js";

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
