const express = require('express');
const bcrypt = require('bcryptjs');
//  local imports
const Users = require('./users-models');
const { restrict } = require('../middlewares/auth');
// set up routes
const router = express.Router();

router.get('/users', restrict(), async (req, res, next) => {
	try {
		res.json(await Users.find());
	} catch (err) {
		next(err);
	}
});

router.post('/users', async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const user = await Users.findBy({ username }).first();

		if (user) {
			return res.status(409).json({
				message: 'Username is already taken',
			});
		}

		const newUser = await Users.add({
			username,
			// hash the password with a time complexity of "10"
			password: await bcrypt.hash(password, 14),
		});

		res.status(201).json(newUser);
	} catch (err) {
		next(err);
	}
});

router.post('/login', async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const user = await Users.findBy({ username }).first();

		if (!user) {
			return res.status(401).json({
				message: 'Invalid Credentials',
			});
		}
		// check that the password is valid
		// compare plain text password from req body to the hash we have stored
		const passwordValid = await bcrypt.compare(password, user.password);

		if (!passwordValid) {
			return res.status(401).json({
				message: 'Invalid Credentials',
			});
		}

		// create new session for the user
		req.session.user = user;

		res.json({
			message: `Welcome ${user.username}!`,
		});
	} catch (err) {
		next(err);
	}
});

router.get('/logout', restrict(), async (req, res, next) => {
	try {
		req.session.destroy((error) => {
			if (error) {
				next(error);
			} else {
				res.status(204).end();
			}
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
