const mongoose = require('mongoose');
require('dotenv').config();
const URI = process.env.MONGO_URI;

const connectDatabase = async() => {
    try {
        await mongoose.connect(URI);
        console.log(`Poultry Feed Management Database is connected`);
    } catch (error) {
        console.log(`Error occured in connecting to database ${error.message}`);
    }
}

module.exports = connectDatabase;