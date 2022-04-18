const express = require('express');
const sqlite3 = require('sqlite3');

const route = require('./routes/route');


const app = express();

app.use('/api', route);
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

const db = new sqlite3.Database('./emission.db');

app.listen(process.env.PORT || 8000, () => {
    console.log("Server started on port 8000");
});


