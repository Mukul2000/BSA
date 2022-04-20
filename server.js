const express = require('express');
const sqlite3 = require('sqlite3');
const swaggerUi = require('swagger-ui-express');

const app = express();
const db = new sqlite3.Database('./emission.db');
const swaggerDocument = require('./swagger.json');

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(
  '/api-docs',
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument)
);


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

app.get('/country/:id', async (req,res) => {

    let {startYear, endYear, parameters} = req.query;

    id = parseInt(req.params.id);
    if(isNaN(id)) {
        res.status(400).json({"error": ["id must be a positive integer"]});
        return;
    }
 
    if(startYear === undefined) startYear = "1900";
    if(endYear === undefined) endYear = "2100";
    
    if(startYear.length !== 4 || endYear.length !== 4) {
        res.status(400).json({"error": ["Invalid year format, format is YYYY"]});
    }


    const mainquery = "SELECT *";
    const table = " from emissions";
    
    let conditions = ` where id = ${req.params.id} and year >= ${startYear} and year <= ${endYear}`;

    if(parameters !== undefined) {
        parameters = parameters.split(' ');
        conditions += " and (";
        for(let i = 0; i < parameters.length; i++) {
            parameters[i] = parameters[i].toLowerCase();
            if(parameters[i] == "co2") parameters[i] = "carbon_dioxide"
            conditions += ` category like \'%${parameters[i]}%\'`;
            if(i !== parameters.length - 1) conditions += " or";
        }
        conditions += ");"
    }

    const query = mainquery + table + conditions;
    db.all(query, (err,rows) => {
    if(err) {
        console.log(err);
        res.status(500).json({"error": ["Something went wrong", err]});
    }
    else 
        res.status(200).json(rows);
    });
});