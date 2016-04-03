// JavaScript File
var bases = [];
var collaborativeString;

function b95(clientID, documentID){
    this.realtimeUtils = new utils.RealtimeUtils({ clientId: clientID});
    this.clientID = clientID;
    this.documentID = documentID;
    authorize(this);
    bases.push(this);
    callGetData();
    this.add = function(name, value, path){
        var object = getData();
        if(path!=null){
            if(path.includes("/")){
                path = path.split("/");
            }
        } else {
            path = "";
        }
        var iterations = [];
        iterations.push(object);
        for(var i = 0; i < path.length; i++){
            if(path[i]!=""&&path[i]!=undefined&&path!=null){
                object = object[path[i]];
                iterations.push(object);
            }
        }
        if(path!=""&&path!=undefined&&path!=null){
            console.log(iterations);
            if(value!=""){
                (iterations[path.length-1])[name] = value;
            } else {
                delete (iterations[path.length-1])[name];
            }
            object = getData();
            for(var i = (iterations.length-1); i > 0; i--){
                (iterations[i-1])[path[i-1]] = iterations[i]
                console.log(iterations[i]);
            }
            object = iterations[0];
        } else {
            console.log(path);
            if(value!=""){
                object[name] = value;
            } else {
                delete object[name];
            }
        }
        
        this.value = object;
        sendData();
        $("#BASE95Data").trigger("change");
    }
    this.change = this.add;
    this.remove = function(name, path){
        this.add(name, "",path);
    }
    this.read = function(path){
        var object = getData();
        if(path!=null){
            if(path.includes("/")){
                path = path.split("/");
            }
        } else {
            path = "";
        }
        var iterations = [];
        iterations.push(object);
        for(var i = 0; i < path.length; i++){
            if(path[i]!=""&&path[i]!=undefined&&path!=null){
                object = object[path[i]];
                if(i==path.length-2){
                    return object;
                }
            }
        }
        
        return this.value;
        
    }
}

function authorize(b95) {
    // Attempt to authorize
    (b95.realtimeUtils).authorize(function(response){
          if(response.error){
            // Authorization failed because this is the first time the user has used your application,
            // show the authorize button to prompt them to authorize manually.
            var button = document.getElementById('auth_button');
            button.classList.add('visible');
            button.addEventListener('click', function () {
            (b95.realtimeUtils).authorize(function(response){
                start(b95);
            }, true);
            });
        } else {
        start(b95);
        } 
    }, false);
}

function start(b95) {
    console.log("starting")
    // With auth taken care of, load a file, or create one if there
    // is not an id in the URL.
    var id = (b95.realtimeUtils).getParam('id');
    if (b95.documentID) {
      // Load the document id
      (b95.realtimeUtils).load(b95.documentID, onFileLoaded, onFileInitialize);
    
    } else {
        console.log("ERROR: could not locate BASE95 document");
    }
}

function onFileInitialize(model) {
    var string = model.createString();
    string.setText('Welcome to the Quickstart App!');
    model.getRoot().set('demo_string', string);
}

function onFileLoaded(doc) {
    collaborativeString = doc.getModel().getRoot().get('demo_string');
    console.log(collaborativeString);
    $("#BASE95").append("<textarea id='BASE95Data' hidden></textarea>");
    var textArea = document.getElementById('BASE95Data');
    gapi.drive.realtime.databinding.bindString(collaborativeString, textArea);
}

function getData(){
    for(var i = 0; i < bases.length; i ++){
        try {
            bases[i].value = JSON.parse($("#BASE95Data").val());
            return JSON.parse($("#BASE95Data").val());
        }catch(e){
            console.log("ERROR: "+e);
        }
    }
}

function sendData(){
    var data = JSON.stringify(bases[0].value);
    $("#BASE95Data").val(data);
    collaborativeString.setText(data);
}

function callGetData(){
    getData();
    setTimeout(callGetData,200);
}