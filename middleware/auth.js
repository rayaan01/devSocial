const jwt = require('jsonwebtoken');
const config = require('config');

const auth = (req, res, next) => {

    const token = req.header('auth-token');

    if(!token)
        return res.status(401).json({ msg: 'No token , authorization denied'});

    try{
        const decoded = jwt.verify(token, config.get('JWTsecret'));
        req.user = decoded.user;
        next();
    }
    catch(err){
        res.status(401).json({ msg: 'Token is not valid'});
    }
};

module.exports = auth;