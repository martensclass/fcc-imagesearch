var express = require('express');
var app = express();
var mongoose = require('mongoose');
var url = "mongodb://localhost:27017/clementinejs";
var request = require("request");

mongoose.connect(url);

var urlSchema = mongoose.Schema({
    sterm: String,
    when: String
});

var Search = mongoose.model("Search", urlSchema);

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/index.html');
});

app.get('/api/latest', function(req,res){
  Search.find({},function(err,results){
    if(err)console.log(err);
    else
    res.json(results);
  });
});

app.get('/api/search/:page/:thing', function(req,res){
  var term = req.params.thing;
  var page = Number(req.params.page);
  var options = {
  url: 'https://api.imgur.com/3/gallery/search/' + page + '?q="' + term + '"',
  headers: {
   'Authorization': 'Client-ID defab2311de7962'
  },
  type: 'GET'
};

  if(isNaN(page)){
    res.send("Error - page provided must be a numeric value - try again");
  }
  else{
      request(options, function(error,response, body){
      if (!error && res.statusCode == 200) {
        var info = JSON.parse(body);
        var data=info.data;
        var list=[], obj={};
        for(var i=0; i<data.length; i++){
          obj={"title": data[i].title, "submitby": data[i].account_url, "topic": data[i].topic, "link": data[i].link};
          list.push(obj);
        }
          var entry = new Search({sterm: term, when: convdate()});
          entry.save(function(err,i){
            if(err) console.log(err);
          });
          
        res.send(list);
      } 
      else{
        res.send(error);
      }
      
      });
  }
});

app.get('/api/search/:thing', function(req,res){
  var term = req.params.thing;
  //var page = req.params.page;
  var options = {
  url: 'https://api.imgur.com/3/gallery/search?q="' + term + '"',
  headers: {
   'Authorization': 'Client-ID defab2311de7962'
  },
  type: 'GET'
};

  request(options, function(error,response, body){
  if (!error && res.statusCode == 200) {
    var info = JSON.parse(body);
    var data=info.data;
    var list=[], obj={};
    for(var i=0; i<data.length; i++){
      obj={"title": data[i].title, "submitby": data[i].account_url, "topic": data[i].topic, "link": data[i].link};
      list.push(obj);
    }
    var entry = new Search({sterm: term, when: convdate()});
    entry.save(function(err,i){
        if(err) console.log(err);
    });
    res.send(list);
  } 
  else{
    res.send(error);
  }
    
  });
  
});

app.get("*", function (req, res){
  res.sendFile(process.cwd() + '/the404.html');
});

var port = process.env.PORT || 8080;

function convdate(){
  var d = new Date();
  var fd = d.getFullYear() + "-";
  fd += (d.getMonth()+1) + "-";
  fd+= d.getDate();
  fd+="@" + d.getHours() + ":";
  fd+=d.getMinutes() + ":";
  fd+=d.getSeconds();
  return fd;
}

app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});