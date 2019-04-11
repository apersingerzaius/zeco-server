var repo = require('../model/RepoModel.js');

//repo endpoint
exports.getRepoList = function(req, res) {
  repo.getRepoList(function(err, repo) {
    if (err)
      res.send(err);
    res.send(repo);
  });
};

exports.updateRepoList = function(req, res) {
  repo.updateRepoList(function(err, repo) {
    if (err)
      res.send(err);
    res.send(repo);
  });
};

// exports.getRageQuitterByName = function(req, res) {
//   repo.getRageQuitterByName(req.params.player, function(err, rageQuitter) {
//     if (err)
//       res.send(err);
//     res.json(rageQuitter);
//   });
// };