const pg = require('pg');
const express = require('express');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_notes_db');
const app = express();

app.use(express.json());
app.use(require('morgan')('dev'));

//Routes
app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = 'SELECT * FROM flavors';
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

app.get('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = 'SELECT * FROM flavors WHERE id=$1';
        const response = await client.query(SQL)
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = 'INSERT INTO flavors(name, description, favorite) VALUES($1, $2, $3) RETURNING *';
        const response = await client.query(SQL, [req.body.name, req.body.description, req.body.favorite]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = 'DELETE FROM flavors WHERE id=$1';
        const response = await client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
});

app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = 'UPDATE flavors SET name=$1, description=$2, favorite=$3 WHERE id=$4 RETURNING *';
        const response = await client.query(SQL, [req.body.name, req.body.description, req.body.favorite, req.params.id]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});


const init = async () => {
    await client.connect();
    console.log('connected to db');

    let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        favorite BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
    );
    `;
    await client.query(SQL);
    console.log('tables created');

    SQL = `
        INSERT INTO flavors (name, description, favorite) VALUES ('Vanilla', 'Made with real vanilla beans', true);
        INSERT INTO flavors (name, description, favorite) VALUES ('Chocolate', 'Made with real cocoa beans', false);    
        INSERT INTO flavors (name, description, favorite) VALUES ('Strawberry', 'Made with real strawberries beans', false);  
    `;
    await client.query(SQL);
    console.log('data seeded');
};

init();
