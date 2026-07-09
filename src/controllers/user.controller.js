import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh token"
        );
    }
};
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

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const coverImage = coverImageLocalPath
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

    if(!username || email){
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
    const {accesstoken,refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options={
         httpOnly:true,
         secure: true
    }
    return res.status(200).cookie("accessToken",accesstoken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user: loggedInUser,accessToken,
                refreshToken

            },
            "user logged in successfully"
        )
    )


})

const logoutUser = asyncHandler(async(req,res)=>{
  User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken : 1
        }
    },{
        new: true
    }
  )
  const options={
    httpOnly:true,
    secure: true
}

return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"user logged out"))
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword , newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"invalid old password ")
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body
    if(!fullName || !email){
        throw new ApiError(400,"all the fields are required")
    }

    User.findByIdAndUpdate(
        req.user?._id,
        {
          $set :{
            fullName,
            email:email
          }  
        },
        {new : true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,user,"account details updated successfully"))
})

const updateuserAvatar = asyncHandler(async(req,res)=>
{
     const avatarLocalPath = req.files?.path
     if(!avatarLocalPath){
        throw new ApiError(400,"aavatr file is missing")

     }
     const avatar = await uploadOnCloudinary
     (avatarLocalPath)
     if(!avatar.url){
        throw new ApiError(400,"error while uploading the avatar")
     }
     await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {
            new: truue
        }
     ).select("-password")

     return res.status(200)
         .json(
            new ApiResponse(200,user,"avatar updated successfully")
         )
})  
const updateuserCoverImage = asyncHandler(async(req,res)=>
    {
         const coverImageLocalPath = req.files?.path
         if(!coverImageLocalPath){
            throw new ApiError(400,"cover image file is missing")
    
         }
         const coverImage = await uploadOnCloudinary
         (coverImageLocalPath)
         if(!coverImage.url){
            throw new ApiError(400,"error while uploading the cover image")
         }
         await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    avatar: coverImage.url
                }
            },
            {
                new: truue
            }
         ).select("-password")

         return res.status(200)
         .json(
            new ApiResponse(200,user,"cover image updated successfully")
         )
    }) 

    const getUserChannelProfile = asyncHandler(async(req,res)=>{
        const {username} = req.params

        if(!username ?.trim()){
            throw new ApiError(400,"username is missing")
        }

        const channel = await User.aggregate([
            {
                $match:{
                    username:username?.toLowerCase()
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as : "subscribers"
                }
            },
            {
                $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as : "subscribedTo"
                }
            },{
                $addFields:{
                    subscribersCount:{
                        $size:"$subscribers"
                    },
                    channelsSubscrubedToCount:{
                        $size:"$subscribedTo"
                    },
                    isSubscribed:{
                        $cond:{
                            if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                            then:true,
                            else: false
                        }
                    }
                }
            },{
                $project:{
                    fullName:1,
                    username:1,
                    subscribersCount:1,
                    channelsSubscrubedToCount:1,
                    isSubscribed:1,
                    avatar:1,
                    coverImage:1,
                }
            }
        ])
   
    if(!channel?.length){
        throw new ApiError(404,"channel does not exixts")

    }

    return res.status(200)
    .json(
        new ApiResponse(200,channel[0],"fetched successfully")
    )
})


export{ registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateuserAvatar,
    updateuserCoverImage,
    getUserChannelProfile
    
};