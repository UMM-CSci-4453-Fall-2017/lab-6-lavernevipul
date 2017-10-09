var credentials = require('./credentials.json');

var mysql = require("mysql");
var util  = require("util");

credentials.host="ids";
var connection = mysql.createConnection(credentials);
var connectionClosed = false;
var printingDatabase = "";

var printDatabaseSummary = function (databaseName) {
    var query = "SHOW tables IN " + databaseName + ";";
    connection.query(query, function(err, rows, fields){
        if (err) {
            console.log("error in printDatabaseSummary" + err);
            console.log("query was: " + query);
        } else {
            //console.log("---|" + databaseName + ">");
            rows.map(function(row){
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
           if (databaseName !== printingDatabase) {
              console.log("---|" + databaseName + ">");
              printingDatabase = databaseName;
           }
	   console.log('......|' + tableName + ">");
	   rows.map(function(field){
		   var entry = "        FieldName: "
		               + "`" + field.Field + "`"
		               + "\t(" + field.Type + ")"; 
		   console.log(entry);
		   //console.log(field);
	   });
	   if (!connectionClosed) {
		connectionClosed = true;
		connection.end();
	   }
	}
    });
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
        rows.map(function(row){
            printDatabaseSummary(row['Database']);
        });
    }
});
