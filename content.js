// content.js

main()
async function main(){
   //Get the necseeary data
   var params = getUrlVars();

   var courseID = params["courseID"]
   var quizID = params["quizID"]
   var schoolID = params["schoolID"]

   //index 0  1           2             3    4       5   6  7
   //https://school.instructure.com/courses/id/quizzes/id/take
   var baseUrl = "https://" + schoolID + "/api/v1"


   //Now get submissions to see answers
   var quizData = await getQuizHeader(baseUrl, courseID, quizID);
   var questions = await getQuestions(baseUrl, courseID, quizID, quizData.question_count)
   var noPrint = await getNoPrint()
   document.getElementById("no-print").innerHTML = noPrint;


   //Filter answers baseed on correctness
   if(questions.length == 0) {
      fillError("Error: There are no questions in this quiz")
      return;
   }

   var output = fillPage(questions)
   document.getElementById("question-holder").innerHTML = output;

   var header = fillHeader(quizData)
   document.getElementById("header").innerHTML = header;

   console.log("about to run")
   formListeners()
}


/*******************************************************
 * Get Questions
 * return an array of all the questions
 * TODO: use quiz.question_count to figure out pagination
 *******************************************************/
async function getQuestions(baseURL, courseID, quizID, questionsCount){

   //build array of urls to use
   let urls = []
   let perPage = 10
   var pagesCount = Math.ceil(questionsCount / perPage)
   for(var page = 1; page <= pagesCount; page++){
      let url = baseURL + "/courses/" + courseID + "/quizzes/" + quizID + "/questions?page=" + page + "&per_page=" + perPage
      urls.push(url)
   }

   //call all urls
   const promises = urls.map(fetchQuestion);
    // wait until all promises are resolved


   let questions = []
   await Promise.all(promises).then(p => {
      p.forEach(q => q.forEach(q => questions.push(q)))
   })

   return questions
}

async function fetchQuestion(url){
   return await fetch(url).then(r => {
      if (!r.ok) {
         fillError("Error " + r.status + ": " + r.statusText + "\n" + r.url)
      }
      return r.text()
   }).then(result => {
       var data = parseJSON(result);
       return data
   }).catch(error =>{
      fillError(error)
   })
}

async function getQuizHeader(baseURL, courseID, quizID){
   var url = baseURL + "/courses/" + courseID + "/quizzes/" + quizID
   return await fetch(url).then(r => r.text()).then(result => {
       var data = parseJSON(result);
       return data
   })
}

/*******************************************************
 * Fill Page
 * Fill the HTML Page with the various questions
 *******************************************************/
function fillPage(questions) {
   var output = ""

   questions.forEach(q=>{
      output += getQuestionText(q);
   })

   return output;
}



function fillHeader(h){
   var output = `<div class="row">`
   output += `<div class="col"><h1>Name : ` + "_".repeat(20) + `</h1></div><div class="text-right col-2"><h1 class="display">____/` + h.points_possible + `</h1></div>`
   output += `</div>`
   output += `<div class="row"><div class="col"><h1 class="display-4">` + h.title       + `</h1></div></div>`
   output += `<div class="row"><div class="col"><p class="lead">`       + h.description + `</p></div></div>`

   if(h.time_limit > 0)
      output += `<div class="row"><div class="col"><p>Time Limit: ` + minToString(h.time_limit) + `</p></div></div>`

   output += `</div>`

   return output;
}

function fillError(text){
   document.getElementById("question-holder").innerHTML = `<div class="alert alert-warning" role="alert">` + text + `</div>`
}



// https://www.w3resource.com/javascript-exercises/javascript-basic-exercise-51.php
function minToString(num){
  var hours = Math.floor(num / 60);
  var minutes = num % 60;
  return hours + ":" + minutes;
}






/*******************************************************
 * get Question Text
 * return the HTML for each question based on its type
 *******************************************************/
function getQuestionText( question ) {

   var output = "";

   switch(question.question_type) {
      case "calculated_question":
         output = calculatedQuestion(question)
         break;
      case "essay_question":
         output = essayQuestion(question)
         break;
      case "file_upload_question":
         output = textOnlyQuestion(question)
         break;
      case "fill_in_multiple_blanks_question":
         output = fillInMultipleBlanksQuestion(question)
         break;
      case "matching_question":
         output = matchingQuestion(question)
         break;
      case "multiple_answers_question":
         output = multipleAnswersQuestion(question)
         break;
      case "multiple_choice_question":
         output = multipleChoiceQuestion(question)
         break;
      case "multiple_dropdowns_question":
         output = multipleDropdownsQuestion(question)
         break;
      case "numerical_question":
         output = shortAnswerQuestion(question)
         break;
      case "short_answer_question":
         output = shortAnswerQuestion(question)
         break;
      case "text_only_question":
         output = textOnlyQuestion(question)
         break;
      case "true_false_question":
         output = trueFalseQuestion(question)
         break;
     default:
       output = "<h3>Error:Question type uknown</h3>";

   }

   return output;

}

