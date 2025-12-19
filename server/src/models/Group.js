const mongoose=require("mongoose");

const Grpschema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
},{timestamps:true});

const Group=mongoose.model('Group',Grpschema);

module.exports=Group;