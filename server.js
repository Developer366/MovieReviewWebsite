var http = require("http"); //now you can create a server
var mysql = require("mysql"); //now you can connect to mysql
const express = require("express"); //express  faremwork for making routes
const path = require("path"); //helps create file paths
let ejs = require("ejs"); //Embedded JavaScript
const engine = require("ejs-mate"); //layout for ejs files
let bodyParser = require("body-parser");
const bcrypt = require("bcrypt"); //hash your password
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");//user sessions
const LocalStrategy = require("passport-local");
const morgan = require("morgan");
const dotenv = require("dotenv");

const db = require('./db');//get databse configuration from db.js
//const hbs = require('express-handlebars');

const movieRoutes = require('./routes/movies'); //get movie router from routes folder

const app = express(); //Creates Express application
app.use(express.static(path.join(__dirname, "/public"))); //css path

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views")); //templates in the view folder

app.use(express.urlencoded({ extended: true })); //middleware for parsing url data
app.use(express.json());
app.use(session({ secret: "notagoodsecret" }));
app.use(morgan("dev")); //useful logging tool shows whether get or post method and ms

//app.use(session(sessionConfig));
app.use(passport.initialize());// creating sessions
app.use(passport.session());
//passport.use(new LocalStrategy)
app.use(flash());

app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
})

//app.engine('view engine', 'hbs'); middleware 
const requireLogin = (req, res, next) => {
	if (!req.session.user_id) {
		return res.redirect("/login");
	}
	next();
};

//***********LOGIN, Logout AND RESGISETER ROUTES GET AND POST----------------------------

app.get(["/", "/login"], (req, res) => {//two urls work for login
	//first page you see is the login form
	// res.render("users/login.ejs");
	// res.render("movies/movies.ejs")
	res.redirect("/movies")//***************** For Development purposes change later
});

app.post("/login", async (req, res) => {
	const { username, password } = req.body;//get form data 
	//console.log("Password is: " +password +" ,, " + hashPassword)
	//let sql = "SELECT * FROM user where username = ? and password = ?";
	let sql = "SELECT * FROM user where username = ?";

	db.query(sql, [username], async function  (err, result){//look for username 
		if(err) throw err;
		console.log(result)
		let hashPassword = result[0].password;

		const validPassword = await bcrypt.compare(password, hashPassword );//compare password to databse
		console.log(hashPassword)
		console.log(validPassword)

		if (validPassword) {
			if (err) throw err;
			//req.session.user_id = user._id; //stores user id for the session to stay logged in 
			console.log("password is valid")
			req.flash('success', 'Successfully Logged In');
			res.redirect('/movies');
		} else {
			if (err) throw err;
			console.log("Try Again")
			res.redirect('/login')
			//res.render("Error logging in to account")
		}
	})//end of sql query 

});// end of login route
	
app.get("/register", async (req, res) => {
	res.render("users/register");
});

app.post("/register", async (req, res) => {
	const { name, username, password } = req.body;
	const hash = await bcrypt.hash(password, 12);
	console.log("Password is: " + hash)
	var sql = "INSERT INTO user (name, username, password) VALUES (?,?,?)";

	db.query(sql, [name, username, hash], function(err, result) {
		if (err) throw err;
		console.log("Number of records inserted: " + result.affectedRows);
		console.log(result)
	})
	res.redirect('/login');
});

app.post('/logout', (req,res) => {
	//req.session.user_id = null;
	//req.session.destroy();
	res.redirect('/login')
})




//************************test routes---------------------------------------------------------
app.get("/secret", requireLogin, (req, res) => {
	res.render("secret");
});
app.use((err, req, res, next) => {
	console.log("***************************");
	console.log("**********ERROR***********");
	console.log("******************************");
	console.log(err);
	next(err);
});

app.use('/movies' , movieRoutes);

app.get("/topsecret", requireLogin, (req, res) => {
	res.send("TOP SECRET!!!");
});

app.all("*", (req, res) => {
	//not sure what this does
	res.status(404).send("<h1>resource not found</h1>");
}); //when no routes match

app.listen(8080, (err) => {
	//listens for connections/requests
	if (err) console.log(err);
	console.log("Server started on port 8080 [http://localhost:8080/]");
});
