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


app.get('/film/:id', (req, res) => {
    const id = req.params.id;
    const sql = `select * from film where film_id = ${id}`;
    db.query(sql, (err, results) => {
            if(err) throw err;
            console.log(results);
            res.send(results);
        }
    );
});


app.get('/member/:id', (req, res) => {
    const id = req.params.id;
    const sql = `select * from member where member_id = ${id}`;
    db.query(sql, (err, results) => {
            if(err) throw err;
            console.log(results);
            res.send(results);
        }
    );
});

app.get('/member/:id/filme/watched', (req, res) => {
    const id = req.params.id;
    const sql = `SELECT film.Film_Id, film.Film_Title, film.Film_ReleaseDate, film.Film_ShortDescription, film.Film_LongDescription FROM watchevent 
    JOIN film on watchevent.WatchEvent_Film_Id = film.Film_Id
    join member on watchevent.WatchEvent_Member_Id = member.Member_Id
    where member.Member_Id = ${id}`;
    db.query(sql, (err, results) => {
            if(err) throw err;
            console.log(results);
            res.send(results);
        }
    );
});


app.post('/newFilm', (req, res) => {
    const shortDescription = req.body.shortDescription === '' ? 'null' : `'${req.body.shortDescription}'`;
    const sql = `INSERT INTO film (Film_Id, Film_Title, Film_ReleaseDate, Film_ShortDescription, Film_LongDescription) 
    VALUES (NULL, '${req.body.title}', '${req.body.releaseDate}', ${shortDescription}, '${req.body.longDescription}')`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        res.status(200).send();
    })
})

app.post('/watchevent', (req, res) => {
    const rating = req.body.rating === '' ? 'null' : `'${req.body.rating}'`;
    const text = req.body.text === '' ? 'null' : `'${req.body.text}'`;
    const sql = `INSERT INTO watchevent (WatchEvent_Id, WatchEvent_Rating, WatchEvent_Text, WatchEvent_Date, WatchEvent_Member_Id, WatchEvent_Film_Id) 
    VALUES (NULL, ${rating}, ${text}, '2021-12-11 10:27:00.000000', '${req.body.member_id}', '${req.body.film_id}');`;
    db.query(sql, (err, result) =>{
        if(err) throw err;
        res.status(200).send();
    })
})

