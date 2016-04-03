// JavaScript File
var base95 = new b95("481591570349-24nfhrrad8rbjmqf5154elakm10ot6n6.apps.googleusercontent.com","0B6IAOFaUVFIgSjRmc3cwYWpSZEk");
function everything(){
    var clicks;
    try {
        base95.read("clicks");
    } catch(e){
        console.log("ERROR: "+e);
    }
    
    $("#buttonToClick").click(function(){
       clicks+=1;
       base95.add("clicks/",clicks);
       console.log(clicks)
       $("#paragraph").text("This button has been clicked "+clicks+"times");
    });
}

setTimeout(everything,8000);