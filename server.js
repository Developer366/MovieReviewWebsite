var http = require('http');  //now you can create a server
var mysql = require('mysql'); //now you can connect to mysql
const express = require('express'); //express  faremwork for making routes
const path = require("path");//helps create file paths
let ejs = require('ejs'); //Embedded JavaScript
//const hbs = require('express-handlebars');

const app = express(); //Creates Express application
app.use(express.static(path.join(__dirname, 'styles')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views')); //templates in the view folder

//app.engine('view engine', 'hbs');


//connect to mysql database------------------------------------------------------------
const db = mysql.createConnection({//connect to mysql database
  host: "127.0.0.1",
  user: "root",
  password: "password1234",
  database: "review_db"
});
db.connect((err)=> {//check if database connection is successful or there is an error
  if (err){
    console.log("ERROR -- connecting to the database!!");
    throw err;
  } 
  console.log("Database successfully Connected!! =)");
});


app.post('/login', function(request, response) {//route for login and authentication
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM users WHERE UserName = ? AND Password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/movies');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/', (req, res) =>{
  var movies = "SELECT * FROM movies";//select all movies
  db.query(movies, function (err, result, fields) {//WHERE movie_name = 'The Avengers'
    if (err) console.log(err);
    console.log(JSON.stringify(result));//result is an array of your data you get after a query
    res.render('movies.ejs', {result});//, { result }
    });
  });

app.get('/rate', (req,res)=>{

})

  
  

app.all('*', (req,res)=>{//not sure what this does
  res.status(404).send('<h1>resource not found</h1>')
})

app.listen(8080, (err)=>{//listens for connections/requests 
  if (err) console.log(err);
  console.log("Server started on port 8080");
});










//create and start the server 
/*
http.createServer(function (req, res) {//method, will be executed when someone tries to access the computer on port 8080.
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(req.url);
  res.end('Hello World! My Home!!!!');
  console.log("The server is running!");
}).listen(3000);
*/