

chrome.browserAction.onClicked.addListener(function(tab) {
   chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
       var url = tabs[0].url;
       var params = url.split("/")
       console.log(url);
       // https://school.instructure.com/courses/###/quizzes/####
       if(params[2].endsWith(".instructure.com") && params[5] === "quizzes") {
          let courseID = params[4]
          let quizID = params[6]
          let schoolID = params[2].split(".")[0];
          var params = "?courseID=" + courseID + "&quizID=" + quizID + "&schoolID=" + schoolID
          chrome.tabs.create({'url': chrome.extension.getURL('print.html' + params)}, function(tab) {

          });

       }
       //Todo Add an error here?
   });

});
