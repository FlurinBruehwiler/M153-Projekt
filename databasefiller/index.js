const mysql = require('mysql2');
const https = require('https');
const port = 5000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'secret',
    database: 'filmplattform'
});

const apiKey = '58a7362841870c68b23d04b2e5ad15ac';


getPopularFilms(1);

function getPopularFilms(pages){

    for (let i = 1; i <= pages; i++) {
        https.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=${i}`, (resp) => {
            let data = '';
        
            resp.on('data', (chunk) => {
                data += chunk;
            });
        
            resp.on('end', () => {
                data = JSON.parse(data);
                films = data.results;
                
                for (let j = 0; j < films.length; j++) {
                    const element = films[j];
                    getFilm(element.id);
                    getPersonsFromFilm(element.id);
                    
                }

            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }
}

function getPersonsFromFilm(id){
    https.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}&language=en-US`, (resp) => {
        let data = '';
    
        resp.on('data', (chunk) => {
            data += chunk;
        });
    
        resp.on('end', () => {
            data = JSON.parse(data);
            const cast = data.cast;
            const crew = data.crew;

            for (let i = 0; i < cast.length; i++) {
                const actor = cast[i];
                getPerson(actor.id, id, 'actor')
            }

            for (let i = 0; i < crew.length; i++) {
                const crewMember = crew[i];
                getPerson(crewMember.id, id, crewMember.department)
            }
        });
    
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function getPerson(PersonId, MovieId, Type){
    https.get(`https://api.themoviedb.org/3/person/${PersonId}?api_key=${apiKey}&language=en-US`, (resp) => {
        let data = '';
    
        resp.on('data', (chunk) => {
            data += chunk;
        });
    
        resp.on('end', () => {
            data = JSON.parse(data);
            insertPersonsIntoDB(data, MovieId, Type);
        });
    
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function insertPersonsIntoDB(Person, MovieId, Type){
    console.log(`Creating ${Person} and Film with id ${MovieId} and with the Type ${Type}`)

    //Create Person
    const createPersonSQL = `insert into person (Person_Id, Person_Name, Person_Bio) 
    select '${Person.id}', '${Person.name.replaceAll("'","''")}', '${Person.biography.replaceAll("'","''")}'
    where not exists (select * from person where person_id = '${Person.id}')`;
    
    db.query(createPersonSQL, (err, result) => {
        if (err) throw err;
    })

    //Create PersonType
    const createPersonTypeSQL = `insert into PersonType (PersonType_Id, Name) 
    select null, '${Type.replaceAll("'","''")}'
    where not exists (select * from PersonType where Name = '${Type}')`;
    
    db.query(createPersonTypeSQL, (err, result) => {
        if (err) throw err;
    })

    //Create FilmPerson
   const getPersonTypeID = `select PersonType_Id from PersonType where Name = '${Type}'`;

   db.query(getPersonTypeID, (err, result) => {
       if (err) throw err;
       createFilmPerson(Person.id, MovieId, result[0].PersonType_Id);
   })
}

function createFilmPerson(PersonId, MovieId, PersonTypeId){
    const createPersonSQL = `insert into filmperson (FilmPerson_Person_Id, FilmPerson_Film_Id, FilmPerson_PersonType_id) 
    select '${PersonId}', '${MovieId}', '${PersonTypeId}'
    where not exists (select * from filmperson where FilmPerson_Person_Id = '${PersonId}' and FilmPerson_Film_Id = '${MovieId}' and FilmPerson_PersonType_id = '${PersonTypeId}')`;
    
    db.query(createPersonSQL, (err, result) => {
        if (err) throw err;
    })
}

function getFilm(id){
    https.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`, (resp) => {
        let data = '';
    
        resp.on('data', (chunk) => {
            data += chunk;
        });
    
        resp.on('end', () => {
            data = JSON.parse(data);
            insertFilmIntoDB(data);
            insertGenresIntoDB(data);
        });
    
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function insertGenresIntoDB(details){
    
    genres = details.genres;

    for (let i = 0; i < genres.length; i++) {
        const element = genres[i];
        const createGenreSQL = `insert into genre (genre_id, genre_name) 
        select '${element.id}', '${element.name}'
        where not exists (select * from genre where genre_name = '${element.name}')`;
        
        db.query(createGenreSQL, (err, result) => {
            if (err) throw err;
            insertFilmGenresIntoDB(details.id, element.id);
        })
    }

}
function insertFilmGenresIntoDB(film_id, genre_id){

    const createFilmGenreSQL = `insert into filmgenre (filmgenre_film_id, filmgenre_genre_id) 
    select '${film_id}', '${genre_id}'
    where not exists (select * from filmgenre where filmgenre_film_id = '${film_id}' and filmgenre_genre_id = '${genre_id}')`;
    
    db.query(createFilmGenreSQL, (err, result) => {
        if (err) throw err;
    })
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

