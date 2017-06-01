

// Mozilla demo server (flushed every day)
var server = "https://kinto.dev.mozaws.net/v1";

// Simplest credentials ever.
var authorization = "Basic " + btoa("token:mysecret");

// Storage URL.
var bucket = "default";
var base_url = `${server}/buckets/${bucket}/collections`;

// Resuable HTTP headers.
var headers = {
  "Accept": "application/json",
  "Content-Type": "application/json",
  "Authorization": authorization,
};

// JSON body maker function:
function makeBody(data) {
  return JSON.stringify({data: data});
}


function indexMain() {

  // HTML Entities:
  var header = document.getElementsByTagName("header")[0];
  var form = document.forms[0];
  var recents = document.getElementById("recent_snippets");

  // Load collections; Populate snippet form options and nav menus.
  // Load collection records; Populate snippets list.
  fetch(base_url, {
    method: "GET",
    headers: headers
  }).then(function(response) {
    return response.json();
  }).then(function(data) {
    form.appendChild(populateOptions(data));
    header.appendChild(populateMenus(data));
    recents.appendChild(getRecords(data));
  }).catch(function(error) {
    console.log(error.message);
  });

  function getRecords(data) {
    let articles = document.createElement("section");
    var collections = data.data;
    for (var i = 0; i < collections.length; i++) {
      let url = `${base_url}/${collections[i].id}/records`;
      let collection = collections[i].id;
      fetch(url, {
        method: "GET",
        headers: headers
      }).then(function(response) {
        return response.json();
      }).then(function(records) {
        let element = listRecords(collection, records);
        articles.appendChild(element);
      }).catch(function(error) {
        console.log(error.message);
      });
    }
    articles.setAttribute("id", "articles");
    return articles;
  }

  // Template function for snippet form > collection options list.
  function populateOptions(x) {
    let element = document.createElement("datalist");
    let options = [];
    let i = -1;
    while (++i < x.data.length) {
      options[i] = `<option value="${x.data[i].id}" />`;
    }
    element.innerHTML = options.join("\n");
    element.setAttribute("id", "optionsList");
    return element;
  }

  // Template function for index navigation > collections menu.
  function populateMenus(x) {
    let element = document.createElement("nav");
    let links = [];
    let i = -1;
    while (++i < x.data.length) {
      links[i] = `<li><a href="#">${x.data[i].id}</a></li>`;
    }
    element.innerHTML = `<ul>${links.join("\n")}</ul>`;
    return element;
  }

  //Template function for index page records list view.
  function listRecords(collection, x) {
    let element = document.createElement("article");
    let records = [];
    let snippet, id = "";
    let i = -1;
    while (++i < x.data.length) {
      if (x.data[i].status == "visible") {
        id = x.data[i].id;
        snippet = x.data[i].snippet;
        records[i] = `<li class="snippetList">
                      <a href="detail.html?${collection}:${id}">
                      <span>Snippet: </span><code>${snippet}</code>
                      </a>
                      </li>`;
        element.innerHTML = `<ul>${records.join("\n")}</ul>`;
      }
    }
    element.setAttribute("name", collection);
    return element;
  }

  // Make a snippet object on form submit.
  var form = document.forms[0];
  form.addEventListener("submit", makeSnippet, false);
  function makeSnippet() {
    event.preventDefault();
    let collection = form.collection.value.replace(/ /g, "-");
    console.log(collection);
    let url = `${base_url}/${collection}/records`;
    let data = {};
    data.snippet = form.snippet.value;
    data.source = form.source.value;
    data.description = form.description.value;
    data.status = form.status.value;
    fetch(url, {
      method: "POST",
      headers: headers,
      body: makeBody(data)
    }).then(function(response) {
      console.log(response);
      return response.json();
    }).catch(function(error) {
      console.log(error.message);
    });
  };

}

function detailMain() {

  var query = window.location.search.replace("?", "").split(":");
  var form = document.forms[0];
  var update = document.getElementById("update")
  update.addEventListener("click",
    function(event) {
      event.preventDefault();
      updateRecord(query)
    }, false);

  (function retrieveRecord(array) {
    let url = `${base_url}/${array[0]}/records/${array[1]}`;
    let nodes = [];
    fetch(url, {
      method: "GET",
      headers: headers
    }).then(function(response) {
      return response.text();
    }).then(function(record) {
      nodes = formatRecord(record);
      console.log(nodes);
      let i = -1;
      while (++i < nodes.length) {
        let temp = nodes[i];
        console.log(temp);
        if (form.elements[temp[0]]) {
          let node = document.createTextNode(temp[1]);
          console.log(node);
          form.elements[temp[0]].appendChild(node);
        }
      }
    }).catch(function(error) {
      console.log(error.message);
    });
  }(query));

  function formatRecord(string) {
    // console.log(string);
    let text = string.replace(/\"data\":|\"|{|}/g, "");
    // console.log(text);
    let array = text.split(",").slice(0, -1);
    // console.log(array);
    let nodes = [];
    let i = -1;
    while (++i < array.length) {
      // console.log(array[i]);
      data = array[i].split(":");
      // console.log(data);
      nodes.push(data);
    }
    // console.log(nodes);
    return nodes;
  }

  function updateRecord(array) {
    let url = `${base_url}/${array[0]}/records/${array[1]}`;
    console.log(url);
    let data = {};
    data.snippet = form.snippet.value;
    data.source = form.source.value;
    data.description = form.description.value;
    console.log(data);
    fetch(url, {
      method: "PATCH",
      headers: headers,
      body: makeBody(data)
    }).then(function(response) {
      console.log(response);
      return response.json();
    }).catch(function(error) {
      console.log(error.message);
    });
  }

  // var form = document.forms[0];
  // form.addEventListener("submit", makeSnippet, false);
  // function makeSnippet() {
  //   event.preventDefault();
  //   let collection = form.collection.value.replace(/ /g, "-");
  //   console.log(collection);
  //   let url = `${base_url}/${collection}/records`;
  //   let data = {};
  //   data.snippet = form.snippet.value;
  //   data.source = form.source.value;
  //   data.description = form.description.value;
  //   data.status = form.status.value;
  // };


  // function getRecord() {
  //   let url = `${base_url}/${collection}/records/${record_id}`;
  //   fetch(url, {
  //     method: "GET",
  //     headers: headers
  //   }).then(function(response) {
  //     return response.json();
  //   }).then(function(data) {
  //     console.log(data);
  //     form.appendChild(viewRecord(data));
  //   }).catch(function(error) {
  //     console.log(error.message);
  //   });
  // }
  //
  // function viewRecord(x) {
  //   let element = document.createElement("form");
  //   let nodes = {};
  //   for (item in x.data) {
  //     console.log(item);
  //     nodes[item] = `<p><textarea id="${item}" name="${item}">${x.data[item]}</textarea></p>`;
  //   }
  //   let array = Object.keys(nodes).map(key => nodes[key]);
  //   console.log(array);
  //   element.innerHTML = array.join("\n");
  //   return element;
  // }




}


function router() {
  let url = window.location.pathname;
  let file = url.substring(url.lastIndexOf("/")+1);
  switch(file) {
    case "index.html":
    return indexMain();
    break;
    case "detail.html":
    return detailMain();
    break;
  }
}

window.addEventListener("DOMContentLoaded", router);
