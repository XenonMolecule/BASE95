// JavaScript File
// Written by Ter0 Gang

$("#clientID").keydown(function(){
       $("#makeWorkspace").attr("disabled",false);
});

var realtimeUtils;

function authorize() {
        // Attempt to authorize
        realtimeUtils.authorize(function(response){
          if(response.error){
            // Authorization failed because this is the first time the user has used your application,
            // show the authorize button to prompt them to authorize manually.
            var button = document.getElementById('auth_button');
            button.classList.add('visible');
            button.addEventListener('click', function () {
              realtimeUtils.authorize(function(response){
                start();
              }, true);
            });
          } else {
              start();
          }
       }, false);
}

function start() {
       // Create a new document, add it to the URL
       realtimeUtils.createRealtimeFile('New BASE95 File', function(createResponse) {
              window.history.pushState(null, null, '?id=' + createResponse.id);
              realtimeUtils.load(createResponse.id, onFileLoaded, onFileInitialize);
              alert("Your file id is: "+createResponse.id+".  You will be using it in the next step!  You may copy it above from the URL")
        });
}

function onFileInitialize(model) {
       var string = model.createString();
       string.setText('{}');
       model.getRoot().set('demo_string', string);
}

function precedeAuthorize(){
        var clientID = ($("#clientID").val())
        realtimeUtils = new utils.RealtimeUtils({ clientId: clientID});
       authorize();
}

function onFileLoaded(doc) {
    console.log("loaded");
}

$("#cssmenu li").on("click",function(){
    var id = $(this).attr("tabName");
   $('html, body').animate({
        scrollTop: $(id).offset().top
    }, 1000); 
});