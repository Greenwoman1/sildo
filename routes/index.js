var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const mongoose = require('mongoose');
const predavac = require("./predavacDB");
const predavanje = require("./predavanjeDB");
const ban = require("./banDB");

const saltRounds = 10;

const bodyParser = require('body-parser');
const {signedCookies} = require("cookie-parser");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(session({
  secret: 'kljuc',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000 // 1 minute
  }
}))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/gost', function(req, res, next) {
  res.render('gost', { title: 'gost' });
});

router.get('/admin', function (req, res){
  console.log("dosao u admina")
  res.render('loginAdmin', {title: 'admin'});

})

router.get('/predavac', function(req, res, next) {
  console.log(req.cookies.ime_predavaca + req.cookies.id_predavaca +"cccccccc")
  predavanje.find({predavac_id: req.cookies.id_predavaca})
      .then(pred => {
        res.render("predavac", {title: 'predavac',
          predavanja: pred, ime: req.cookies.ime_predavaca, id: req.cookies.id_predavaca,
        })

      });
});

router.get('/registracija', function(req, res, next) {
  console.log("dosao ovde");
  res.render('registracija', { title: 'Predavac' });
});

router.post('/registracija', async (req, res) => {
  try{
    const hashedPassword = await bcrypt.hash(req.body.sifra, saltRounds);
    var data = {
      "name": req.body.ime,
      "surname":req.body.prezime,
      "password": hashedPassword

    }
    console.log(data);
    const newpredavac = new predavac(data);
    predavac.findOne({name: req.body.ime, surname: req.body.prezime}, (error, predavac) => {
      if (error) {
        console.log(error);
      } else if (predavac) {
        bcrypt.compare(req.body.sifra, predavac.password, function(err, resS) {
          if (res) {
            // Lozinka je ispravna
            res.redirect('/login');
          } else {
            // Lozinka nije ispravna
            res.redirect('/registracija');
          }
        });

      } else {
        newpredavac.save((error) => {

          if (error) {
            console.log(error);
          } else {
            console.log('Predavac saved successfully');
            res.redirect("/login");

          }
        });
      }
    });
  }
  catch {
    res.redirect("/index/registracija");

  }
});



router.get('/login', function(req, res, next) {
  console.log("dosao ovde");
  res.render('login', { title: 'login'});
});

function addDays (days, date ) {
  date.setDate(date.getDate() + days)

  return date
}


router.post('/login', async (req, res) => {
  try{
    const hashedPassword = await bcrypt.hash(req.body.sifra, 10);
    var data = {
      "name": req.body.ime,
      "surname":req.body.prezime,
      "password": hashedPassword

    }



    predavac.findOne({name: req.body.ime, surname: req.body.prezime}, (error, predavac) => {
      if (error) {
        console.log(error);
      } else if (predavac) {
        ban.findOne({id_predavaca : predavac._id }).then(p => {


          if ( p && new Date() < addDays(30,p.pocetak)){
            res.redirect("/");
          }
          else {
            req.session.predavacSessija ={
              ime: req.body.ime,
              prezime: req.body.prezime,
              id: predavac._id.toString()

            }
            bcrypt.compare(req.body.sifra, predavac.password, function(err, resS) {
              if (resS) {
                // Lozinka je ispravna
                res.cookie('ime_predavaca', req.body.ime)
                console.log(req.cookies.imee)
                res.cookie('id_predavaca', predavac._id.toString())
                res.redirect("/predavac");
              } else {
                // Lozinka nije ispravna
                res.redirect('/login');
              }
            });

          }
        })





      } else {
        res.redirect("/registracija");
      }
    });
  }
  catch {
    res.redirect("/registracija");

  }
});










module.exports = router;
