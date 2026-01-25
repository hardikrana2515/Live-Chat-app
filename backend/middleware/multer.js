import multer from "multer"
import path from "path"

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, "./public/Image")
        } else if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/') || (file.mimetype == ('application/pdf'))) {
            cb(null, "./public/media")
        } else {
            cb(null, "./public/media")
        }
    },
    filename: function (req, file, cb) {
        // Preserve original extensions (e.g. image.png.enc) so frontend can detect type
        cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, '_'));
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }
})

export default upload