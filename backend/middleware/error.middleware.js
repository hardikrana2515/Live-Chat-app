import { ApiError } from "../utils/Apierror.js";

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statuscode).json({
            success: false,
            message: err.message,
            errors: err.errors
        });
    }

    // Default error
    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

export { errorHandler };
