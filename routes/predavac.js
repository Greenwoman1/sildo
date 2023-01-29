var express = require('express');
var router = express.Router();


const predavac = require('./predavacDB');
const pitanja = require("./pitanjaDB");
const predavanje = require("./predavanjeDB");
const {signedCookies} = require("cookie-parser");
const zabranjene_rijeci = require("./zabranjene_rijeciDB");
var nodemailer = require('nodemailer');

const multer = require('multer');
const bodyParser = require('body-parser');
const session = require("express-session");

/* GET home page. */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg');
  }
});
const upload = multer({ storage: storage });



router.use(session({
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000 // 1 minute
  }
}));


router.post('/zakazi_predavanje', upload.single('pozadina'), async function (req, res) {
  // kreiraj novo pitanje sa tekstom iz forme

  let filename = req.file.filename;
  const generateRandomString = (myLength) => {
    const chars =
        "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
    const randomArray = Array.from(
        {length: myLength},
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );

    const randomString = randomArray.join("");
    return randomString;
  };
  let randkod = generateRandomString(10);
  console.log(randkod)
  var ima = true
  while (ima) {

    await predavanje.findOne({kod: randkod}).then(p => {
      if(!p){
        ima = false
        console.log("imaaaa")
      }
      else {

        randkod =generateRandomString(10);
      }
    })
  }



  var predavanjee = new predavanje({
    kod: randkod,
    ime: req.body.naziv,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    predavac_id : req.cookies.id_predavaca,
    pozadina: filename


  });
  console.log(predavanjee.predavac_id+'lllllllll')
  predavanjee.save((error)=>{
    if(error){
      console.log(error)
    }
    else{
      res.redirect('/predavac')

    }
  })


});
var io = null;

router.get('/:kod',  async function (req, res){
  console.log(io)
  if(!io){
  io = require('socket.io')(req.connection.server);


  io.sockets.on('connection', function (client){
    pitanja.find({p_kod: req.params.kod, predavac_id: req.cookies.id_predavaca}, (error, pitanje)=>{
    if (error) {
      console.log(error);
    }
    else if (pitanje){
      client.emit('pitanja', pitanje );
    }
    })
    //
    // client.on('postavljanje_pitanja_predavac', function (d) {
    //
    //   console.log(d)
    //   io.emit('postavljeno_pitanje_predavac', d);
    // });
    client.on('odgovor_pitanja', function(data){
      var i = data.idd;
      var o = data.o;
      console.log(o);
      pitanja.findByIdAndUpdate(i, {odgovor: o},{new: true}, (error, doc) => {
        if (error) {

          console.log(`Error updating document: ${error.message}`);
        } else if (doc) {
          console.log(doc.odgovor)
          io.sockets.emit('odgovori_na_pitanje', doc);
          console.log("hehehehe")
        }

      })



    });

    // client.on('lajkanje_pitanja', function(id){
    //   console.log("dosao da lajkam")
    //   console.log(id)
    //   pitanja.findByIdAndUpdate(id, {lajk: lajk+1}, {new : true}, (doc)=>{
    //     if(doc){
    //       console.log(doc)
    //       io.emit('prikazi_lajk', doc);
    //     }
    //
    //   })
    //
    // });

    client.on('pitanjaaaa', function (p){
      console.log("usao u server");
      io.emit('pitanja', p);

    })
    client.on('posalji_email', async function (niz_emailova){
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sarahegic1@gmail.com',
          pass: 'iijsgsbytrmloiho'
        }
      });
      var mailOptions = {
        from: 'sarahegic1@gmail.com',
        to: niz_emailova,
        subject: 'Sending Email using Node.js',
        html: '<h1>Dobro došli</h1><p>Pristupite predavanju koristeći kod: '+ req.params.kod+'</p>'
      };
      await transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });


    })

  })



  }
  res.cookie('kod', req.params.kod)
  res.render('predavanje', {title: 'predavanje', kod: req.params.kod});
});


router.post('/:kod/izbrisi_pitanje/:id', async function (req,res){
  console.log(req.params.id)
  console.log(req.params.kod)
  try {
    pitanja.findByIdAndRemove(req.params.id)
        .then(() => {
          pitanja.find({p_kod: req.params.kod}).then( pita => {
            res.redirect('/predavac/'+req.params.kod);
              });
        })
        .catch(error => {
          console.log(`Error deleting user by ID: ${error.message}`);
        });


  } catch (error) {
    res.status(500).json({ message: error.message });
  }

});
router.post('/sakrij_pitanje/:id', async function (req,res){
  console.log(req.params.id)
  try {
    pitanja.findByIdAndUpdate(req.params.id, { sakriveno: true }, (error, doc) => {
      if (error) {

        console.log(`Error updating document: ${error.message}`);
      } else {
        console.log(`Original document: ${doc}`);

      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

});

router.post('/otkrij_pitanje/:id', async function (req,res){
  console.log(req.params.id)
  try {
    pitanja.findByIdAndUpdate(req.params.id, { sakriveno: false} , {new : true}, (error, doc) => {
      if (error) {

        console.log(`Error updating document: ${error.message}`);
      } else {
        res.redirect("/predavac/"+req.cookies.kod)
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

});












module.exports = router;
