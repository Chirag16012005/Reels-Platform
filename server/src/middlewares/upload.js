const multer=require("multer");
const {CloudinaryStorage}=require("multer-storage-cloudinary");

const cloudinary=require("../../config/cloudinary");

const storage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:"reels_app",
        allowed_formats:["jpg","png","mp4","jpeg"],
        resource_type:"video",
        format: async()=>"mp4",
    },
});

const upload=multer({
    storage:storage,
    limits:{
        filesize:50*1024*1024,
    }
});

module.exports=upload;