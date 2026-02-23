import mongoose from "mongoose";

const userSchema=new mongoose.Schema({

    email:{
        type : String,
        required : true,
        unique : true
    },
    password:{
        type: String,
        required : true,
    },
    role :{
        type: String,
        required : true,
        default :"customer"
    },
    firstName : {
        type: String,
        required : true,

    },
    lastName : {
        type: String,
        required : true,

    },
    address : {
        type: String,
        required : true,

    },
    phone : {
       type : String,
       required : true,

    },
    profilePicture : {
        type : String,
        required : true,
        default : "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-female-user-profile-vector-illustration-isolated-background-women-profile-sign-business-concept_157943-38866.jpg"
    }
    

});
const User=mongoose.model("User",userSchema);

export default User;
