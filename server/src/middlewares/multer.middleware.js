import multer from "multer"
import path from "path"
import fs from "fs"

const tempDir = "./public/temp"

if(!fs.existsSync(tempDir)){
    fs.mkdirSync(tempDir, {recursive: true})
}

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, tempDir)
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",

        "video/mp4",
        "video/mpeg",
        "video/quicktime",

        "application/pdf",
        "application/zip",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]

    if(allowedTypes.includes(file.mimetype)){
        cb(null, true)
    }
    else{
        cb(new Error("Unsupported file type"), false)
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 50 * 1024 * 1024}
})