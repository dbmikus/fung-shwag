// 15-237 Homework 3 - Fung Shwag
// nhamal
// dmikus
// zim
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

// get a room
app.get("/room/:id", function(request, response){
    var id = request.params.id;
    console.log(rooms);
    var room = rooms[id];
    console.log(rooms[id]);
    response.send({
        room: room,
        sucksess: (room !== undefined), 
        success: true
    });
});

// from https://developer.mozilla.org/en-US/
// docs/JavaScript/Reference/Global_Objects/Array/map
function returnInt(element){
    return parseInt(element, 10);
}


function intList(list){
    for(var i = 0; i<list.length; i++) {
        list[i]=list[i].map(returnInt);
    }
    return list;
}

// save a room
app.post("/room/:id", function(request, response){
    var id = request.params.id;
    var inputSubRooms = request.body.sendSubRooms;
    console.log(inputSubRooms);
    var inputFurniture = request.body.sendFurniture;
    rooms[id]={"subrooms":  inputSubRooms,
               "furniture": inputFurniture};
    writeFile("data.txt", JSON.stringify(rooms));
    response.send({
        success: true
    })
});



app.get("/static/icons/:imagename", function (request, response) {
    response.sendfile("static/icons/" + request.params.imagename);
});


// This is for serving files in the static directory
app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});

//gives the index when navigating to the server
app.get("/", function (request,response){
    response.sendfile("static/index.html");
})


app.get("/favicon.ico", function (request,response){
    response.sendfile("favicon.ico");
})



function initServer() {
  // When we start the server, we must load the stored data
  var defaultRooms = "{}";
  readFile("data.txt", defaultRooms, function(err, data) {
    rooms = JSON.parse(data);
  });
}

// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(process.env.PORT || 3000);
