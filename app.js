// 15-237 Homework 3 - Eebae Server

var express = require("express"); // imports express
var app = express();        // create a new instance of express

// imports the fs module (reading and writing to a text file)
var fs = require("fs");

// the bodyParser middleware allows us to parse the
// body of a request
app.use(express.bodyParser());

// The global datastore for all rooms
var rooms;

// Asynchronously read file contents, then call callbackFn
function readFile(filename, defaultData, callbackFn) {
  fs.readFile(filename, function(err, data) {
    if (err) {
      console.log("Error reading file: ", filename);
      data = defaultData;
    } else {
      console.log("Success reading file: ", filename);
    }
    if (callbackFn) callbackFn(err, data);
  });
}

// Asynchronously write file contents, then call callbackFn
function writeFile(filename, data, callbackFn) {
  fs.writeFile(filename, data, function(err) {
    if (err) {
      console.log("Error writing file: ", filename);
    } else {
      console.log("Success writing file: ", filename);
    }
    if (callbackFn) callbackFn(err);
  });
}

// get one item
app.get("/room/:id", function(request, response){
  var id = request.params.id;
  var room = rooms[id];
  response.send({
    room: room,
    success: true
  })
});

// create new item
app.post("/room", function(request, response) {
});

// update one item
app.put("/room/:id", function(request, response){
});

// delete entire list
app.delete("/room", function(request, response){
});


// This is for serving files in the static directory
app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});

app.get("/", function (request,response){
    response.sendfile("static/index.html");
})

function initServer() {
  // When we start the server, we must load the stored data
  var defaultList = "[]";
  readFile("data.txt", defaultList, function(err, data) {
    rooms = JSON.parse(data);
  });
}

// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(3000);
