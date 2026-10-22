import { ApiError } from "../utils/Apierror.js";

const errorHandler = (err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "File exceeds the 150MB upload limit."
        });
    }

    if (err instanceof ApiError) {
        return res.status(err.statuscode).json({
            success: false,
            message: err.message,
            errors: err.errors
        });
    }

    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

export { errorHandler };
