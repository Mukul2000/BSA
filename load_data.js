const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./emission.db');

let csvPromise = getCSV();
    csvPromise.then(function(result) {
      pool = db.serialize(function() {
        db.run('CREATE TABLE emissions ('
                + 'country_or_area VARCHAR(255),' // This is the cookie
                + 'year VARCHAR(4),'
                + 'value REAL,'
                + 'category VARCHAR(255),'
                + 'id INTEGER'
                + ');')
          
        // Insert items from CSV 
        for(let i = 0; i < result.length; i++) {
          let unit = result[i];
          db.run("INSERT INTO emissions"
            + " (country_or_area, year, value, category, id) VALUES"
            + " ($country_or_area, $year, $value, $category, $id)",
          {
            $country_or_area: unit.country_or_area,
            $year: unit.year,
            $value: unit.value,
            $id: unit.id,
            $category: unit.category
          });
        } // end for

      });
      return pool;
    })
    .catch(e => console.log(e));

function getCSV() {
  let menuFileLocation = './cleaned_data.csv';

  return new Promise(function(resolve, reject) {
    require('fs').readFile(menuFileLocation, "utf8", function(err, data) {
      if (err) {
        reject(err);
      } else {
        let lines = data.split('\n'),
            columns = [],
            item = {},
            menuItems = [];

        for(let i = 0; i < lines.length - 1; i++) {
          // Skip the row of column headers
          if(i === 0) continue;

          let line = lines[i],
              columns = line.split(',');

          let country_or_area = columns[0],
              year = columns[1],
              value = parseFloat(columns[2]),
              category = columns[3];
              id = columns[4]

              id = id.slice(0,-1);
              id = parseInt(id);

          menuItems.push({
            "id": id,
            "country_or_area": country_or_area,
            "value": value,
            "category": category,
            "year": year
          });

        } // end for
        console.log(menuItems[5000])
        resolve(menuItems);

      } // end else
    }); // end readFile
  }); // return promise
} // end getCSV