import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import {register} from "./controllers/auth.js";
import {createPost} from "./controllers/posts.js" 
import { verifyToken } from "./middleware/auth.js";

import {v2} from 'cloudinary';
const cloudinary = v2;

// CONFIGURATIONS //
dotenv.config();
v2.config({
        cloud_name: process.env.CLOUDINARY_API_CLOUD, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));

// MIDDLEWARE SETUP - MULTER FILE STORAGE
// const storage = multer.diskStorage({
//     destination : function(req, file, cb){
//         cb(null, "public/assets");
//     },
//     filename: function(req, file,cb){
//         cb(null, file.originalname);
//     }
// });
const storage = multer.diskStorage({});
const upload = multer({storage});

// ROUTES WITH FILES
app.post("/auth/register", upload.single("picturePath"), register);
app.post("/posts", verifyToken, upload.single("picturePath"), createPost);

// ROUTES
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts",postRoutes);

// DB CONNECTION SETUP - MONGOOSE MONGODB CONNECTION
const port = process.env.PORT;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    app.listen(port, ()=> console.log(`Server is running on port ${port}`))
}).catch((error)=> console.log(`${error} did not connect`));