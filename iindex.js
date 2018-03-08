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
    return new Promise((reslove, reject)=>{
        var filename = url.parse(file_url).pathname.split('/').pop();
        var file = fs.createWriteStream(`pic/${filename}`);
        var curl = cp.spawn('curl',[file_url]);   

        curl.stdout.on('data',function(data){
            file.write(data);
        });
        curl.stdout.on('end',function(data){
            file.end();
            reslove(1);
        });

        curl.on('exit',function(code){
            if(code!=0){
                reject(1);
            }
        });
    });
};

// 获取当前页面下的所有url
function getpic(cnodeUrl){
    return new Promise((reslove, reject)=>{
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
          reslove(topicUrls);
        });
    })
}

// 开始下载
async function getPic(){
  let  topicUrls = [];
  for(let picurl of picUrls){
    let result = await getpic(picurl);
    topicUrls = [...topicUrls, ...result];
  }

  let promises = [];
  topicUrls.forEach((url)=>{
      promises.push(downloads(url));
  })
  Promise.all(promises).then(data=>{
     setTimeout(()=> {
        zipFile();
     }, 3000)
  })
}

// 压缩图片
function zipFile(callback){
  console.log("star zip....")
  var zip = new AdmZip();
  zip.addLocalFolder('./pic');
  zip.writeZip('pic.zip')
  console.log("zip success...")
}

// 执行下载文件操作！
getPic();