function pointsToText(q){
   if(q.points_possible > 0)
      return `<p class="points">____ / ` + q.points_possible + `</p>`
   else
      return ``
}

function essayQuestion(question){
   var questionText = question.question_text;

   var output = `<div class="question-block">`
   output += pointsToText(question) + questionText

   output += `<div class="answer-block">`

   output += '_'.repeat(1000);


   output += `</div></div>`
   return output;
}

function moreLines(el){
   el.innerText = el.innerText + '_'.repeat(100)
}

function lessLines(el){
   el.innerText = el.innerText.substring(0, str.length - 100);
}



function calculatedQuestion(question){
   var questionText = question.question_text;

   var output = `<div class="question-block">`
   output += pointsToText(question) + questionText


   var variables = question.answers[0].variables // array of name and value

   variables.forEach(v=>{
      var regex = new RegExp('(\\[' + v.name + '\\])', 'g');
      output = output.replace(regex, v.value);
   })

   output += `<div class="answer-block">`

   output += '_'.repeat( question.answers[0].answer.toString().length * 4)

   output += `</div></div>`
   return output;
}



function shortAnswerQuestion(question){
   var questionText = question.question_text;

   var output = `<div class="question-block">`
   output += pointsToText(question) + questionText

   output += `<div class="answer-block">`

   //get the average length of an answer
   var ans = question.answers
   var sum = 0;
   ans.forEach(a=>{
      if(a.text.length > 0)
         sum += a.text.length
      else
         sum += a.exact.toString().length
   })
   var avgLength = sum / ans.length;


   output += '_'.repeat(avgLength * 2)


   output += `</div></div>`
   return output;
}



function textOnlyQuestion(question) {
   var questionText = pointsToText(question) + question.question_text;

   var output = `<div class="question-block">`
   output += questionText

   output += `</div>`
   return output
}

function trueFalseQuestion(question){
   var questionText = question.question_text;

   var output = `<div class="question-block">`
   output += pointsToText(question) + questionText

   output += `<div class="answer-block">
                 <i class="far fa-circle"></i>True
                 <br><i class="far fa-circle"></i>False
              </div>`

   output += `</div>`
   return output;
}


function multipleChoiceQuestion(question){
   var questionText = question.question_text;
   var answers = question.answers.shuffle();

   var output = `<div class="question-block">`
   output += pointsToText(question) + questionText

   output += `<div class="answer-block">`
   answers.forEach(function(a, i){
      if(i > 0)
         output += `<br>`
      output += `<i class="far fa-circle"></i>`
      output += a.text;
   })

   output += `</div></div>`
   return output;
}


function multipleAnswersQuestion(question){
   var questionText = question.question_text;
   var answers = question.answers.shuffle();

   var output = `<div class="question-block">`
   output += pointsToText(question) + questionText


   output += `<div class="answer-block">`
   answers.forEach(function(a, i){
      if(i > 0)
         output += `<br>`
      output += `<i class="far fa-square"></i>`
      output += a.text;
   })

   output += `</div></div>`
   return output;
}

function fillInMultipleBlanksQuestion(question){
   var regex = /\[[A-Za-z0-9]*\]/g
   var questionText = question.question_text.replace(regex, "_________")

   var output = `<div class="question-block">`
   output += pointsToText(question) + questionText
   output += `</div>`
   return output;
}



function multipleDropdownsQuestion(question){
   var questionText = question.question_text;
   var answers = question.answers.shuffle();

   var blanks = getBlanks(answers)
   //Sort by order that they appear in the question
   blanks.sort((a,b) => questionText.indexOf(a.blank) - questionText.indexOf(b.blank))


   var output = `<div class="question-block">`
   output += pointsToText(question) + questionText

   output += `<div class="answer-block row">`
   blanks.forEach(function(b, i){
      output += `<div class="col-2">`
      output += `<em>` + b.blank + `</em>`
      b.answers.forEach(function(a, i){
         output += `<br>`
         output += `<i class="far fa-circle"></i>`
         output += a;
      })
      output += `</div>`
   })

   output += `</div></div>`
   return output;
}

function getBlanks(answers){
   var blanks = new Set()

   answers.forEach(a=>{
      blanks.add(a.blank_id)
   })

   return getBlanksAnswers(answers, blanks)
}

function getBlanksAnswers(answers, blanks){
   var output = []
   // create a multiple choice for each blank
   blanks.forEach(b=>{
      var ans = answers.filter(a => a.blank_id == b);
      var out = []
      ans.forEach(a=>{
         out.push(a.text)
      })
      var blank = {
         blank: b,
         answers: out
      }
      output.push(blank)
   })
   return output
}


function matchingQuestion(question){
   var questionText = question.question_text;
   var answers = question.answers.shuffle();
   var matches = question.matches.shuffle();

   var output = `<div class="question-block">`
   output += pointsToText(question) + questionText

   output += `<div class="answer-block row"><div class="col-3 text-right">`
   answers.forEach(function(a, i){
      if(i > 0)
         output += `<br>`
      output += a.text;
      output += ` <i class="far fa-circle"></i>`
   })

   output += `</div><div class="col">`
   matches.forEach(function(m, i){
      if(i > 0)
         output += `<br>`
      output += `<i class="far fa-circle"></i>`
      output += m.text;
   })

   output += `</div></div></div>`
   return output;

}


