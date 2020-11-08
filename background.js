

chrome.browserAction.onClicked.addListener(function(tab) {
   chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
       var url = tabs[0].url;
       var params = url.split("/")
       console.log(url);

       //Get url from https:// to /courses/
       //    0   1         2                3     4     5     6
       // https://school.instructure.com/courses/###/quizzes/####
       if(params[5] === "quizzes" && params[6]) {
          let courseID = params[4]
          let quizID = params[6]
          let schoolID = params[2];
          var params = "?courseID=" + courseID + "&quizID=" + quizID + "&schoolID=" + schoolID
          chrome.tabs.create({'url': chrome.extension.getURL('print.html' + params)}, function(tab) {

          });

       } else {
          chrome.tabs.create({'url': chrome.extension.getURL('error.html?url=' + url)}, function(tab) {
          });
       }
       //Todo Add an error here?
   });

});
