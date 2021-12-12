var quizLinks;
var questions;
var answers;
var titles = [];
var dates = [];
var current = 0;
var msg = new SpeechSynthesisUtterance();

// var xhr = new XMLHttpRequest();
// xhr.open("POST", "http://localhost:4000/getquiz", true);
// xhr.setRequestHeader('Content-Type', 'application/json');
// xhr.send(JSON.stringify({
//     url: "https://www.smh.com.au/national/good-weekend-superquiz-and-saturday-target-time-december-4-20211203-p59eo1.html"
// }));

httpGetAsync("http://localhost:4000", (links) => {
    quizLinks = JSON.parse(links);
    //get quiz names from links
    //display names  <a post request(i)>
    for(let i = 0; i < quizLinks.length; i++){
        let parts = quizLinks[i].split("-");
        dates.push(parts[4] == 'saturday' ? parts[4] + " " + parts[7] + " " + parts[8] : parts[4] + " " + parts[5] + " " + parts[6]);
        titles += "<button class='quizLink btn' onClick='getQuiz(" + i + ", populateQA)'>" + dates[i] + "</button><br>";
        document.getElementById("links").innerHTML = titles;
    }
    document.getElementById("info").innerHTML = "Select a Date:";
    console.log(quizLinks);
    console.log(titles);
});

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function getQuiz(pos, callback){
    current = 0;
    document.getElementById("info").innerHTML = "Loading Quiz for " + dates[pos] + "...";
    console.log(quizLinks[pos]);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() { 
        if (xhr.readyState == 4 && xhr.status == 200)
            callback(JSON.parse(xhr.responseText), pos);
    }
    xhr.open("POST", "http://localhost:4000/getquiz", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        url: quizLinks[pos]
    }));
}

function populateQA(QAs, pos){
    questions = [];
    answers = [];
    for(let i = 0; i < QAs.length/2; i++){
        questions.push(QAs[i*2]);
        answers.push(QAs[i*2+1]);
        document.getElementById("questions").innerHTML += (i+1) + ". " + QAs[i*2] + '<br>';
        document.getElementById("answers").innerHTML += (i+1) + ". " + QAs[i*2+1] + '<br>';
    }
    document.getElementById("info").innerHTML = dates[pos] + " Quiz is Ready!";
}

function speak(arr) {
    msg.text = arr[current];
    speechSynthesis.speak(msg);
}

function updateDisplay(){
    document.getElementById("current").innerText=current+1;
}
        