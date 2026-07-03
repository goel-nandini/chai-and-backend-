import { asyncHandler } from "../utils/asynchandler";

const registerUser = asyncHandler(async(req,res)=>{
    res.status(200).json({
        message:"chai and backendpo"
    })
})

export{registerUser}