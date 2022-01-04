const mysql = require('mysql2');
const https = require('https');
const port = 5000;


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'secret',
    database: 'filmplattform'
});

getPopularFilms(10);

function getPopularFilms(pages){

    for (let i = 1; i <= pages; i++) {
        https.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=58a7362841870c68b23d04b2e5ad15ac&language=en-US&page=${i}`, (resp) => {
            let data = '';
        
            resp.on('data', (chunk) => {
                data += chunk;
            });
        
            resp.on('end', () => {
                data = JSON.parse(data);
                films = data.results;
                
                for (let j = 0; j < films.length; j++) {
                    const element = films[j];
                    getFilm(element.id)
                }

            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }
}

function getFilm(id){
    https.get(`https://api.themoviedb.org/3/movie/${id}?api_key=58a7362841870c68b23d04b2e5ad15ac`, (resp) => {
        let data = '';
    
        resp.on('data', (chunk) => {
            data += chunk;
        });
    
        resp.on('end', () => {
            data = JSON.parse(data);
            insertFilmIntoDB(data);
        });
    
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function insertFilmIntoDB(data){
    const shortDescription = data.tagline === '' ? 'null' : `'${data.tagline.replaceAll("'","''")}'`;

    const sql = `insert into film (Film_Id, Film_Title, Film_ReleaseDate, Film_ShortDescription, Film_LongDescription) 
    select '${data.id}', '${data.title.replaceAll("'","''")}', '${data.release_date}', ${shortDescription}, '${data.overview.replaceAll("'","''")}'
    where not exists (select * from film where film_id = '${data.id}')`;
    db.query(sql, (err, result) => {
        if (err) throw err;
    })
}