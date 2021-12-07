const express = require('express');
const app = express();
const mysql = require('mysql2');
const port = 5000;

const db = mysql.createConnection({
    host: 'localhost',
    user : 'root',
    password : 'secret',
    database: 'nodejstest'
});

const sql = "select * from filme";

app.use(express.json());

app.listen(port, ()=> console.log("App is running very fast"));

app.get('/filme', (req, res) => {
    db.query(
        sql,
        function(err, results, fields) {
            res.send(results);
        }
    );
});

app.post('/newFilm', (req, res) => {
    const film = {
        id: 0,
        name: ""
    }
})

