var credentials = require('./credentials.json');

var mysql = require("mysql");
var util  = require("util");

credentials.host="ids";
var connection = mysql.createConnection(credentials);
var connectionClosed = false;
var printingDatabase = "";
var collectedData = {};

var printDatabaseSummary = function (databaseName) {
    var query = "SHOW tables IN " + databaseName + ";";
    connection.query(query, function(err, rows, fields){
        if (err) {
            console.log("error in printDatabaseSummary" + err);
            console.log("query was: " + query);
        } else {
            collectedData.databases[databaseName].tablesLeftToProcess = rows.length;
            collectedData.databases[databaseName].tables = {};
            rows.map(function(row){
              collectedData.databases[databaseName].tables[databaseName + "." + row["Tables_in_" + databaseName]] = [];
              printTableSummary(databaseName + "." + row["Tables_in_" + databaseName], databaseName);
            });
       } 
   })
};

var printTableSummary = function (tableName, databaseName) {
    var tableQuery = "Describe " + tableName;
    connection.query(tableQuery, function(err,rows,fields) {
	if (err) {
	    console.log("error in printTableSummary" +err);
	}
	else {
//           if (databaseName !== printingDatabase) {
//              console.log("---|" + databaseName + ">");
//              printingDatabase = databaseName;
//           }
//	   console.log('......|' + tableName + ">");
	   rows.map(function(field){
		   var entry = "        FieldName: "
		               + "`" + field.Field + "`"
		               + "\t(" + field.Type + ")"; 
                   collectedData.databases[databaseName].tables[tableName].push(entry);
		   //console.log(entry);
		   //console.log(field);
	   });

           collectedData.databases[databaseName].tablesLeftToProcess -= 1;
           printCollectedData();
	}
    });
}

function printCollectedData() {
    //collectedData.databases.map(function(x){console.log(util.inspect(x),{depth:1})});

    for (var databaseName in collectedData.databases) {
        //console.log("key: " + key + ",\n" + "value: " + util.inspect(collectedData.databases[key], {depth: 0}));

        if (collectedData.databases[databaseName].tablesLeftToProcess === 0) {
          console.log("---|" + databaseName + ">");
          //console.log(collectedData.databases[key].tables);
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
            printDatabaseSummary(row['Database']);
        });
    }
});
