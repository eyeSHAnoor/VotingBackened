const mongoose = require('mongoose');
 const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age:{
        type : Number
    },
    email:{
        type: String
    },
    mobile:{
        type: String
    },
    IdCardNumber:{
        type: Number,
        required: true,
        unique: true
    },
    address:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted:{
        type: Boolean,
        default: false
    }
});

userSchema.pre('save' , async function (next){
    const user = this;
    if(!user.isModified('password')){
        return next();
    } 
        

    try{

        const salt = await bcrypt.genSalt(10);
        const hashPwd = await bcrypt.hash(user.password , salt);
        user.password = hashPwd;
        next();

    }catch(err){
        next(err);
    }
})

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Ensure both candidate password and hashed password are available
        if (!candidatePassword || !this.password) {
            throw new Error('Both candidate password and hashed password are required');
        }
        
        // Compare passwords
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (err) {
        console.log("Error comparing passwords:", err);
        throw err; // Re-throw the error for the calling function to handle
    }
};



const User = mongoose.model('User', userSchema); // Create model of schema

module.exports = User;