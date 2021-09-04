var http = require("http"); //now you can create a server
var mysql = require("mysql"); //now you can connect to mysql
const express = require("express"); //express  faremwork for making routes
const path = require("path"); //helps create file paths
let ejs = require("ejs"); //Embedded JavaScript
let bodyParser = require("body-parser");
const bcrypt = require("bcrypt"); //hash your password
const session = require("express-session");
const flash = require("flash");
const passport = require('passport');
const LocalStrategy = require('passport-local');
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

//LOGIN, Logout AND RESGISETER ROUTES GET AND POST------------------------------------
app.get("/login", (req, res) => {
	res.render("login.ejs");
});
app.post("/login", (req, res) => {
	res.render("login.ejs");
});

app.get("/register", async (req, res)=> {
	res.render("register");
});
app.post("/register", async (req, res) => {
	const { name, username, password } = req.body;
	const hash = await bcrypt.hash(password, 12);
});

// list movies and get movies 
app.get("/", (req, res) => {//route to print all movies in the database
	let sql = "SELECT * FROM movies"; //select all moviesd
	db.query(sql, (err, result, fields) => {
		if (err) console.log(err);
		console.log(JSON.stringify(result)); 
		res.render("movies", { result }); 
	});
});

app.get("/movies/:id", (req, res) => {//route that selects movie by id
	let sql = `SELECT * FROM movies WHERE movie_id = ${req.params.id}`;
	//let sql = 'SELECT * FROM movies WHERE movie_id = 1';
	db.query(sql, (err, result, fields) => {
		if (err) console.log(err);
		console.log(JSON.stringify(result));
		res.render("rate_movie", { result });
	});
});

//route that rates the selected movie INSERT RATING
app.post("/movies/:id/rateMovie", (req, res) => {
	let sql = `INSERT INTO ratings (movie_id, user_id, rating) VALUES ('${req.params.movie_id}' , '1' , '${req.params.rating}') `;

	db.query(sql, (err, result, fields) =>{
		console.log(JSON.stringify(result));
		res.render("movie_reviews", { result });
	});
});

//ratings columns
//rating_id , movie_id, user_id, rating



//test routes
app.get("/secret", requireLogin, (req, res) => {
	res.render("secret");
});

app.get("/topsecret", requireLogin, (req, res) => {
	res.send("TOP SECRET!!!");
});

app.all("*", (req, res) => {//not sure what this does
	res.status(404).send("<h1>resource not found</h1>");
});

app.listen(8080, (err) => {//listens for connections/requests
	if (err) console.log(err);
	console.log("Server started on port 8080");
});
