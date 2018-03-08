var url=require('url');
var fs=require('fs');
var cp=require('child_process');
var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var AdmZip = require('adm-zip');

var DOWNLOAD_DIR='./pic';
var cnodeUrls = 'http://www.woyaogexing.com/tupian/weimei/';

// 获取所有的url
var picUrls=[];
for(var i = 2; i < 10;i++){
  picUrls.push(cnodeUrls + "index_" + i + ".html");
}

// 根据图片url进行下载
function downloads(file_url){
        var filename = url.parse(file_url).pathname.split('/').pop();
        var file = fs.createWriteStream(`pic/${filename}`);
        var curl = cp.spawn('curl',[file_url]);   

        curl.stdout.on('data',function(data){
            file.write(data);
        });
        curl.stdout.on('end',function(data){
            file.end();
            console.log(filename + 'downloaded to' + DOWNLOAD_DIR);
        });

        curl.on('exit',function(code){
            if(code!=0){
               console.log('Failed:' + code);
            }
        });
};

// 获取当前页面下的所有url
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
      
      return topicUrls;
      // var ep = new eventproxy();

      // ep.after('topic_html', topicUrls.length, function (topics) {
      //   topics.forEach((e,i)=>{
      //    // downloads(e)
      //   })
      // });

      // topicUrls.forEach(function (topicUrl) {
      //   superagent.get(topicUrl)
      //     .end(function (err, res) {
      //       console.log('fetch ' + topicUrl + ' successful');
      //       ep.emit('topic_html', topicUrl );
      //     });
      // });
    });
}

// 开始下载
function getPic(){
  let  topicUrls = [];
  picUrls.forEach(function(picurl){ // picurl --> http://www.woyaogexing.com/tupian/weimei/index_2.html    
    getpic(picurl)
  })
}

// 压缩图片文件夹
function zipFile(){
  console.log("star zip....")
  var zip = new AdmZip();
  zip.addLocalFolder('./pic');
  zip.writeZip('pic.zip')
  console.log("zip success...")
}

// result
getPic();
