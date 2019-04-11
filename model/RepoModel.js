var testFile = require("../datasets/giothub_repo_sample.json");
var config = require("../config/default.json");
var fs = require('fs');

var RepoModel = function(repo){
  console.log(repo);
  this.version = repo.version;
};

var options = {
  uri: 'https://api.github.com/orgs/zaiusinc/repos?page=1&per_page=100',
  qs: {
    access_token: config.token
  },
  headers: {
    'User-Agent': 'Request-Promise',
    'Accept': 'application/vnd.github.v3+json'
  },
  json: true // Automatically parses the JSON string in the response
};

RepoModel.updateRepoList = function updateRepoList(result) {
  // start the github scrape...
  console.log(options);
  getRepos();
  result(null, 'This feature is not yet implemented!!!');
};

RepoModel.getRepoList = function getRepoList(result) {
  fs.readFile('./datasets/repos.json', (e, data) => {
    if (e) {
      result(e, null)
    } else {
      result(null, JSON.parse(data));
    }
  });
};

function getRepos() {
  let r1 = "";
  const parsed = parseResponse(testFile);
  console.log(parsed);

  writeContentToFile(parsed);
  // await req(this.options)
  //   .then(function (repos) {
  //    const parsed = parseResponse(testFile);
  //    console.log(parsed);
  //    writeContentToFile(parsed);
  //   })
  //   .catch(function (err) {
  //     console.log(err);
  //   });
};

function parseResponse(testing) {
  var nodes = [];
  var links = [];
  for(var i = 0; i < testing.length; i++) {
    nodes.push({
      id: testing[i].name,
      group: 2,
      size: testing[i].size
    });
    if(i > 1 && i <= testing.length) {
      links.push({
        source: testing[i-1].name,
        target: testing[i].name,
        value: 4
      });
    }
  }
  return {nodes: nodes, links: links};
};

function writeContentToFile(content) {
  fs.writeFile("./datasets/repos.json", JSON.stringify(content), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    console.log("File has been created");
  });
}

module.exports = RepoModel;