const testFile = require("../datasets/giothub_repo_sample.json");
const config = require("../config/default.json");
const fs = require('fs');
const fetch = require("node-fetch");
const { URL, URLSearchParams } = require('url');

const RepoModel = function(repo){
  this.version = repo.version;
};
let uri = null;
const baseURL = 'https://api.github.com/orgs/zaiusinc/repos';
let options = {
  method: 'GET',
  qs: {
    access_token: config.token
  },
  page: {
    page: 1,
    per_page: 1
  },
  headers: {
    'User-Agent': 'Request-Promise',
    'Accept': 'application/vnd.github.v3+json'
  },
  json: true // Automatically parses the JSON string in the response
};

let nodes = [];
let links = [];

RepoModel.updateRepoList = function updateRepoList(result) {
  // start the github scrape...
  buildURI(baseURL);
  getRepos(uri);
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

function getRepos(builtURI) {
  let r1 = "";
  fetch(builtURI, options)
    .then(function(res) { return res; })
    .then(function(resJson) {
      resJson.json()
        .then(function(data) {
          // console.log(data)
          createNodesFromResponse(data);
          for (let pair of resJson.headers.entries()) {
            if(pair[0] == 'link') {
              if(headerContainsNext(pair[1])) {
                buildURI(baseURL, options.page.page);
                getRepos(uri);
                if(options.page.page % 10 == 1) {
                  console.log(JSON.stringify(nodes));
                }
              }
              if(!headerContainsLast(pair[1])) {
                createLinksFromNodes();
                writeContentToFile({nodes: nodes, links: links});
                resetPage();
                console.log(options);
              }
            }
          }
        })
        .catch(function(e) {console.log('JSON ERROR!!!!'); console.log(e); });
    })
    .catch(function(e) {console.log('ERROR!!!!'); console.log(e); })
};

function headerContainsNext(key) {
  return (key.indexOf('next') > -1);
}

function headerContainsLast(key) {
  return (key.indexOf('last') > -1);
}

function createNodesFromResponse(response) {
  console.log(nodes.length);
  for(var i = 0; i < response.length; i++) {
    nodes.push({
      id: response[i].name,
      group: 2,
      size: response[i].size
    });
  }
}

// this is a temporary function as the links will be
// created using the scrape content function
function createLinksFromNodes() {
  console.log('LINKS: (nodes.length) '+nodes.length);
  for(var i = 0; i < nodes.length; i++) {
    if(i > 0 && i <= nodes.length) {
      links.push({
        source: nodes[i-1].id,
        target: nodes[i].id,
        value: 4
      });
    }
  }
}

function writeContentToFile(content) {
  console.log('writing content...');
  console.log(content);
  fs.writeFile("./datasets/repos.json", JSON.stringify(content), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    console.log("File has been created");
  });
}

function buildURI(baseURL, page = 1) {
  uri = new URL(baseURL);
  uri.search = new URLSearchParams({
    page: page,
    per_page: options.page.per_page,
    access_token: options.qs.access_token
  });
  incrementPage();
}

function incrementPage() {
  options.page.page += 1;
}

function resetPage() {
  options.page.page = 1;
}

module.exports = RepoModel;