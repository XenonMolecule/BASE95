// JavaScript File
var base95 = new b95("30133579980-tn3o4580eqpumfj2rk03399i3j8ku8cb.apps.googleusercontent.com","0B6IAOFaUVFIgZ0dPNzQydkxkbUk");
function everything(){
    var clicks;
    try {
        clicks = base95.read("clicks/");
        $("#paragraph").text("This button has been clicked "+clicks+" times");
    } catch(e){
        console.log("ERROR: "+e);
    }
    
    $("#buttonToClick").click(function(){
       clicks+=1;
       base95.add("clicks",clicks);
       console.log(clicks)
       $("#paragraph").text("This button has been clicked "+clicks+" times");
    });
}

setTimeout(everything,5000);