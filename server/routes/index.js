var express = require('express');
var router = express.Router();
const services = require("../services/render");
const mysql = require("mysql");
const sha256 = require("sha256");
const url = require('url');
const jwt = require('jsonwebtoken');
var querystring = require('querystring');
const db = mysql.createConnection({
  host : "localhost",
  user : "root",
  password : "root",
  database : "schoolmate"
});
db.connect();

const bodyParser = require('body-parser');

/* GET home page. */
router.get('/', services.homeRoutes);

router.get('/register', services.registerRoutes);

/* register api */
router.post("/register", function(req, res) {
  try {
    const id = req.body.id || '';
    const password = req.body.password || '';
    const name = req.body.name || '';
    const age = req.body.age || '';

    if(!id.length || !password.length || !name.length  || !age.length ) {
      return res.status(400).json({err: 'Incorrect info'});
    }

    console.log("done");
    var sql = `SELECT id FROM users WHERE id = "${id}"`
    db.query(sql, function(err, rows, fields){
      if(err) {
        console.log(err);
        return res.status(400).json({register: false});
      } else {
        console.log(rows);
        if(rows.length) {
          return res.status(400).json({id: "Redundanted id" });
        } else {
          console.log("Not Jungbok!");
          db.query(`INSERT INTO users (id, name, password, age) VALUES("${id}", "${name}", "${sha256(password)}", ${parseInt(age)})`, function(err, rows, fields) {
            if(err) {
              console.log(err);
              return res.status(400).json({register: false});
            } else {
              return res.status(201).json({register: true});
            }
          })
        }
      }
    });
  } catch (e) {
    return res.status(500).json({err : "Server error"});
  }
});

router.post("/login", function (req, res) {
  console.log('got request!');
  const sql = `SELECT password FROM users WHERE id = "${req.body.id}"`;
  db.query(sql, (err, rows) => {
      if (err)
          return res.status(400).json({
              result: "sql error"
          });
      else {
        try {
          if (rows[0].password === sha256(req.body.pw)) {
            let token = jwt.sign({ name: req.body.id }, "ang");
            return res.status(200).json({
              login: true,
              token: token
            })
          }
          else {
            return res.status(404).json({
              result: "invalid id"
            })
          }
        }
        catch (e) {
          console.log(e)
          return res.status(400).json({
              login: false
          })
        }
      }
  });
});

router.get("/login", function (req, res) {
  console.log("got authorization request!");
  try {
      return res.status(200).json({
          user: jwt.verify(req.headers.authorization.split(' ')[1], "ang")["name"]
      });
  }
  catch(e) {
      return res.status(401).json({
          login: false
      })
  }
});

router.get("/user", function (req, res) {
  try {
    var parsedUrl = url.parse(req.url);
    const id = querystring.parse(parsedUrl.query, '&','=').id;

    if(id.length == 0) {
      return res.status(400).json({
        err: "Invalid id"
      })
    }

    const sql = `SELECT * FROM users WHERE id = "${id}"`;
    db.query(sql, function(err, rows, fields) {
      if(err) {
        console.log(err);
        return res.status(400).json({
          err: "Invalid id"
        });
      } else {
        try {
          return res.status(200).json({
            uid : rows[0].uid,
            name: rows[0].name,
            age: rows[0].age
          });
        } catch (e) {
          console.log(e);
          return res.status(500).json({
            err: "Server error"
          });
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/qna/question", function (req, res) {
  try {
    const title = req.body.title || '';
    const writer_id = req.body.writer_id || '';
    const category = req.body.category || '';
    const timestamp = req.body.timestamp || '';
    const main_text = req.body.main_text || '';

  } catch(e) {
    console.log(e);
  }
})

module.exports = router;