//file to connect to mysql databse and connect
//then export file for other files to use

var mysql = require('mysql');

// local host test database for testing and building
// const db = mysql.createConnection({//connect to mysql database
// 	host: "127.0.0.1",
// 	port: "3306",
// 	user: "root",
// 	password: "password1234",
// 	database: "review_db",
// });

//AWS CONNECTION
// const db = mysql.createConnection({//connect to mysql database
// 	host: "aws-movie-review.cjnavmi6ggho.us-east-1.rds.amazonaws.com",
// 	port: "3306",
// 	user: "admin",
// 	password: "mydatabse123",
// 	database: "review_db",
// });

const db = mysql.createConnection({//connect to mysql database
	// host: "abstract-gizmo-355616:us-central1:movie-review-db",
	host: "34.173.117.227",
	port: "3306",
	user: "root",
	password: "mydatabase123",
	database: "movie-review",
});


db.connect((err) => {//check if database connection is successful or there is an error
	if (err) {
		console.log("ERROR -- connecting to the database!!");
		throw err;
	}
	console.log("Database successfully Connected!! =)");
});

module.exports = db;