import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//db connection info
const conn = mysql.createPool({
    host: 'e764qqay0xlsc4cz.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'se74fp7hnsab7j9i',
    password: 'z3qo9z877u97kpdc',
    database: 'zmyzjet8o95l8dus'
});

app.get('/', async (req, res) => {
    const sqlAuthors = `
        select authorId,
            concat(firstName, ' ', lastName) as author
        from q_authors
        order by lastName, firstName
    `;
    const [authors] = await conn.query(sqlAuthors);

    const sqlCategories = `
        select distinct category
        from q_quotes
        order by category
    `;
    const [categories] = await conn.query(sqlCategories);

    res.render('index', { authors, categories });
});

app.get('/searchByKeyword', async (req, res) => {
    try {
        const keyword = req.query.keyword;

        const sql = `
            select
                q_quotes.quote,
                q_quotes.category,
                q_authors.authorId,
                concat(q_authors.firstName, ' ', q_authors.lastName) as author
            from q_quotes
            natural join q_authors
            where q_quotes.quote like ?
            order by q_authors.lastName, q_authors.firstName
        `;

        const [rows] = await conn.query(sql, [`%${keyword}%`]);

        res.render('results', {
            data: rows,
            keyword,
            selectedCategory: null,
            minLikes: null,
            maxLikes: null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('db error');
    }
});

app.get('/searchByAuthor', async (req, res) => {
    try {
        const authorId = req.query.authorId;

        const sql = `
            select
                q_quotes.quote,
                q_quotes.category,
                q_authors.authorId,
                concat(q_authors.firstName, ' ', q_authors.lastName) as author
            from q_quotes
            natural join q_authors
            where q_quotes.authorId = ?
            order by q_quotes.quote
        `;

        const [rows] = await conn.query(sql, [authorId]);

        res.render('results', {
            data: rows,
            keyword: null,
            selectedCategory: null,
            minLikes: null,
            maxLikes: null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('db error');
    }
});

app.get('/searchByCategory', async (req, res) => {
    try {
        const category = req.query.category;

        const sql = `
        select
            q_quotes.quote,
            q_quotes.category,
            q_authors.authorId,
            concat(q_authors.firstName, ' ', q_authors.lastName) as author
        from q_quotes
        natural join q_authors
        where q_quotes.category = ?
        order by q_authors.lastName, q_authors.firstName
        `;

        const [rows] = await conn.query(sql, [category]);

        res.render('results', {
            data: rows,
            keyword: null,
            selectedCategory: category,
            minLikes: null,
            maxLikes: null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('db error');
    }
});

app.get('/searchByLikes', async (req, res) => {
    try {
        let minLikes = parseInt(req.query.minLikes);
        let maxLikes = parseInt(req.query.maxLikes);

        //default fields to catch errors
        if (isNaN(minLikes)) minLikes = 0;
        if (isNaN(maxLikes)) maxLikes = 999999;

        const sql = `
            select
                q_quotes.quote,
                q_quotes.category,
                q_quotes.likes,
                q_authors.authorId,
                concat(q_authors.firstName, ' ', q_authors.lastName) as author
            from q_quotes
            natural join q_authors
            where q_quotes.likes between ? and ?
            order by q_quotes.likes desc
        `;

        const [rows] = await conn.query(sql, [minLikes, maxLikes]);

        res.render('results', {
            data: rows,
            keyword: null,
            selectedCategory: null,
            minLikes,
            maxLikes
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('db error');
    }
});

app.get('/api/author/:id', async (req, res) => {
    try {
        const authorId = req.params.id;

        const sql = `
        select *
        from q_authors
        where authorId = ?
        `;

        const [rows] = await conn.query(sql, [authorId]);

        res.send(rows); //JSON info
    } catch (err) {
        console.error(err);
        res.status(500).send('api error');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server running on port ${port}`);
});

export default app;