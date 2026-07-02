import {v2 as cloudinary} from "cloudinary"
import fs from "fs"



import {v2 as cloudinary} from 'cloudinary';
import { response } from "express";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async(localFilePath) => {
    try{
        if(!localFilePath)return null
        cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        console.log("file is uploaded on cloudinary",response.url);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath)//remove the locallly saved temporaray file as the upload operation 
    }
}
