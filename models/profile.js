const mongoose = require("mongoose")

const Profile = new mongoose.Schema({
    bio: String,    
    location: String,
    image: String,    
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" 
    }
})


module.exports =  mongoose.model('Profile', Profile)