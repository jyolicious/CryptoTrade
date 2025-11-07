const jwt = require('jsonwebtoken');
module.exports = function(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};
