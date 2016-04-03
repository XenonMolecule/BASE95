// JavaScript File
function b95(clientID, documentID){
    this.realtimeUtils = new utils.RealtimeUtils({ clientId: clientID});
    this.clientID = clientID;
    this.documentID = documentID;
    authorize(this);
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
    var collaborativeString = doc.getModel().getRoot().get('demo_string');
    console.log(collaborativeString);
    $("#BASE95").append("<textarea id='BASE95Data' hidden></textarea>");
    var textArea = document.getElementById('BASE95Data');
    gapi.drive.realtime.databinding.bindString(collaborativeString, textArea);
}

//ALL RENDERED USELESS BY JSON.parse
/*function stringToObject(string){
    if(string==null){
        string = $("#BASE95Data").val();
    }
    var object = {};
    string = findInnerString(string);
    var overall = string;
    
    var simplified = overall.split(",");
    
}

function findInnerString(string){
    var removal = (string.split("{"));
    string = "";
    for(var i = 1; i < removal.length; i++){
        if(i < removal.length-1){
            string +=removal[i]+"{";
        } else {
            string +=removal[i];
        }
    }
    removal = string.split("}");
    string ="";
    for(var i = 0; i < removal.length-1; i ++){
        if(i < removal.length-2){
            string +=removal[i]+"}";
        } else {
            string +=removal[i];
        }
    }
    return string;
}

function removeInner(string){
    //ONLY INPUT A SINGLE OVERALL OBJECT, (can contain objects inside though)
    var total = string;
    string = string.split("}");
    var portionString;
    for(var i = 0; i < string.length; i ++){
        portionString+=string[i]
    };
    string = portionString;
    string = string.replace("undefined","");
    portionString = "";
    string = string.split("{");
    return string[0]+"{}";
}
*/