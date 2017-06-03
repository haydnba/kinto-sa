

// Mozilla demo server (flushed every day):
var server = "https://kinto.dev.mozaws.net/v1";

// Simplest credentials ever:
var authorization = "Basic " + btoa("token:mysecret");

// Storage URL:
var bucket = "default";
var base_url = `${server}/buckets/${bucket}/collections`;

// Resuable HTTP headers:
var headers = {
  "Accept": "application/json",
  "Content-Type": "application/json",
  "Authorization": authorization,
};

// JSON request body function:
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
    location.reload(true);
  };

}

////////////////////////////////////////////////////////////////////////////////

function detailMain() {

  var query = window.location.search.replace("?", "").split(":");
  document.getElementById("record_id").innerHTML = query[1];
  document.getElementById("collection").innerHTML = query[0];
  var preview = document.getElementsByTagName("section")[1];
  var editor = document.getElementsByTagName("section")[2];
  var edit = document.getElementById("edit");
  edit.addEventListener("click",
    function(event) {
      event.preventDefault();
      let style = editor.style.display;
      console.log(style);
      let command = edit.innerHTML;
      console.log(command);
      if (style == "none") {
        editor.style.display = "block";
        preview.style.display = "none";
        edit.innerHTML = "Close Editor";
        dele.style.display = "none";
      } else {
        editor.style.display = "none";
        preview.style.display = "block";
        edit.innerHTML = "Edit Record";
        dele.style.display = "inline";
      }
    }, false);
  var form = document.forms[0];
  var update = document.getElementById("update");
  update.addEventListener("click",
    function(event) {
      event.preventDefault();
      updateRecord(query);
    }, false);
  var dele = document.getElementById("delete");
  dele.addEventListener("click",
    function(event) {
      event.preventDefault();
      deleteRecord(query);
    }, false);


  // Hide record editor form on document load:
  (function hideEditor() {
    editor.style.display = "none";
  }());

  (function retrieveRecord(array) {
    let url = `${base_url}/${array[0]}/records/${array[1]}`;
    let article = "";
    let nodes = [];
    fetch(url, {
      method: "GET",
      headers: headers
    }).then(function(response) {
      return response.json();
    }).then(function(record) {
      article = previewRecord(record);
      nodes = formatRecord(record);
      console.log(article);
      preview.appendChild(article);
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

  function formatRecord(object) {
    console.log(object);
    let array = [];
    for (item in object.data) {
      console.log(item);
      array.push([item, object.data[item]])
      console.log(array);
    }
    return array;
  }

  function previewRecord(object) {
    let element = document.createElement("article");
    let nodes = {};
    for (item in object.data) {
      console.log(item);
      nodes[item] = `<p>${item}: <span id="${item}" name="${item}" class="${item}">${object.data[item]}</span></p>`;
    }
    let array = Object.keys(nodes).map(key => nodes[key]);
    console.log(array);
    element.innerHTML = array.join("\n");
    return element;
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
    location.reload(true);
  }

  function deleteRecord(array) {
    let url = `${base_url}/${array[0]}/records/${array[1]}`;
    let confirm = prompt("Enter snippet ID to delete:");
    console.log(form.elements["id"]);
    if (confirm == array[1]) {
      fetch(url, {
        method: "DELETE",
        headers: headers,
      }).then(function(response) {
        console.log(response);
        return response.json();
      }).catch(function(error) {
        console.log(error.message);
      });
    }
    // location.assign(index.html);
  }


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
    case "list.html":
    return listMain();
  }
}

window.addEventListener("DOMContentLoaded", router);