async function getNoPrint() {
   const feed = new Meed();
   const pub  = await feed.publication("edtech-outpost")

   if (pub.length > 0) {
     let post = pub[0]
     return `
     <div class="alert alert-primary" role="alert">
        <p><a href="` + post.link + `" class="alert-link">` + post.title + `</a></p>
        <hr>
        <p class="mb-0">P.S. Don't worry, I disapear when you print</p>


        <div class="row">
           <div class="col">
              <div class="form-group">
                 <label for="fontChoise">Font</label>
                  <select class="form-control" id="fontChoise">
                      <option>Helvetica Neue</option>
                      <option>Amatic SC</option>
                      <option>Comic Neue</option>
                      <option>Cormorant Garamond</option>
                      <option>Indie Flower</option
                      <option>Open Sans</option>
                      <option>Playfair Display</option>
                      <option>Raleway</option>
                      <option>Roboto Mono</option>
                  </select>
               </div>
            </div>
            <div class="col">
               <div class="form-group">
                  <label for="fontLarger">Size</label><br>
                  <button type="button" class="btn btn-secondary" id="fontLarger">+</button>
                  <button type="button" class="btn btn-secondary" id="fontSmaller">-</button>
               </div>
            </div>
            <div class="col">
               <div class="custom-control custom-switch">
                  <input type="checkbox" class="custom-control-input" id="showPoints">
                  <label class="custom-control-label" for="showPoints">Points</label>
               </div>
            </div>
         </div>

     </div>`
   }

   return `
   <div class="alert alert-primary" role="alert">
      <p>If you find this useful <a href="https://chrome.google.com/webstore/detail/canvas-quiz-printer/aolnbenhahgdmbdgjdkphepifgdnphcl" class="alert-link">please leave a review.</a></p>
      <hr>
      <p class="mb-0">P.S. Don't worry, I disapear when you print</p>


   </div>`
}

function changeFont(){

   var font = document.getElementById("fontChoise").value
   console.log("changing font to " + font)

   switch(font) {
    case "Amatic SC":
       font = "'Amatic SC', cursive"
       break;
    case "Comic Neue":
       font = "'Comic Neue', cursive"
       break;
    case "Cormorant Garamond":
       font = "'Cormorant Garamond', serif"
       break;
    case "Indie Flower":
       font = "'Indie Flower', cursive"
       break;
    case "Open Sans":
       font = "'Open Sans', sans-serif"
       break;
    case "Playfair Display":
       font = "'Playfair Display', serif"
       break;
    case "Raleway":
       font = "'Raleway', sans-serif"
       break;
    case "Roboto Mono":
       font = "'Roboto Mono', monospace"
       break;
    default:
      font = '"Helvetica Neue"'
    }


   document.body.setAttribute('style', 'font-family: ' + font + ' !important');
}

var sizeI = 3
function fontLarger(){

   var sizes = ["xx-small","x-small","small","medium","large","x-large","xx-large"]
   if (sizeI < 6){
      sizeI += 1
   }
   document.getElementById("fontSmaller").disabled = sizeI <= 0;
   document.getElementById("fontLarger").disabled = sizeI >= 6;
  document.body.style.fontSize = sizes[sizeI]
}

function fontSmaller(){
   var sizes = ["xx-small","x-small","small","medium","large","x-large","xx-large"]
   if (sizeI > 0 ){
      sizeI -= 1
   }

   document.getElementById("fontSmaller").disabled = sizeI <= 0;
   document.getElementById("fontLarger").disabled = sizeI >= 6;

   document.body.style.fontSize = sizes[sizeI]
}

function togglePoints(){
   console.log("Value: " + document.getElementById("showPoints").checked)

   var show = document.getElementById("showPoints").checked

   elements = document.getElementsByClassName("points");
   for (var i = 0; i < elements.length; i++) {
      elements[i].style.display = show ?  'inherit' : 'none' ;
   }
}

function formListeners(){
   console.log("running")
   document.getElementById("fontChoise").addEventListener("change", changeFont);
   document.getElementById("fontLarger").addEventListener("click", fontLarger);
   document.getElementById("fontSmaller").addEventListener("click", fontSmaller);
   document.getElementById("showPoints").addEventListener("change", togglePoints);
   document.getElementById("showPoints").checked = true;

}

//https://html-online.com/articles/get-url-parameters-javascript/
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}



Array.prototype.shuffle = function() {
  var i = this.length, j, temp;
  if ( i == 0 ) return this;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     temp = this[i];
     this[i] = this[j];
     this[j] = temp;
  }
  return this;
}

/*******************************************************
 * Parse JSON
 * return an object, removing the while(1) text at the
 * begining.
 *******************************************************/
function parseJSON(data){
   if(data.startsWith("while(1);")){
      return JSON.parse(data.substring("while(1);".length))
   }
   return JSON.parse(data)
}
