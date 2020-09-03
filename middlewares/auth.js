const Users = require('../users/users-models');
const bcrypt = require('bcryptjs');

function restrict() {
	const authError = {
		message: 'Invalid Creds!',
	};
	return async (req, res, next) => {
		try {
			if (!req.session || !req.session.user) {
				return res.status(401).json(authError);
			}

			// * we know the user is authenticated
			next();
		} catch (err) {
			next(err);
		}
	};
}

module.exports = {
	restrict,
};
