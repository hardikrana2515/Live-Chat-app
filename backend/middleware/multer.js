import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/Apierror.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const imageDir = path.join(__dirname, "..", "public", "Image");
export const mediaDir = path.join(__dirname, "..", "public", "media");

if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });

// Block dangerous executable, script, and web-active formats (Audit C2 Stored XSS defense)
const BLOCKED_EXTENSIONS = new Set([
  '.html', '.htm', '.xhtml', '.svg', '.xml', '.shtml',
  '.js', '.mjs', '.cjs', '.ts', '.jsx', '.tsx',
  '.php', '.phtml', '.php3', '.php4', '.php5', '.phps',
  '.exe', '.dll', '.so', '.dylib', '.bat', '.cmd', '.sh', '.bash', '.vbs', '.ps1',
  '.jar', '.war', '.ear', '.apk', '.scr', '.msi', '.com', '.pif',
  '.asp', '.aspx', '.jsp', '.jspx', '.cgi', '.pl', '.py', '.rb'
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const ALLOWED_MEDIA_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.webm',
  '.mp4', '.mov', '.mkv',
  '.pdf', '.txt', '.csv', '.docx', '.xlsx', '.pptx', '.zip',
  '.enc', '.bin'
]);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Avatars and group icons go to imageDir; all chat message media goes to private mediaDir
    if (file.fieldname === 'avtar' || file.fieldname === 'groupIcon') {
      cb(null, imageDir);
    } else {
      cb(null, mediaDir);
    }
  },
  filename: function (req, file, cb) {
    // Sanitize extension and generate random unique filename (prevents path traversal / double-ext attacks)
    const rawExt = path.extname(file.originalname || '').toLowerCase();
    const safeExt = rawExt.replace(/[^a-z0-9.]/g, '');
    const randomHex = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${randomHex}${safeExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  const originalName = file.originalname || '';
  const ext = path.extname(originalName).toLowerCase();

  // 1. Check for blocked dangerous extensions or null bytes
  if (!ext || BLOCKED_EXTENSIONS.has(ext) || originalName.includes('\0')) {
    return cb(new ApiError(400, `File type '${ext || "unknown"}' is forbidden for security reasons.`), false);
  }

  // 2. Avatar / Group icon allowlist
  if (file.fieldname === 'avtar' || file.fieldname === 'groupIcon') {
    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext) || !ALLOWED_IMAGE_MIMES.has(file.mimetype.toLowerCase())) {
      return cb(new ApiError(400, "Only JPEG, PNG, WebP, and GIF images are allowed for avatars and group icons."), false);
    }
    return cb(null, true);
  }

  // 3. Message attachment allowlist
  if (!ALLOWED_MEDIA_EXTENSIONS.has(ext)) {
    return cb(new ApiError(400, `Unsupported file format '${ext}'. Allowed formats: images, audio, video, PDF, documents, and encrypted attachments.`), false);
  }

  cb(null, true);
};

export const verifyMagicBytes = (filePath, fieldname) => {
  if (!fs.existsSync(filePath)) return false;
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(16);
    const bytesRead = fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    if (bytesRead < 4) return false;

    // JPEG: FF D8 FF
    const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    // GIF: GIF87a or GIF89a
    const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
    // WebP: RIFF ... WEBP
    const isWebp = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
                   buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

    const isImage = isJpeg || isPng || isGif || isWebp;

    if (fieldname === 'avtar' || fieldname === 'groupIcon') {
      return isImage;
    }

    // PDF: %PDF-
    const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
    // ZIP / Office Open XML (DOCX, XLSX, PPTX): PK\x03\x04
    const isZip = buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
    // OGG
    const isOgg = buffer[0] === 0x4F && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53;
    // MP3
    const isMp3 = (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) || (buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0);
    // MP4: ftyp
    const isMp4 = buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70;
    // Encrypted Talkyy attachment
    const headerStr = buffer.toString('utf8', 0, bytesRead);
    const isEncrypted = headerStr.startsWith("E2EE::") || filePath.endsWith(".enc") || filePath.endsWith(".bin");

    return isImage || isPdf || isZip || isOgg || isMp3 || isMp4 || isEncrypted || filePath.endsWith(".txt") || filePath.endsWith(".csv");
  } catch {
    return false;
  }
};

// Middleware to perform post-upload magic-byte validation and clean up invalid files
export const validateFileMagicBytes = (req, res, next) => {
  if (!req.file) return next();

  const isValid = verifyMagicBytes(req.file.path, req.file.fieldname);
  if (!isValid) {
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch { /* ignore */ }
    return next(new ApiError(400, "File content validation failed: header signature does not match claimed format."));
  }
  next();
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 220 * 1024 * 1024 } // 220 MB allows 150 MB raw files + encryption overhead
});

export default upload;