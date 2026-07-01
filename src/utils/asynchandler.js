const asyncHandler = (requesthandler)=>{
    (req,res,next)=>{
        Promise.resolve().catch
    }
}






export {asyncHandler}

const asyncHandler = (fn)=>async(req,res,next)=>{
    try{

    }
    catch(error){
        res.status(err.code || 500).json({
            Success: false,
            message: err.message
        })
    }
}

}