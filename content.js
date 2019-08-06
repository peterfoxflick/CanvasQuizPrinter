// content.js

main()
async function main(){
   //Get the necseeary data
   var params = getUrlVars();

   var courseID = params["courseID"]
   var quizID = params["quizID"]
   var schoolID = params["schoolID"]


   //    0  1           2             3      4       5    6     7
   //https://school.instructure.com/courses/id/quizzes/id/take
   var baseUrl = "https://" + schoolID + ".instructure.com/api/v1"

   //Now get submissions to see answers
   var questions = await getQuestions(baseUrl, courseID, quizID);

   //Filter answers baseed on correctness
   if(questions.length == 0)
      return;


   var output = fillPage(questions)

   document.getElementById("question-holder").innerHTML = output;
}


/*******************************************************
 * Get Questions
 * return an array of all the questions
 *******************************************************/
async function getQuestions(baseURL, courseID, quizID){
   var url = baseURL + "/courses/" + courseID + "/quizzes/" + quizID + "/questions"
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



/*******************************************************
 * get Question Text
 * return the HTML for each question based on its type
 *******************************************************/
function getQuestionText( question ) {

   var output = "";

   console.log(question);

   switch(question.question_type) {
      case "calculated_question":
         output = calculatedQuestion(question)
         break;
      case "essay_question":
         output = essayQuestion(question)
         break;
      case "file_upload_question":

         break;
      case "fill_in_multiple_blanks_question":

         break;
      case "matching_question":

         break;
      case "multiple_answers_question":
         output = multipleAnswersQuestion(question)
         break;
      case "multiple_choice_question":
         output = multipleChoiceQuestion(question)
         break;
      case "multiple_dropdowns_question":

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


/*
<div class="question-block">
   <h3>Title</h3>
   <p>Question Text</p>

   <p>Answers?

</div>
*/
function essayQuestion(question){
   var questionText = question.question_text;

   var output = `<div class="question-block">`
   output += questionText

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
   output += questionText


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
   output += questionText

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
   var questionText = question.question_text;

   var output = `<div class="question-block">`
   output += questionText

   output += `</div>`
   return output
}

function trueFalseQuestion(question){
   var questionText = question.question_text;

   var output = `<div class="question-block">`
   output += questionText

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
   output += questionText

   output += `<div class="answer-block">`
   answers.forEach(a=>{
      output += `<br><i class="far fa-circle"></i>`
      output += a.text;
   })

   output += `</div></div>`
   return output;
}


function multipleAnswersQuestion(question){
   var questionText = question.question_text;
   var answers = question.answers.shuffle();

   var output = `<div class="question-block">`
   output += questionText


   output += `<div class="answer-block">`
   answers.forEach(a=>{
      output += `<br><i class="far fa-square"></i>`
      output += a.text;
   })

   output += `</div></div>`
   return output;
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
   return JSON.parse(data.substring("while(1);".length))
}
