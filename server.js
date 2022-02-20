const http = require("http"); //now you can create a server
const mysql = require("mysql"); //now you can connect to mysql
const express = require("express"); //express  faremwork for making routes
const path = require("path"); //helps create file paths
const ejs = require("ejs"); //Embedded JavaScript
const engine = require("ejs-mate"); //layout for ejs files
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt"); //hash your password
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");//user sessions
const LocalStrategy = require("passport-local");
const morgan = require("morgan");
const dotenv = require("dotenv");
const hbs = require('express-handlebars');

//importing from other files/folders---------------------------------------------------------
const movieRoutes = require('./routes/movies'); //get movie router from routes folder
const db = require('./db');//get databse configuration from db.js

//app uses and sets 
const app = express(); //Creates Express application
app.use(express.static(path.join(__dirname, "/public"))); //css path
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views")); //templates in the view folder
app.use(express.urlencoded({ extended: true })); //middleware for parsing url data
app.use(express.json());
app.use(session({ secret: "YourSecretsAreSafeWithMe" })); //using user sessions 
app.use(morgan("dev")); //useful logging tool shows whether get or post method and ms

//app.use(session(sessionConfig));
app.use(passport.initialize());// creating sessions
app.use(passport.session());
//passport.use(new LocalStrategy)
app.use(flash());

app.use((req, res, next) => {//flash middleware
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
})

const requireLogin = (req, res, next) => {//middleware for checking if the route requires a login
	if (!req.session.user_id) {
		return res.redirect("/login");
	}
	next();
};//end of require login middleware

//********************LOGIN, Logout AND RESGISETER ROUTES GET AND POST

app.get(["/", "/login"], (req, res) => {//two urls work for login
	res.render("users/login.ejs");
	// res.render("movies/movies.ejs")
	// res.redirect("/movies")//***************** For Development purposes change later
});

app.post("/login", async (req, res) => {
	const { username, password } = req.body;//get form data 
	let sql = "SELECT * FROM user where username = ?"; //find specific user 

	db.query(sql, [username], async function  (err, result){//look for username 
		if (result.length == 0) { //username does not exist error
			console.log("Username does not exist")
			req.flash('error', 'Username does not exist');
			res.redirect('/login');
		} else {//username exists
			if(err) throw err;
			console.log(result)
			let hashPassword = result[0].password;
			let user = result[0];
			//compare password to databse (next line)
			const validPassword = await bcrypt.compare(password, hashPassword );
			console.log(hashPassword)
			console.log(validPassword)

			if (validPassword) { //check if username's password same as hashed password 
				if (err) throw err;
				req.session.user_id = user.user_id; //stores user id for the session to stay logged in 
				console.log("username and password is valid")
				req.flash('success', 'Successfully Logged In');
				res.redirect('/movies');//login and show list of movies 
			} else { // password invalid throw error
				if (err) throw err;
				console.log("Invalid username and password")
				req.flash('error', 'Invalid username or password');
				res.redirect('/login')
			}
		}//end of else statement if username exists
	});//end of sql query 
});// end of login route
	
app.get("/register", async (req, res) => {
	res.render("users/register");
});

app.post("/register",async (req, res) => {//check entered data and see if user exists
	const { name, username, password, passconfirm } = req.body;
	const hash = await bcrypt.hash(password, 12);
	console.log("Password is: " + hash)
	
	var sql_SEARCH = "SELECT * FROM user WHERE username = ?";
	var sql_INSERT = "INSERT INTO user (name, username, password) VALUES (?,?,?)";

	if (password == passconfirm) {// if all fields are filled in form
		db.query(sql_SEARCH, [username], function(err, result){// search if user exists
			if (err) throw err;
			if (result.length >0 ) {//username already exists
				req.flash('error', 'Username already exists');
				res.render('users/register.ejs');//re-render the register page
			} else {
				db.query(sql_INSERT, [name, username, hash], function(err, result) {//create new user
					if (err) throw err;
					console.log("Number of records inserted: " + result.affectedRows);
					console.log(result)
					res.redirect('/login');
				});//end of query insert new user
			}
		});//end of searching for if user exists 
	} else {
		console.log("the password and confirm do not match up")
		req.flash('error', 'the passwords are not the same');
		res.render('users/register.ejs');//re-render the register page
	}
});//end of register route 

app.get('/logout', (req,res) => {
	req.flash('success', 'Successfully logged out!');
	req.session.user_id = null;
	req.session.destroy();
	res.redirect('/login')
})

app.use('/movies' ,requireLogin, movieRoutes);//gets movie routes from separate file

//************************test routes---------------------------------------------------------
app.get("/secret", requireLogin, (req, res) => {
	res.send("secret");
});

app.get("/topsecret", requireLogin, (req, res) => {
	res.send("TOP SECRET!!!");
});

app.use((err, req, res, next) => {
	console.log("***************************");
	console.log("**********ERROR***********");
	console.log("******************************");
	console.log(err);
	next(err);
});

app.all("*", (req, res) => {
	//not sure what this does
	res.status(404).send("<h1>resource not found =(</h1>");
}); //when no routes match

app.listen(8080, (err) => {
	//listens for connections/requests
	if (err) console.log(err);
	console.log("Server started on port 8080 [http://localhost:8080/]");
});//running the server route port 8080
