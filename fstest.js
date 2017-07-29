let fs = require('fs');
appData = {
  categories: [
    { categoryName:"Favorite apps", apps:[], id:1
        /*{
          imagePath:"images/Garena_128px_555222_easyicon.net.ico",
          appName: "Lorem ipsum dolor sit amet, consectetua",
          appPath:"",
        }*/
    },
    { categoryName:"Online games",apps:[],id:2 },
    { categoryName:"Offline games",apps:[],id:3 },
    { categoryName:"Internet apps",apps:[],id:4 },
    { categoryName:"Office apps",apps:[],id:5 },
    { categoryName:"Movies",apps:[],id:6 }
  ],
  lastAppId : 0,
  lastCatId : 6,
  announcements:[]
}
fs.writeFile('appData.json', JSON.stringify(appData),  function(err) {
   if (err) {
      return console.error(err);
   }

   console.log("Data written successfully!");
   console.log("Let's read newly written data");
   fs.readFile('appData.json', function (err, data) {
      if (err) {
         return console.error(err);
      }
      console.log("Asynchronous read: " + data.toString());
   });
});
