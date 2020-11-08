//https://html-online.com/articles/get-url-parameters-javascript/
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

main()
function main() {
   var params = getUrlVars();

   var url = params["url"]

   var output = `<div class="alert alert-warning" role="alert">
     There was an error determining the issue.
   </div>`

   //check if it should have worked or if it was clicked too soon
   if(url && url.indexOf("/quizzes/") > 0){
      //Display error and help
      //https://stackoverflow.com/questions/7592/can-i-use-javascript-to-create-a-client-side-email
      var addresses = "peterfoxflickdev@gmail.com";
      var body = "An error occured trying to print from this url: " + url
      var subject = "Error Printing with URL"
      var href = "mailto:" + addresses + "?"
               + "subject=" + subject + "&"
               + "body=" + body;


      output = `
      <div class="alert alert-danger" role="alert">
         <p>Something went wrong in trying to print your quiz.
         <a href="` + href + `" class="alert-link" >Email the developer the error</a>
         </p>
      </div>`
   } else {
      //Display instructions
      output = `
      <div class="alert alert-primary" role="alert">
        To create a printable verstion of a quiz, open the quiz and then click on the icon.
      </div>
      `
   }

   document.getElementById("message").innerHTML = output;

   // Standard Google Universal Analytics code
   (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
   (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
   m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
   })(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // Note: https protocol here

   ga('create', 'UA-111615694-6', 'auto'); // Enter your GA identifier
   ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
   ga('require', 'displayfeatures');
   ga('send', 'pageview', '/error.html'); // Specify the virtual path

}
