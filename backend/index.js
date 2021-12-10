const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const mysql = require('mysql2');
const port = 5000;


const db = mysql.createConnection({
    host: 'localhost',
    user : 'root',
    password : 'secret',
    database: 'filmplattform'
});

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(port, ()=> console.log("App is running very fast"));



app.get('/filme', (req, res) => {
    const sql = "select * from film";
    db.query(sql, (err, results) => {
            if(err) throw err;
            console.log(results);
            res.send(results);
        }
    );
});


app.post('/newFilm', (req, res) => {
    let shortDescription = req.body.shortDescription === '' ? 'null' : `'${req.body.shortDescription}'`;

    const sql = `INSERT INTO film (Film_Id, Film_Title, Film_ReleaseDate, Film_ShortDescription, Film_LongDescription) 
    VALUES (NULL, '${req.body.title}', '${req.body.releaseDate}', ${shortDescription}, '${req.body.longDescription}')`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        res.status(200).send();
    })
})

