var http = require("http"); //now you can create a server
var mysql = require("mysql"); //now you can connect to mysql
const express = require("express"); //express  faremwork for making routes
const path = require("path"); //helps create file paths
let ejs = require("ejs"); //Embedded JavaScript
let bodyParser = require("body-parser");
const bcrypt = require("bcrypt"); //hash your password
const session = require("express-session");
const flash = require("flash");
//const hbs = require('express-handlebars');

const app = express(); //Creates Express application
app.use(express.static(path.join(__dirname, "styles")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views")); //templates in the view folder

app.use(express.urlencoded({ extended: true })); //middleware for parsing url data
app.use(express.json());
app.use(session({ secret: "notagoodsecret" }));
//app.engine('view engine', 'hbs');
const requireLogin = (req, res, next) => {
	if (!req.session.user_id) {
		return res.redirect("/login");
	}
	next();
};

//connect to mysql database------------------------------------------------------------
const db = mysql.createConnection({
	//connect to mysql database
	host: "127.0.0.1",
	user: "root",
	password: "password1234",
	database: "review_db",
});
db.connect((err) => {
	//check if database connection is successful or there is an error
	if (err) {
		console.log("ERROR -- connecting to the database!!");
		throw err;
	}
	console.log("Database successfully Connected!! =)");
});

//LOGIN, Logout AND RESGISETER ROUTES GET AND POST///////////////////////////
app.get("/login", (req, res) => {
	//home page or First Page
	res.render("login.ejs");
});
/*
app.post("/login", async (req, res) => {
      console.log(req.body);
	//route for login and authentication
	const { username, password } = req.body;

	//if (username && password) {
		//let sql = `SELECT * FROM user WHERE username = ? AND password = ?';
            db.query(`SELECT email FROM user WHERE username = ? AND password = ?`, [username,password ], (error, results) =>{
                  if(error) {
                        console.log(error);
                  } 
                  if (results.length > 0) {
                        return res.render('register', {message: 'That email is already in use!'})
                  } else if( password !== passwordConfirm ) {
                        return res.render('register', {
                              message: 'Passwords do not match'
                        });
                  };
            })

		//let query = db.query(sql, (err, result) => {
			//if (err) throw err;
			//console.log(result);
			//res.render("movies.ejs", { result });
		//});
	//}
//});
*/

app.post("/register", async (req, res) => {
	const { name, username, password } = req.body;
	const hash = await bcrypt.hash(password, 12);
	//const user =
});

//route to print all movies in the database
app.get("/", (req, res) => {
	var movies = "SELECT * FROM movies"; //select all movies
	db.query(movies, function (err, result, fields) {
		//WHERE movie_name = 'The Avengers'
		if (err) console.log(err);
		console.log(JSON.stringify(result)); //result is an array of your data you get after a query
		res.render("movies.ejs", { result }); //, { result }
	});
});

//route that selects movie by id
app.get("/movies/:id", (req, res) => {
	let sql = `SELECT * FROM movies WHERE movie_id = ${req.params.id}`;
	let query = db.query(sql, (err, result) => {
		if (err) throw err;
		console.log(result);
		res.render("movies.ejs", { result });
	});
});

//route that rates the selected movie INSERT RATING
app.post("/movies/:id/rateMovie", (req, res) => {
	let sql = "INSERT INTO ratings () ";
});

//test routes
app.get("/secret", requireLogin, (req, res) => {
	res.render("secret");
});

app.get("/topsecret", requireLogin, (req, res) => {
	res.send("TOP SECRET!!!");
});

app.all("*", (req, res) => {
	//not sure what this does
	res.status(404).send("<h1>resource not found</h1>");
});

app.listen(8080, (err) => {
	//listens for connections/requests
	if (err) console.log(err);
	console.log("Server started on port 8080");
});
