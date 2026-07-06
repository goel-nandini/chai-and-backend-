import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User, user} from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {cloudinary} from 
const registerUser = asyncHandler(async(req,res)=>{
    // get user details from frontned
    // validation
    // check if user already exists:username or email unique
    //check for images , check for avatar 
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    // remove password and refresh token from response
    //check for user creation
    // return response 


    const {fullName,email,username,password}=req.body
    console.log("email", email);
    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")

    ){
        throw new ApiError(400, "all fields are required")
    }
    const existeduser = User.findOne({
        $or:[{username},{email}]
    })
    if(existeduser){
        throw new ApiError(409,"user with email or user name already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    req.files?.coverImage[0]?.
    path;
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImage)

    if(!avatar){
        throw new ApiError(400,"avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowercase()

    })

    const createuser = await User.findById(user._id).select("-password -refreshToken")

    if(!createuser){
        throw new ApiError(500,"user not created")
    }

    return res.status(201).json(
        new ApiResponse(200,createuser,"user created successfully")
    )



})

export{registerUser};