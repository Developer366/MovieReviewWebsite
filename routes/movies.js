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

// https://api.themoviedb.org/3/search/movie?api_key=56de9db363183b7eef149e09a75ffc8a&language=en-US&query=avengers&page=1&include_adult=false

//get specific movie to rate
router.get("/:id", (req, res) => {
	//route that selects movie by id
	let sql = `SELECT * FROM movies WHERE movie_id = ${req.params.id}`;
	//let sql = 'SELECT * FROM movies WHERE movie_id = 1';
	db.query(sql, (err, result, fields) => {
		if (err) console.log(err);
		console.log(JSON.stringify(result));
		res.render("movies/rate_movie", { result });

		async function showMovies() {
			//home page for movies when you Login
			let url = "".concat(
				BASE_URL,
				"movie/now_playing?api_key=",
				API_KEY,
				"&language=en-US&page=1"
			);
			let response = await fetch(url);
			let data = await response.json();

			console.log(data);
			console.log(data.results); //get the results from fetch
			let movies = data.results;

			movies.forEach((movie) => {
				const { title, poster_path, vote_average, overview } = movie;
				const movieCard = document.createElement("div");
				movieCard.innerHTML = `
				<div>
					<h3>${title} </h3>
					<img src="${IMG_URL + poster_path}" alt="${title}" >
					<h2>${vote_average}</h2>
				</div>
				`;
				output.appendChild(movieCard);
			});
		} //end of shownowPLaying movies
	});
});

//submit the rating for the movie
router.post("/:id/rateMovie", (req, res) => {
	//route that rates the selected movie INSERT RATING
	const { movie_rating } = req.body; //gets rating from form from template

	let sql = `INSERT INTO ratings (movie_id, user_id, rating) VALUES ('${req.params.id}' , '1' , '${movie_rating}')`; //demo purposes user Id is 1

	db.query(sql, (err, result, fields) => {
		if (err) console.log(err);
		console.log(JSON.stringify(result));

		let sql = "SELECT * FROM ratings";

		db.query(sql, (err, result, fields) => {
			if (err) console.log(err);
			console.log(JSON.stringify(result));
			res.render("movies/movie_reviews", { result });
		});
	});
});

router.get("listMovies", (req, res) => {});

module.exports = router;
