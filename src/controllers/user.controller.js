import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId)
        const accesstoken = user.generateAccessAndRefreshToken()
       const  refreshToken = user.generateRefreshToken()

       user.refreshToken = refreshToken
       user.save({validateBeforeSave: false})

       return {accesstoken,refreshToken}
    }
    catch(error){
        throw new ApiError(500,"something went wronf while generating refresh and access token")

    }
}
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
    const existeduser =  await User.findOne({
        $or:[{username},{email}]
    })
    if(existeduser){
        throw new ApiError(409,"user with email or user name already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    

    
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

    if(!avatar){
        throw new ApiError(400,"avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

    const createuser = await User.findById(user._id).select("-password -refreshToken")

    if(!createuser){
        throw new ApiError(500,"user not created")
    }

    return res.status(201).json(
        new ApiResponse(200,createuser,"user created successfully")
    )



})
const loginUser = asyncHandler(async(req,res)=>{
    //req body -> data 
    //username or email
    // find the user
    //password check
    //access and refresh token
    // send cookie 

    const {email,username,password} = req.body

    if(!username || !email){
        throw new ApiError(400,"username or email is required")

    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"user does not exist")

    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(404,"invalid user credentials")

    }
    const {accesstoken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    

})
export{registerUser};