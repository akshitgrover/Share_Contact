module.exports = function (req, res, next) {
  var token;
  console.log(req.headers);
  if (req.headers && req.headers.authorization) {
    console.log("Token In Headers!");
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0],
        credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return res.json(401, {err: 'Format is Authorization: Bearer [token]'});
    }
  } else if (req.param('token')) {
    console.log("Token passed as parameters!");
    token = req.param('token');
    // We delete the token from param to not mess with blueprints
    delete req.query.token;
  } else {
    console.log('Error!');
    req.session.flash={err: 'You Don\'t Have A Token!'};
    return res.redirect('/');
  }

  jwt.verify(token, function (err, token) {
    req.session.flash={err: 'Invalid Token! Please Login Again!'};
    if (err) return res.redirect('/');
    req.token = token; // This is the decrypted token or the payload you provided
    next();
  });
};