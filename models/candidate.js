const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

const CandidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    party:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },

    // This vote is generally has all voters id (reference from the user) and vote timing.

    votes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            votedAt:{
                type: Date,
                default: Date.now()
            }
        }
    ],
    voteCount:{
        type: Number,
        default: 0
    }
});

const Candidate = mongoose.model('Candidate', CandidateSchema); // Create model of schema

module.exports = Candidate;