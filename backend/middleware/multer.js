import multer from "multer"
import path from "path"
import fs from "fs"

const imageDir = path.join(path.resolve(), "public", "Image");
const mediaDir = path.join(path.resolve(), "public", "media");

if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, imageDir);
        } else {
            cb(null, mediaDir);
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