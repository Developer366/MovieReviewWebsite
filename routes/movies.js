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
	let sql = "SELECT * FROM movie_rating where user_id = (?) ORDER BY rating DESC";

	db.query(sql, [req.session.user_id], (err, result, fields) => {
		if (err) console.log(err);
		console.log(result)
		let data = result;
		console.log(result)
		res.render('movies/list_reviews', {data: data});
	});
	
	// res.render("HI mate");
}); //end of get List of Movie Reviews from user

router.get('/delete/:RatingID', (req, res) => {
	const { RatingID } = req.params;
	let sql = "DELETE FROM movie_rating WHERE user_id = ? AND rating_id = ?";
	console.log(RatingID + "," + sql)

	db.query(sql, [req.session.user_id, RatingID], (err, result, fields) => {
		if (err) console.log(err);
		console.log(sql)
		console.log("deleted movie_rating from database =) redirecting now")
		
	});
	req.flash('success', 'Successfully deleted movie rating')
	res.redirect('/movies/ListMovieReviews');
});

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
	
	//search user id and movie_id to check for duplicates 
	let sql_SEARCH ="SELECT * FROM movie_rating where user_id = (?) AND movie_id = (?)"; 
	let sql_INSERT = "INSERT INTO movie_rating (user_id, movie_id, movie_title, rating) VALUES (?,?,?,?)";

	db.query(sql_SEARCH, [req.session.user_id, id], (err, result, fields) =>{// search for user_id and movie_id
		if (result.length > 0) {//if there is 1 or more movie reviews 
			console.log(sql_SEARCH)
			req.flash('error', 'Movie Review Already exists!');
			//res.render('movies/rate_movie');
			// let url = "/movies/${}"
			res.redirect(`/movies/${id}`);
		} else {
			db.query(sql_INSERT, [req.session.user_id, id, title, movie_rating], (err, result, fields) =>{
				if (err) console.log(err);
				console.log(sql_INSERT)
				console.log("Inserted rating into database =) redirecting now")
			});
			req.flash('success', 'Added a new movie review!');
			res.redirect('/movies/ListMovieReviews');
		}// end of else (result length not more than zero (0 or below))
	}) //end of search movie_rating query
});//end of post movie review route 


module.exports = router;
