const mongoose = require('mongoose');

const reelschema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    videoUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      trim: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true, 
    },
    like:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
      }
    ]
},{timestamps:true});

module.exports=mongoose.model('Reel',reelschema);
