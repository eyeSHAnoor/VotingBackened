const mongoose = require('mongoose');

// Corrected MongoDB URI with the correct port number
const mongoURI = "mongodb://localhost:27017/vote";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

const db=mongoose.connection
module.exports = db;
