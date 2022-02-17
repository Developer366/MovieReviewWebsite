//https://gist.github.com/prof3ssorSt3v3/d7946ea634448c501dd8287cbe3f2c0b
const axios = require("axios");// make server side requests
const express = require("express");
const router = express.Router();
const db = require("../db");
const bodyParser = require('body-parser');

const API_KEY = "56de9db363183b7eef149e09a75ffc8a";
let BASE_URL = "https://api.themoviedb.org/3/";
const IMG_URL = "https://image.tmdb.org/t/p/w500"; //url movie posters
const SEARCH_URL = "https://api.themoviedb.org/3/search/movie?api_key=";
// https://api.themoviedb.org/3/search/movie?api_key=56de9db363183b7eef149e09a75ffc8a&language=en-US&query=avengers&page=1&include_adult=false

// Main Home Page (if movies then list movies with navbar)
router.get('/', (req, res) => {
	let url = "".concat(BASE_URL, "movie/now_playing?api_key=", API_KEY, "&language=en-US&page=1");
	// let url = "https://api.themoviedb.org/3/movie/now_playing?api_key=56de9db363183b7eef149e09a75ffc8a&language=en-US&page=1";
	console.log(url)
	
	axios.get(url)
	.then(response => {
		let data = response.data.results;
		console.log(data)
		res.render('movies/movies', { 
			data: data,
			IMG_URL: IMG_URL
		 })
	})
	.catch(function (error) {
		console.log(error);
	  })
})//end of movies home page route

router.get('/search', (req, res) => {
	const {query} = req.query;
	console.log(query)
	let url = "".concat(SEARCH_URL, API_KEY, "&language=en-US&query=", query, "&page=1&include_adult=false");
	// let url ='https://api.themoviedb.org/3/search/movie?api_key=56de9db363183b7eef149e09a75ffc8a&language=en-US&query=avengers&page=1&include_adult=false';

	// https://api.themoviedb.org/3/search/movie?api_key=56de9db363183b7eef149e09a75ffc8a&language=en-US&john wick&page=1&include_adult=false
	console.log(url)

	axios.get(url)
	.then(response => {
		let data = response.data.results;
		console.log(data)
		res.render('movies/movies', {
			data: data,
			IMG_URL: IMG_URL
		})
	})
	.catch(function (error) {
		console.log(error);
	  })
})//end of search movie route

router.get('/ListMovieReviews', (req, res) => {
	let sql = "SELECT * FROM movie_rating where user_id = (?)";

	db.query(sql, [req.session.user_id], (err, result, fields) => {
		if (err) console.log(err);
		console.log(result)
		let data = result;
		console.log(result)
		res.render('movies/list_reviews', {data: data});
	});
	
	// res.render("HI mate");
}); //end of get List of Movie Reviews from user

// https://api.themoviedb.org/3/search/movie?api_key=56de9db363183b7eef149e09a75ffc8a&language=en-US&query=avengers&page=1&include_adult=false

//get specific movie to rate
router.get('/:id', (req, res) => {
	const { id } = req.params;
	console.log(id)
	let url = "".concat(BASE_URL, "movie/", id, "?api_key=", API_KEY, "&language=en-US")
	console.log(url)
	//https://api.themoviedb.org/3/movie/33?api_key=56de9db363183b7eef149e09a75ffc8a&language=en-US
	//https://api.themoviedb.org/3/movie33?api_key=56de9db363183b7eef149e09a75ffc8a&language=en-US
	axios.get(url)
	.then(response => {
		let data = response.data;
		console.log(data)
		res.render('movies/rate_movie', { 
			data : data,
			IMG_URL: IMG_URL })
	})
	.catch(function (error) {
		console.log(error);
	})
})// end of route that gets one movie to make a review

//submit the rating for the movie
router.post("/:id/:title", (req, res) => {//   "/":id/rateMovie"
	//route that rates the selected movie INSERT RATING
	const { id } = req.params;
	const { title } = req.params;
	const { movie_rating } = req.body; //gets rating from form from template
	// let sql = `INSERT INTO movie_rating (movie_id, user_id, rating) VALUES ('${req.params.id}' , '1' , '${movie_rating}')`; //demo purposes user Id is 1
	// let sql = `INSERT INTO movie_rating (user_id, movie_id, movie_title, rating) VALUES ('1', '565', 'Inception', '9.5')`;
	// let sql = `INSERT INTO movie_rating (user_id, movie_id, movie_title, rating) VALUES ('${req.session.user_id}', '${id}', '${title}', '${movie_rating}')`;
	let sql = "INSERT INTO movie_rating (user_id, movie_id, movie_title, rating) VALUES (?,?,?,?)";

	db.query(sql, [req.session.user_id, id, title, movie_rating], (err, result, fields) => {
		if (err) console.log(err);
		//console.log(JSON.stringify(result));
		console.log(sql)
		console.log("Inserted rating into database =) redirecting now")
		
	});
	res.redirect('/movies/ListMovieReviews');
});

router.delete('/:id', (req, res) => {
	
})


module.exports = router;
