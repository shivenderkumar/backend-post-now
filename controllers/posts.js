import Post from "../models/Posts.js";
import User from "../models/User.js";

import cloudinary from 'cloudinary';
const {UploadApiResponse,v2 } = cloudinary;

// CREATE
export const createPost = async (req, res)=>{
    try {
        if(!req.file){
            return res.status(400).json({
                status: "failed",
                message : "please select file"
            })
        }
        const { userId, description, picturePath} = req.body;
        const user = await User.findById(userId);

        let uploadedFile = UploadApiResponse;
        uploadedFile = await v2.uploader.upload(req.file.path, {
            folder: "post-now",
            resource_type: "auto"
        });

        const newPost = new Post({
            userId,
            firstName: user.firstName,
            lastName: user.lastName,
            location: user.location,
            description,
            userPicturePath: user.picturePath,
            picturePath: uploadedFile.url,
            likes: {},
            comments: []
        });
        await newPost.save();

        const post = await Post.find();
        res.status(201).json(post);
    } catch (err) {
        res.status(409).json({ msg: err.message});
    }
}

// READ
export const getFeedPosts = async (req, res)=>{
    try {
        const post = await Post.find();
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ msg: err.message});
    }
}

export const getUserposts = async (req, res)=>{
    try {
        const {userId} = req.params;
        const post = await Post.find({ userId});
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ msg: err.message});
    }
}

// UPDATE
export const likePost = async (req, res)=>{
    try {
        const {id} = req.params;
        const {userId} = req.body;
        const post = await Post.findById(id);
        const isLiked = post.likes.get(userId);

        if(isLiked){
            post.likes.delete(userId);
        }else{
            post.likes.set(userId, true);
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { likes: post.likes},
            {new: true}
        );
        
        res.status(200).json(updatedPost);
    } catch (err) {
        res.status(404).json({ msg: err.message});
    }
}

// 201 > success creating something
// 200 > success getting something
// 404 > not found
// 409 > not able to create