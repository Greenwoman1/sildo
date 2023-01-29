const mongoose = require('mongoose');

const pitanjaSchema = new mongoose.Schema({
    p_kod: String,
    tekst: String,
    odgovor: { type: String, default: ''},
    lajk: { type: Number, default: 0},
    sakriveno: {type: Boolean, default: false}


});

const pitanja = mongoose.model('pitanja', pitanjaSchema);



var p = new pitanja({
    p_kod: 'matem',
    tekst: 'kako ovo radi',
    odgovor: 'ne'

})

pitanja.findOne({ p_kod: 'matem'}, (error, pit) => {
    if (error) {
        console.log(error);
    } else if (pit) {
        console.log('mama already exists');
    } else {
        p.save((error) => {

            if (error) {
                console.log(error);
            } else {
                console.log('p saved successfully');

            }
        });
    }
});






module.exports = mongoose.model('pitanja', pitanjaSchema);





