require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
// import DB and routes
const db = require('./database/config');
const usersRouter = require('./users/users-router');

// start stuff
const server = express();
const port = process.env.PORT || 7777;

server.use(helmet());
server.use(cors());
server.use(express.json());
// sessions
server.use(
	session({
		resave: false,
		saveUninitialized: false, //to comply with gdpr laws
		secret: process.env.KNEX_SESSION_SECRET,
		store: new KnexSessionStore({
			knex: db, // access to the database
			createtable: true, // if the session doesnt exist just make one
		}),
	})
);

// custom routes
server.use('/api', usersRouter);

// error handling
server.use((err, req, res, next) => {
	console.log(err);

	res.status(500).json({
		message: 'Something went wrong',
	});
});

// server listening
server.listen(port, () => {
	console.log(`Running at http://localhost:${port}`);
});
