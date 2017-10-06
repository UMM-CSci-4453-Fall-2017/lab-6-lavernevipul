var credentials = require('./credentials.json');

var mysql = require("mysql");
var util  = require("util");

credentials.host="ids";
var connection = mysql.createConnection(credentials);
var connectionClosed = false;

var printDatabaseSummary = function (databaseName) {
    var query = "SHOW tables IN " + databaseName + ";";
    connection.query(query, function(err, rows, fields){
        if (err) {
            console.log("error in printDatabaseSummary" + err);
            console.log("query was: " + query);
        } else {
            console.log("---|" + databaseName + ">");
            rows.map(function(row){
              printTableSummary(databaseName + "." + row["Tables_in_" + databaseName]);
            });
       } 
   })
};

var printTableSummary = function (tableName) {
    var tableQuery = "Describe " + tableName;
    connection.query(tableQuery, function(err,rows,fields) {
	if (err) {
	    console.log("error in printTableSummary" +err);
	}
	else {
	   console.log('......|' + tableName + ">");
	   console.log("yay");
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
            return row['Database'];
        }).map(printDatabaseSummary);
    }
});
