var express = require('express');
var router = express.Router();
var predavanje = require("./predavanjeDB");
const pitanja = require("./pitanjaDB");
const zabranjene_rijeci = require("./zabranjene_rijeciDB");



var io = null;
router.get('/:kod', function(req, res) {
  console.log("u gostu sam ");
  var src;
  predavanje.findOne({kod: req.params.kod}, (error, predavanjes)=>{
    if(error){
      console.log(error)
    } else if (predavanjes){
      src = predavanjes.pozadina
      var date = new Date();
      if(predavanjes.start_date < date && predavanjes.end_date > date ){
        console.log("usao")
        console.log(io)
        if(!io) {
          console.log("usao u if")
          io = require('socket.io')(req.connection.server);


          io.sockets.on('connection', function (client) {
            pitanja.find({p_kod: req.params.kod}, (error, pitanja) => {
              if (error) {
                console.log(error)
              } else if (pitanja) {
                console.log("a ovde")

                console.log("zapeo ovde haha")


                client.emit('pitanja', pitanja);

              } else {
                console.log("nema pitanja za ovo predavanje")
              }
            })

            client.on("ukloni_filter", function () {
                  pitanja.find({p_kod: req.params.kod}, (error, pitanja) => {
                    if (error) {
                      console.log(error)
                    } else if (pitanja) {
                      io.emit('pitanja', pitanja);
                    } else {
                    }
                  })
                }
            )
            console.log("konektovao")

            client.on('postavljanje_pitanja', async function (d) {
              console.log("usao u pitanej")

              var s = false;
              await zabranjene_rijeci.find().then(rijeci => {
                console.log("usao u rijeci")
                rijeci.forEach(r => {

                  console.log(r.rijec + "zabranjea");
                  if (d.indexOf(r.rijec) !== -1) {
                    console.log("ima rijeci")
                    s = true;
                    console.log(s + "rrrr")
                  }
                })

              })
              console.log(s + "varijabla s ")


              predavanje.updateOne({kod: req.params.kod}, {$inc: {broj_postavljenih: 1}}, {new: true}, (error, result) => {
                if (error) {
                  console.log(error);
                } else {
                  console.log(result);
                }
              });


              var p = new pitanja({
                p_kod: req.params.kod,
                tekst: d,
                sakriveno: s
              });
              await p.save({new: true}).then(pita => {
                console.log(pita._id.toString())
                console.log(pita.sakriveno)

                console.log(pita);


                io.sockets.emit('postavljeno_pitanje', pita);



              })

            });

            client.on('pitanjaaaa', function (p) {
              console.log("usao u server");
              client.emit('pitanja', p);

            })
            client.on('filtrirana_pitanja', function (p) {
              console.log("usao u server");
              client.emit('pitanja', p);

            })

            client.on('lajkanje_pitanja', function (id) {
              console.log(id)

              pitanja.findOneAndUpdate({_id: id}, {$inc: {lajk: 1}}, {returnOriginal: false},
                  (error, pitanje) => {

                    if (error) {
                      console.log(error)
                    } else {
                      console.log("povecao lajk");
                      console.log(pitanje.lajk)
                      io.sockets.emit('prikazi_lajk', pitanje)
                    }


                  });


            })
            // client.on('odgovor_pitanja', function(data){
            //   pitanja.find({_id: data.idd}).then(p=>{
            //     client.emit('odgovori_na_pitanje', data)
            //   })
            //
            //
            //
            //
            //
            //
            // });

          })


        }
        console.log(src)
        res.render('gost', {pita: pitanja, slika: src});

      }
      else {
        res.redirect('/');


  };

  };

  });

});


router.post('/:kod', async function (req, res) {
  console.log("ili ovde")
  console.log("sta ne valja")
  console.log(req.params.kod +" ovo je kod koji trazim" +
      "");
  try{
    predavanje.findOne({ kod : req.body.kod}, (error, predavanje) => {
      console.log(req.body.kod);
      console.log("doso");
      if (error) {
        console.log(error);
      } else if (predavanje) {
        console.log('predavanje already exists');
        res.redirect('/gost/'+ req.body.kod);
      } else {
        console.log("sta cu ovde");
        res.redirect('/');
      }
    });
  }
  catch {
    res.redirect('/');

  }
});










module.exports = router;
