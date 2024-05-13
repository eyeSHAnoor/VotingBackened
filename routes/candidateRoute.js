const express = require('express')
const router = express.Router(); 
const Candidate = require('./../models/candidate')
const User = require('./../models/user')
// const passport = require('../auth')
const {jwtAuthMiddleware , generateToken} = require ('../jwt')


// These facilities are only provided to Admin
const checkRole = async (userId) => {
  try {
    // console.log(userId);
    const user = await User.findOne({ _id: userId }); // Assuming `_id` is the field name for user IDs
    // console.log(user);
    if (!user) {
      console.log("User not found");
      return false;
    }
    if (user.role === "admin") {
      return true;
    } else {
      console.log("User is not an admin");
      return false;
    }
  } catch (err) {
    console.log("Error finding user:", err);
    return false;
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////

router.post('/',jwtAuthMiddleware, async(req,res)=>{
  
    try{
      
      const id = req.userid;
      // console.log(id)
      if(!(await checkRole(id))) {
        return res.status(403).json({error: "this facility is only for admin"}); //there can be error
      }

      const data = req.body
      const newCandidate = new Candidate(data)
      const savedCandidate = await newCandidate.save()
      
      res.status(200).json({response:savedCandidate})
    }
    catch(err){
      console.log("error here is ",err)
      res.status(500).json({error : 'internal error'})  // Http request status comes in different ranges (100-200)(200-300)...etc
    }
  })

  //////////////////////////////////////////////////////////////////////////////////////////////////

  router.get('/' , async(req,res)=>{
    try{
      const candidate = await Candidate.find();
      if(!candidate){
        res.status(404).json({error: "Invalid candidates"});
      }

      res.status(200).json(candidate);
    }catch(err){
      console.log("error here is ",err)
      res.status(500).json({error : 'internal error'}) 
    }
  })



   //////////////////////////////////////////////////////////////////////////////////////////////////

  router.put('/:candidateId',jwtAuthMiddleware, async(req , res)=>{
    try{
      const id = req.userid;
      // console.log(id)
      if(!(await checkRole(id))) {
        return res.status(403).json({error: "this facility is only for admin"}); //there can be error
      }

      const candidateId = req.params.candidateId;
      const updateData = req.body;
      const newCandidate = await Candidate.findByIdAndUpdate(candidateId , updateData , {
        new: true,
        runValidators : true
      })
      if(!newCandidate) return res.status(401).json({error: "Unauthorized"});

      console.log("candidate data updated");
      res.status(200).json(newCandidate);
    }catch(err){

      console.log(err);
      res.status(500).json({error : "internal server error"});
    }
  } )


  //////////////////////////////////////////////////////////////////////////////////////


  router.delete('/:candidateId',jwtAuthMiddleware, async(req , res)=>{
    try{
      const id = req.userid;
      // console.log(id)
      if(!(await checkRole(id))) {
        return res.status(403).json({error: "this facility is only for admin"}); //there can be error
      }

      const candidateId = req.params.candidateId;
     
      const response = await Candidate.findByIdAndDelete(candidateId )

      if(!response){
        res.status(404).json({error: "invalid response"})
    }

      console.log("candidate data deleted");
      res.status(200).json({message: "candidate deleted"});
    }catch(err){

      console.log(err);
      res.status(500).json({error : "internal server error"});
    }
  } )

  /////////////////////////////////////////////////////////////////////////////////////////

  //___________________________________ START VOTING_____________________________________//

  router.post('/:candidateId' ,jwtAuthMiddleware, async (req, res)=>{
    const candId = req.params.candidateId;
    const userId = req.userid;
    
    try{

      const candidate = await Candidate.findById(candId);
      const user = await User.findById(userId);
     

      if(!candidate){
        return res.status(404).json({error: "Invalid user"});
      }

      if(!user){
        return res.status(404).json({error: "Invalid user"});
      }

      if(user.isVoted){
        return res.status(404).json({error: "You have already voted"});
      }

      if (user.role === "admin"){
        return res.status(404).json({error: "Admin can't vote"});
      }

      candidate.votes.push({user : userId});
      candidate.voteCount++;
      await candidate.save();

      user.isVoted = true;
      await user.save();

      res.status(200).json({message : " vote recorded Successfully"})

    }catch(err){
      console.log(err);
      res.status(500).json({error : "internal server error"});
    }
  })

  //_______________________________________voteCount____________________________________________

  router.get('/vote/count', async(req,res)=>{
    try{

      const candidate = await Candidate.find().sort({voteCount : 'desc'});

      const voteRecord = candidate.map((data)=>{
        return{
          party : data.party,
          voteCount : data.voteCount
        }
      })

      res.status(200).json(voteRecord)

    }catch(err){
      console.log(err);
      res.status(500).json({error : "internal server error"});
    }
  })
  
  

  module.exports = router;