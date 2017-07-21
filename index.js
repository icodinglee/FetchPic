var url=require('url');
var fs=require('fs');
var cp=require('child_process');
var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var async = require('async');
var adm_zip = require('adm-zip');

var DOWNLOAD_DIR='./pic';
var cnodeUrls = 'http://www.woyaogexing.com/tupian/weimei/';


function downloads(file_url){
        var filename=url.parse(file_url).pathname.split('/').pop();
        var file=fs.createWriteStream(`pic/${filename}`);
        var curl=cp.spawn('curl',[file_url]);   //use spawn
        curl.stdout.on('data',function(data){
                file.write(data);
        });
        curl.stdout.on('end',function(data){
                file.end();
        //console.log(filename+'downloaded to'+DOWNLOAD_DIR);
        });

        curl.on('exit',function(code){
                if(code!=0){
                        console.log('Failed:'+code);
                }
        });

};
function getpic(cnodeUrl){
  superagent.get(cnodeUrl)
    .end(function (err, res) {
      if (err) {
        return console.error(err);
      }
      var topicUrls = [];
      var $ = cheerio.load(res.text);
      $('.lazy').each(function (idx, element) {
        var $element = $(element);
        var href = url.resolve(cnodeUrl, $element.attr('src'));
        topicUrls.push(href);
      });

      var ep = new eventproxy();

      ep.after('topic_html', topicUrls.length, function (topics) {
        topics.forEach((e,i)=>{
          downloads(e)
          console.log("download" + i)
        })
      });

      topicUrls.forEach(function (topicUrl) {
        superagent.get(topicUrl)
          .end(function (err, res) {
            //console.log('fetch ' + topicUrl + ' successful');
            ep.emit('topic_html', topicUrl );
          });
      });
    });
}

var picUrls=[];
for(var i=2;i<3;i++){
  picUrls.push(cnodeUrls+"index_"+i+".html")
}

function getPic(){
  picUrls.forEach(function(picurl){
    getpic(picurl)
  })
}
//getpic(cnodeUrls)

function zipFile(){
  console.log("star zip....")
  var zip = new AdmZip();
  zip.addLocalFolder('./pic');
  zip.writeZip('pic.zip')
  console.log("zip success...")
}

async.series([
  getPic,zipFile
], function(err, results) {
  console.log(err)
});
