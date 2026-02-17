const jwt = require('jsonwebtoken');
const { getProdConnection } = require('../config/db');
const { getModels } = require('../models/ModelFactory');
// remove static User import

const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Retrieve User from Production DB (Authentication always happens against Prod)
        // Or if we want strict isolation, we check where they claim to be?
        // No, simpler: All users logic lives in Prod for Authentication purposes.
        // OR: We check Prod first.

        const prodConn = getProdConnection();
        if (!prodConn) {
            throw new Error('Database not initialized');
        }
        const { User } = getModels(prodConn);

        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { protect };
