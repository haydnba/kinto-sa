function main() {
  // Mozilla demo server (flushed every day)
  var server = "https://kinto.dev.mozaws.net/v1";
  // Simplest credentials ever.
  var authorization = "Basic " + btoa("token:mysecret");

  // Kinto bucket/collection.
  var bucket = "default";
  // var url = `${server}/buckets/${bucket}/collections/${collection}/records`;

  // Resuable HTTP headers.
  var headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": authorization,
  };

  // Get records from server on load.
  // fetch(url, {
  //   method: "GET", headers: headers
  // }).then(function(response) {
  //   return response.json();
  // }).then(function(data) {
  //   console.log(data);
  // }).catch(function() {
  //   console.log("Booo");
  // });

  // Populate collection options in new snippet form.
  var url = `${server}/buckets/${bucket}/collections`;
  fetch(url, {
    method: "GET", headers: headers
  }).then(function(response) {
    return response.json();
  }).then(function(x) {
    let collections = document.forms.new_snippet_form.collection;
    for(i = 0; i < x.data.length; i++) {
      let option = document.createElement("option");
      let readable = document.createTextNode(x.data[i].id);
      option.value = x.data[i].id;
      option.appendChild(readable);
      collections.appendChild(option);
      // console.log(x.data[i].id);
    }
  });

  // Make a snippet object on form submit.
  var form = document.forms.new_snippet_form;
  var makeBody = data => JSON.stringify({data: data});
  form.addEventListener("submit", makeSnippet, false);
  function makeSnippet() {
    event.preventDefault();
    let collection = form.collection.value ? form.collection.value : form.new_collection.value;
    let url = `${server}/buckets/${bucket}/collections/${collection}/records`;
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
    }).catch(function() {
      console.log("Booo");
    });
  };


  // Create marker on double-click.
  // map.on('dblclick', function(event) {
  //   // POST the record on server.
  //   var body = JSON.stringify({data: {latlng: event.latlng}});
  //   fetch(url, {method: "POST", body: body, headers: headers})
  //     .then(function (response) {
  //       return response.json();
  //     })
  //     .then(function (result) {
  //       // Add marker to map.
  //       addMarker(result.data);
  //     });
  // });


}

window.addEventListener("DOMContentLoaded", main);
