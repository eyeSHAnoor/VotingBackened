const express = require('express')
const router = express.Router(); 
const User = require('./../models/user')
// const passport = require('../auth')
const {jwtAuthMiddleware , generateToken} = require ('../jwt');
const { Await } = require('react-router-dom');

// router.use(passport.initialize())
// const localAuth = passport.authenticate('local', {session: false})

///////////////////////////////////////////////////////////////////////

// This is used when u create new entry from start and create entirly new token for it

router.post('/signup', async(req,res)=>{
  
    try{
      const existingAdmin = await User.findOne({role : "admin"});
      if(existingAdmin){
        return res.status(403).json({error: "an admin is already registered"})
      }
      
      const data = req.body
      const newUser = new User(data)
      const savedUser = await newUser.save()
      console.log('User saved')
      
            const payload = {
              id : savedUser.id,
              username : savedUser.name
            }
            const token = generateToken(payload);

      res.status(200).json({response:savedUser , token:token})
    }
    catch(err){
      console.log("error here is ",err)
      res.status(500).json({error : 'internal error'})  // Http request status comes in different ranges (100-200)(200-300)...etc
    }
  })

///////////////////////////////////////////////////////////////////////
   
   router.get('/profile', jwtAuthMiddleware , async (req,res)=>{
    try{
      const userData = req.userid
      // const userId = userData.id
      const user = await User.findById(userData)
      console.log('data displayed')
        res.status(200).json(user)
    }
    catch(err){
      console.log('internal server error')
      res.status(500).json({error : 'internal error'})
    }
  })
  ///////////////////////////////////////////////////////////////////////


  // This is used when we already have account in database ... we need to extract token just by using username and password
  router.post('/login' , async (req,res)=>{
    try{

      //extract username or password from body
      const {IdCardNumber , password} = req.body;
      //find the user from database
      const user = await User.findOne({IdCardNumber : IdCardNumber});

      //now compare the password
      if(!user || !(await user.comparePassword(password))){
        return res.status(401).json({error: "Invalid username or password"});
      }

      //generate token

      const payload= {
        id : user._id
      }

      const token = generateToken(payload);

      res.status(200).json({token});
    }catch(err){
      console.log('internal server error' , err)
      res.status(500).json({error : 'internal error'})
    }
  })

  ///////////////////////////////////////////////////////////////////////

  
  router.put('/profile/password', jwtAuthMiddleware, async(req,res)=>{
    try{
        const userId = req.user;  //extract id from token
        const {newPassword , currentPassword} = req.body;

        const user = await User.findById(userId);

        console.log('data displayed')
        if ( !(await user.comparePassword(currentPassword))){
                    return res.status(401).json({error: "unauthorized"});
        }

        user.password = newPassword ; 
        await user.save();

  
        console.log('data displayed')
            res.status(200).json({message: "password updated"})
        

    }catch(err){
        console.log('internal server error', err)
        res.status(500).json({error : 'internal error'})
    }
    


  })





  module.exports= router;
