function main() {
  // Mozilla demo server (flushed every day)
  var server = "https://kinto.dev.mozaws.net/v1";
  // Simplest credentials ever.
  var authorization = "Basic " + btoa("token:mysecret");

  // Kinto bucket/collection.
  var bucket = "default";
  var base_url = `${server}/buckets/${bucket}/collections`;
  // var records_url = `/${collection}/records`;

  // Resuable HTTP headers.
  var headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": authorization,
  };

  // HTML Entities:
  var form = document.forms[0];
  var section = document.getElementById("recent_snippets");

  // Load collections; Populate snippet form options.
  // Load collection records; Populate snippets list.
  fetch(base_url, {
    method: "GET",
    headers: headers
  }).then(function(response) {
    return response.json();
  }).then(function(data) {
    form.insertBefore(populateOptions(data), form.childNodes[1]);
    section.appendChild(getRecords(data));
  }).catch(function(error) {
    console.log(error.message);
  });

  function getRecords(data) {
    let articles = document.createElement("section");
    var collections = data.data;
    for (var i = 1; i < collections.length; i++) {
      let url = `${base_url}/${collections[i].id}/records`;
      let collection = collections[i].id;
      // console.log(collection);
      fetch(url, {
        method: "GET",
        headers: headers
      }).then(function(response) {
        return response.json();
      }).then(function(records) {
        // console.log(url);
        let element = listRecords(collection, records);
        articles.appendChild(element);
        // console.log(element);
        // articles.push(element);
        console.log(articles);
      }).catch(function(error) {
        console.log(error.message);
      });
    }
    return articles;
  }

  // Template function for collection options list in snippet form.
  function populateOptions(x) {
    let element = document.createElement("select");
    let options = [`<option value=""></option>`];
    for (i = 0; i < x.data.length; i++) {
      options[i+1] = `<option value="${x.data[i].id}">${x.data[i].id}</option>`
    }
    element.setAttribute("name", "collection")
    element.innerHTML = options;
    return element;
  }

  //Template function for index page records list view.
  function listRecords(collection, x) {
    let element = document.createElement("article");
    let records = [];
    let snippet, id = "";
    for (i = 0; i < x.data.length; i++) {
      if (x.data[i].status == "visible") {
        id = x.data[i].id;
        snippet = x.data[i].snippet;
        records[i] = `<li><code id="${id}">${snippet}</code></li>`
      }
    }
    element.innerHTML = `<ul>${records.join("\n")}</ul>`;
    element.setAttribute("name", collection);
    return element;
  }


  // Make a snippet object on form submit.
  var form = document.forms.new_snippet_form;
  var makeBody = data => JSON.stringify({data: data});
  form.addEventListener("submit", makeSnippet, false);
  function makeSnippet() {
    event.preventDefault();
    let collection = form.collection.value ? form.collection.value : form.new_collection.value;
    let url = base_url + "/" + collection + "/records";
    let data = {};
    data.snippet = form.snippet.value;
    data.source = form.source.value;
    data.description = form.description.value;
    data.status = form.status.value;
    // alert("collection is: " + collection + " and " + makeBody(data));
    fetch(url, {
      method: "POST", headers: headers, body: makeBody(data)
    }).then(function(response) {
      return response.json();
    }).then(function(data) {
      console.log(data);
    }).catch(function(error) {
      console.log(error.message);
    });
  };

}

window.addEventListener("DOMContentLoaded", main);
