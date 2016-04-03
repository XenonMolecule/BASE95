// JavaScript File
var base95 = new b95("30133579980-tn3o4580eqpumfj2rk03399i3j8ku8cb.apps.googleusercontent.com","0B6IAOFaUVFIgZ0dPNzQydkxkbUk");
var clicks;
var pastVal = "";
function everything(){
    clicks;
    try {
        clicks = base95.read("clicks/");
        $("#paragraph").text("This button has been clicked "+clicks+" times");
    } catch(e){
        console.log("ERROR: "+e);
        clicks = 0;
        base95.add("clicks",clicks);
    }
    
    $("#buttonToClick").click(function(){
       clicks+=1;
       base95.add("clicks",clicks);
       console.log(clicks)
       $("#paragraph").text("This button has been clicked "+clicks+" times");
    });
}

setTimeout(everything,5000);


$(document).resize(function(){
    $("#buttonToClick").css("margin-top",(window.innerHeight/2)-150+"px");
});

$("#buttonToClick").css("margin-top",(window.innerHeight/2)-150+"px");

$("#BASE95Data").change(function(){
   clicks = base95.read("clicks/"); 
});

function update(){
    var value = $("#BASE95Data").val();
    if (value!=pastVal){
        clicks = base95.read("clicks/");
    }
    pastVal = value;
    setTimeout(update, 200);
}