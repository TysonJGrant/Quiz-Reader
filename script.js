var quizLinks;
var questions;
var answers;
var titles = [];
var dates = [];
var current = 0;
var disabled = false;
var msg = new SpeechSynthesisUtterance();
var testing = false;
var endpoint = testing ? "http://localhost:3000" : "https://quizreader.herokuapp.com";

httpGetAsync(endpoint, (links) => {
    quizLinks = JSON.parse(links);
    titles += "<option value='description'>Select a Date...</option>";
    for(let i = 0; i < quizLinks.length; i++){
        let parts = quizLinks[i].split("-");
        dates.push(parts[4] == 'saturday' ? parts[4] + " " + parts[7] + " " + parts[8] : parts[4] + " " + parts[5] + " " + parts[6]);
        titles += "<option value=" + i + ">" + dates[i] + "</option><br>";
        document.getElementById("links").innerHTML = titles;
    }
    document.getElementById("info").innerHTML = "Select a Date:";
    console.log(quizLinks);
    console.log(titles);
    toggleDisabled(false);
});

function httpGetAsync(theUrl, callback)
{
    toggleDisabled(true);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function getQuiz(pos, callback){
    if(pos == "description")
        return;
    toggleDisabled(true);
    current = 0;
    updateDisplay();
    document.getElementById("info").innerHTML = "Loading Quiz for " + dates[pos] + "...";
    console.log(quizLinks[pos]);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() { 
        if (xhr.readyState == 4 && xhr.status == 200)
            callback(JSON.parse(xhr.responseText), pos);
    }
    xhr.open("POST", endpoint + "/getquiz", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        url: quizLinks[pos]
    }));
}

function populateQA(QAs, pos){
    questions = [];
    answers = [];
    document.getElementById("questions").innerHTML = "";
    document.getElementById("answers").innerHTML = "";
    for(let i = 0; i < QAs.length/2; i++){
        questions.push(QAs[i*2]);
        answers.push(QAs[i*2+1]);
        document.getElementById("questions").innerHTML += (i+1) + ". " + QAs[i*2] + '<br>';
        document.getElementById("answers").innerHTML += (i+1) + ". " + QAs[i*2+1] + '<br>';
    }
    document.getElementById("info").innerHTML = dates[pos] + " Quiz is Ready!";
    toggleDisabled(false);
}

function speak(arr) {
    msg.text = arr[current];
    speechSynthesis.speak(msg);
}

function updateDisplay(){
    document.getElementById("current").innerText=current+1;
}

function toggleDisabled(val){
    disabled = val
    document.querySelectorAll('.btn').forEach(elem => {
        elem.disabled = disabled;
    });
}

function updateName(val){
    let name = document.getElementById(val).innerHTML;
    if(document.getElementById(val).className == 'collapsible active'){
        console.log(document.getElementById(val).className + "..." + val)
        document.getElementById(val).innerHTML = name.substring(0, name.length-1) + "▼";
    }
    else
        document.getElementById(val).innerHTML = name.substring(0, name.length-1) + "▲"       
}

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
    console.log(i)
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") 
            content.style.display = "none";
        else 
            content.style.display = "block";
    });
}
        