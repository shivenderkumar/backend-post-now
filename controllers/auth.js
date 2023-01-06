import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import cloudinary from 'cloudinary';
const {UploadApiResponse,v2 } = cloudinary;

// REGISTER USER
export const register = async (req, res) => {
    try {
        if(!req.file){
            return res.status(400).json({
                status: "failed",
                message : "please select file"
            })
        }

        const {
            firstName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation
        } = req.body;

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        let uploadedFile = UploadApiResponse;
        uploadedFile = await v2.uploader.upload(req.file.path, {
            folder: "postnow",
            resource_type: "auto"
        });

        console.log("email: ",email);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: passwordHash,
            picturePath: uploadedFile.url,
            friends: [],
            location,
            occupation,
            viewedProfile: Math.floor(Math.random() * 1000),
            impressions: Math.floor(Math.random() * 1000)
        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);

    } catch (err) {
        res.status(500).json({ error: err });
    }
};

// LOGGIN IN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).json({ msg: "User does not exist." });

        const isMath = await bcrypt.compare(password, user.password);
        if (!isMath) return res.status(400).json({ msg: "Invalid Credentials." });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
        delete user.password;
        res.status(200).json({ token, user });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

