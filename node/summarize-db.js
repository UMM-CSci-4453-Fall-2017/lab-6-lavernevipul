var credentials = require('./credentials.json');

var mysql = require("mysql");
var util  = require("util");

credentials.host="ids";
var connection = mysql.createConnection(credentials);
var collectedData = {};

var buildDatabaseSummary = function (databaseName) {
    var query = "SHOW tables IN " + databaseName + ";";
    connection.query(query, function(err, rows, fields){
        if (err) {
            console.log("error in buildDatabaseSummary" + err);
            console.log("query was: " + query);
        } else {
            collectedData.databases[databaseName].tablesLeftToProcess = rows.length;
            collectedData.databases[databaseName].tables = {};
            rows.map(function(row){
              collectedData.databases[databaseName].tables[databaseName + "." + row["Tables_in_" + databaseName]] = [];
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
            collectedData.databases[databaseName].tablesLeftToProcess -= 1;
	}
	else {
	   rows.map(function(field){
		   var entry = "        FieldName: "
		               + "`" + field.Field + "`"
		               + "\t(" + field.Type + ")"; 
                   collectedData.databases[databaseName].tables[databaseName + "." + tableName].push(entry);
	   });

           collectedData.databases[databaseName].tablesLeftToProcess -= 1;
           printCollectedData();
	}
    });
}

function printCollectedData() {

    for (var databaseName in collectedData.databases) {

        if (collectedData.databases[databaseName].tablesLeftToProcess === 0) {
          console.log("---|" + databaseName + ">");
          for (var tableName in collectedData.databases[databaseName].tables) {
              console.log('......|' + tableName + ">");
              console.log(collectedData.databases[databaseName].tables[tableName].join("\n"));
          }
          delete collectedData.databases[databaseName];
        }
    }

    if (Object.keys(collectedData.databases).length === 0) {
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
        collectedData.databases = {};
        rows.map(function(row){
            collectedData.databases[row['Database']] = {};
            buildDatabaseSummary(row['Database']);
        });
    }
});
