const passport = require('passport')
const jwt = require('jsonwebtoken')

exports.requireAuth = passport.authenticate('jwt', {
    session: false
});

exports.checkPublicToken = () => (req, res, next) => {

    jwt.sign({ module: 'voucher' }, "AWRROSTAMANISECRETKEY", function(err, token) {
        console.log("token", token);
      });
    
    let authorizationHeader = req.headers['authorization']
    if (authorizationHeader) {
        let token = authorizationHeader.replace(/Bearer/g, '').trim()
        jwt.verify(token, process.env.PUBLIC_JWT_SECRET, function (err, decoded) {
            if (err) {
                res.status(401).send('UNAUTHORIZED')
            }
            else {
                if (decoded.module == "voucher") {
                    //module name should be voucher in JWT
                    next();
                }
                else {
                    res.status(401).send('UNAUTHORIZED')
                }
            }

        })
    }
    else {
        res.status(401).send('UNAUTHORIZED')
    }

}
