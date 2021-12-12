var bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded());
app.use(cors({origin: '*'}));
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

  
app.get('/' , (req,res)=>{
    const url = 'https://www.smh.com.au/topic/quizzes-1qx';

    (async () => {
    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        const navigationPromise = page.waitForNavigation();

        await page.goto(url);
        await navigationPromise;

        let quizLinks = await page.$$eval('div div h3 a', quizzes => {      //Get links to recent quizzes
            return quizzes.map(quiz => "https://www.smh.com.au" + quiz.getAttribute('href'));
        });
        console.log(quizLinks);
        res.send(JSON.stringify(quizLinks));
        await browser.close();
    } catch (e) {
        console.log(`Error while fetching quiz links ${e.message}`);
    }
    })();
})

app.post('/getQuiz', getQuiz);

function getQuiz(req, res){
    (async () => {
        try {
            console.log("Quiz URL1:  " + req.body.url)
            
            //Go to parent quiz page
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(req.body.url);   
            console.log("Quiz URL2: " + req.body.url)
            
            //Find URL of iframe quiz content
            const data = await page.evaluate(() => document.querySelector('*').outerHTML);
            const index1 = data.indexOf("https://www.smh.com.au/interactive/modules/");
            const index2 = data.indexOf(".json", index1);
            var link = data.substring(index1, index2+5).replace(/&amp;/g, '&');
            console.log(link);  //Undo changed &'s

            //Go to the actual quiz page
            const navigationPromise = page.waitForNavigation();
            await page.goto(link);
            await navigationPromise;
    
            //Get questions and answers once content loads
            await page.waitForSelector('main div form article div');    //Waits for react app in site to load the quiz portion
            let QAs = await page.$$eval('main div form article div div p', QASection => {
                return QASection.map(QA => QA.innerText);
            });
            console.log(QAs);
            res.send(QAs);
            await browser.close();
        } catch (e) {
            console.log(`Error while fetching quiz data ${e.message}`);
        }
    })();
};