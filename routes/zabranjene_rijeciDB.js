const mongoose = require('mongoose');

const zabranjene_rijeciSchema = new mongoose.Schema({
    rijec: String,


});
const zabranjene_rijeci = mongoose.model('zabranjene_rijeci', zabranjene_rijeciSchema);






module.exports = mongoose.model('zabranjene_rijeci', zabranjene_rijeciSchema);





