const config = require("../config/default.json");
const fs = require('fs');
const fetch = require("node-fetch");
const { URL, URLSearchParams } = require('url');

const RepoModel = function(repo){
  this.version = repo.version;
};
let uri = null;
const baseURL = 'https://api.github.com/orgs/zaiusinc/repos';
const baseContentURL = 'https://api.github.com/repos/zaiusinc/'; // <project_name>/contents
const fileSearchArray = [];
let directorySearchArray = [];
const alreadySearchedDirs = [];
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
  console.log('Started get repos...');
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
  return fetch(builtURI, options)
    .then(function(res) { return res; })
    .then(function(resJson) {
      resJson.json()
        .then(function(data) {
          createNodesFromResponse(data);
          for (let pair of resJson.headers.entries()) {
            if(pair[0] == 'link') {
              if(headerContainsNext(pair[1])) {
                buildURI(baseURL, options.page.page);
                if(options.page.page % 10 == 1) {console.log(uri.href);}
                getRepos(uri);
              }
              if(!headerContainsLast(pair[1])) {
                resetPage();
                startScrape();
              }
            }
          }
        })
        .catch(function(e) {console.log('JSON ERROR!!!!'); console.log(e); });
    })
    .catch(function(e) {console.log('ERROR!!!!'); console.log(e); })
};

/**
 * This is the entry point for determining which files need to be extracted for
 * scraping
 *
 * @param directoryString
 */
function startScrape(directoryString = '') {
  //get the first node
  const sourceNode = nodes[0];
  const limit = 1;
  console.log('START SCRAPE')
  console.log('----------------------------------------------------');
  console.log(sourceNode.id + ' | ' + directoryString);
  buildURIForContentScrape(sourceNode.id, directoryString)
  console.log(uri.href);
  console.log('----------------------------------------------------');
  getContentRoot(uri);
}

/**
 * This will not start at merely the repo root, but the root passed in as
 * the contentURI. If nothing is passed in, we will default to the project
 * root.
 *
 * @param contentURI
 */
function getContentRoot(contentURI) {
  const currLength = directorySearchArray.length;
  const currDir = directorySearchArray[0];
  // const testURI = contentURI + (currLength > 0 ? directorySearchArray[0].directory_string : '');
  // console.log('GET CONTENT ROOT => ENTER LINES')
  // console.log(`Curr length: ${currLength}`);
  // console.log('---------------Dir Array----------------');
  // console.log(directorySearchArray);
  // console.log('--------------Alrdy Srchd---------------');
  // console.log(alreadySearchedDirs);
  // if(currLength > 0) {
  //   console.log(directorySearchArray[0]);
  // }
  // console.log(contentURI.href);
  // console.log('----------------------------------------------------');
  fetch(contentURI)
    .then(function(res) { return res; })
    .then(function(resJson) {
      resJson.json()
        .then(function(data) {
          const val = buildArraysForContentSearching(data);
          if(currLength > 0) {
            directorySearchArray.splice(directorySearchArray.indexOf(currDir),1);
            alreadySearchedDirs.push(currDir);
          }
          if(directorySearchArray.length > 0) {
            startScrape(directorySearchArray[0])
          } else {
            console.log('--------------Files to Srchd---------------');
            console.log(fileSearchArray);
          }
          // getContentRoot(contentURI);
        })
        .catch(function(e) {console.log('JSON ERROR!!!!'); console.log(e); });
    })
    .catch(function(e) {console.log('ERROR!!!!'); console.log(e); })
}

function buildArraysForContentSearching(data) {
  const length = data.length;
  let foundDir = false;
  console.log("Array length: " + length);
  for (let something of data) {
    if(something.type === 'file') {
      fileSearchArray.push({name: something.name, download_url: something.download_url})
    } else if(something.type ==='dir') {
      foundDir = true;
      const isAlreadySearched = directorySearchArray.includes(something.path);
      if(!isAlreadySearched) {
        directorySearchArray.unshift(something.path);
      }
      // directorySearchArray.push({directory_string: something.path});
    }
  }
  return foundDir;
}

function scrapeRepoContent() {
  //get the first node
  const sourceNode = nodes[0];
  const limit = 1;
  const contentURI = buildURIForContentScrape()
  fetch(builtURI, options)
    .then(function(res) { return res; })
    .then(function(resJson) {
      resJson.json()
        .then(function(data) {
          console.log(data)
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

function buildURIForContentScrape(projectName, directoryString) {
  const url = baseContentURL + `${projectName}/contents/${directoryString}`;
  uri = new URL(url);
  uri.search = new URLSearchParams({
    access_token: options.qs.access_token
  });
}

function incrementPage() {
  options.page.page += 1;
}

function resetPage() {
  options.page.page = 1;
}

module.exports = RepoModel;