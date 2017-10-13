var credentials = require('./credentials.json');

var mysql = require("mysql");
var util  = require("util");

credentials.host="ids";
var connection = mysql.createConnection(credentials);
var databases = {};

var buildDatabaseSummary = function (databaseName) {
    var query = "SHOW tables IN " + databaseName + ";";
    connection.query(query, function(err, rows, fields){
        if (err) {
            console.log("error in buildDatabaseSummary" + err);
            console.log("query was: " + query);
        } else {
            databases[databaseName].tablesLeftToProcess = rows.length;
            databases[databaseName].tables = {};
            rows.map(function(row){
              databases[databaseName].tables[databaseName + "." + row["Tables_in_" + databaseName]] = [];
              buildTableSummary(row["Tables_in_" + databaseName], databaseName);
            });
       } 
   })
};

var buildTableSummary = function (tableName, databaseName) {
    var tableQuery = "Describe `" + databaseName +"`.`"  + tableName + "`";
    connection.query(tableQuery, function(err,rows,fields) {
	if (err) {
	    console.log("error in buildTableSummary" +err);
            databases[databaseName].tablesLeftToProcess -= 1;
	}
	else {
	   rows.map(function(field){
		   var entry = "        FieldName: "
		               + "`" + field.Field + "`"
		               + "\t(" + field.Type + ")"; 
                   databases[databaseName].tables[databaseName + "." + tableName].push(entry);
	   });

           databases[databaseName].tablesLeftToProcess -= 1;
           printCollectedData();
	}
    });
}

function printCollectedData() {

    for (var databaseName in databases) {

        if (databases[databaseName].tablesLeftToProcess === 0) {
          console.log("---|" + databaseName + ">");
          for (var tableName in databases[databaseName].tables) {
              console.log('......|' + tableName + ">");
              console.log(databases[databaseName].tables[tableName].join("\n"));
          }
          delete databases[databaseName];
        }
    }

    if (Object.keys(databases).length === 0) {
	connection.end();
    }
}

connection.connect(function(err){
    if(err){
        console.log("Problems with MySQL: "+err);
    } else {
        console.log("Connected to Database.");
        console.log("        Acquiring data.  This may take a bit...");
    }
});

connection.query('SHOW DATABASES',function(err,rows,fields){
    if(err){
        console.log('Error looking up databases');
    } else {
        databases = {};
        rows.map(function(row){
            databases[row['Database']] = {};
            buildDatabaseSummary(row['Database']);
        });
    }
});
