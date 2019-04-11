'use strict';
module.exports = function(app) {
  var repo = require('../controller/RepoController');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  /***
   * Repos
   */
  app.route('/repo').get(repo.getRepoList);
  app.route('/repo/update').get(repo.updateRepoList);
  // app.route('/repo/:version').post(rageQuit.get_all_rage_quitters);
};