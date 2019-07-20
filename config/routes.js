const axios = require('axios');
const bcrypt = require("bcryptjs");

const tokenService = require("../auth/tokenGen.js");
const Users = require("./routes-functions.js");

const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 16);
  user.password = hash;
  Users.add(user)
    .then(saved => {
      const token = tokenService.generateToken(user);
      res.status(201).json({ saved, message: `Registered, ${token}` });
    })
    .catch(error => {
      res.status(500).json({error, message: 'Error: Cannot register user.'});
    });
}


function login(req, res) {
  let { username, password } = req.body;
  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = tokenService.generateToken(user);
        res.status(200).json({
          message: `Welcome ${user.username}!, this is your`,
          token,
          roles: token.roles
        });
      } else {
        res.status(401).json({ message: "Invalid Credentials." });
      }
    })
    .catch(error => {
      res.status(500).json({error, message: '500 failure: Login'});
    });
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error: Cannot fetch Jokes.', error: err });
    });
}
