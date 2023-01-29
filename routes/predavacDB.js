const mongoose = require('mongoose');

const predavacSchema = new mongoose.Schema({
    name: String,
    surname: String,
    password: String
});





module.exports = mongoose.model('predavac', predavacSchema);





