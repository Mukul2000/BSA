const express = require('express');
const sqlite3 = require('sqlite3');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

const db = new sqlite3.Database('./emission.db');

app.listen(process.env.PORT || 8000, () => {
    console.log("Server started on port 8000");
});

app.get('/countries', async (req,res) => {
    db.all("SELECT id, MIN(YEAR), MAX(YEAR), country_or_area from emissions group by country_or_area", (err,rows) => {
        if(err) {
            console.log(err);
            res.status(500).json({"error": ["Something went wrong", err]});
        }
        else 
            res.status(200).json(rows);
    });
});

