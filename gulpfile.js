var gulp = require('gulp'),
  px3rem = require('gulp-px3rem'),
  uglify = require('gulp-uglify'), //压缩js
  minifyCss = require('gulp-clean-css'), //压缩css
  imagemin = require('gulp-imagemin'), //压缩图片
  runSequence = require('run-sequence'),
  changed = require('gulp-changed'), //只编译修改过的文件
  debug = require('gulp-debug'),
  plumber = require('gulp-plumber'),
  util = require('gulp-util'),
  notify = require('gulp-notify'),
  csso = require('gulp-csso'), //压缩优化css
  merge = require('merge-stream'), //合并文件流
  buffer = require('vinyl-buffer'), //输出图片文件流
  spritesmith = require('gulp.spritesmith'), //合并精灵图
  clean = require('gulp-clean'), //
  through = require('through2'),
  base64 = require('gulp-base64'),
  imgBase64 = require('gulp-imgs-base64'),
  rev = require('gulp-rev'), //添加版本号
  minimist = require('minimist'),
  revCollector = require('gulp-rev-collector'), //替换页面中的链接引用
  fileInclude = require('gulp-file-include'),
  ejs = require('gulp-ejs'),
  data = require('gulp-data'),
  fs = require('fs'),
  path = require('path'),
  gulpif = require('gulp-if');
gulp.task('pxTorem', function () {
  return gulp.src('src/css/pxCss/*.css')
    .pipe(plumber({ //防止css文件写法有误时中断gulp工作流，可以继续监控
      errorHandler: function (error) {
        notify.onError('Error:<%= error.message %>');
        this.emit('end');
      }
    }))
    .pipe(changed('src/css', { hasChanged: changed.compareLastModifiedTime }))
    .pipe(px3rem({ remUnit: 72 })) //配置设计稿的宽度，一般为750/10,640/10,720/10
    .pipe(debug({ title: "编译" })) //此处当你修改某个css时会自动提示编译了几个item
    .pipe(gulp.dest('src/css'));
});
var tplDir = "./src/widget/common"
  //ejs模板引擎
gulp.task('ejs', function () {
  return gulp.src('src/widget/*.html')
    // .pipe(changed('src',{hasChanged:changed.compareLastModifiedTime}))
    .pipe(data(function (file) {
      var filePath = file.path;
      return JSON.parse(fs.readFileSync(path.join(path.dirname(filePath), path.basename(filePath, '.html') + '.json')))
    }))
    .pipe(ejs({ public: "" }, { ext: ".html", delimiter: "@" }))
    .on('error', function (error) {
      util.log(error);
      this.emit('end');
    })
    .pipe(debug({ title: "编译" }))
    .pipe(notify({ message: "渲染成功" }))
    .pipe(gulp.dest('src'))
});
//当修改模板时重新编译
gulp.task('add:public', function () {
  return gulp.src('src/*.html')
    .pipe(ejs({ public: "http://localhost/H5Mobile/waptd/src/" }, { ext: ".html", delimiter: "@" }))
    .on('error', function (error) {
      util.log(error);
      this.emit('end');
    })
    .pipe(debug({ title: "编译" }))
    .pipe(notify({ message: "渲染成功" }))
    .pipe(gulp.dest('src'))
})
gulp.task('sprite', function () {
  //gulp sprite --one index --two navIcon
  //gulp sprite --one index --two icons2
  //{ _: [ 'sprite' ], key: 'navIcon' }
  var options1 = minimist(process.argv.slice(2)).one; //images/下一级目录，页面主入口如index
  var options2 = minimist(process.argv.slice(2)).two; //页面主入口下分类的icon目录如navIcon,icons2
  console.log('src/images/' + options1 + '/' + options2 + '/');
  var spriteData = gulp.src('src/images/' + options1 + '/' + options2 + '/*.png') //寻找eg:images/index/navIcon/*.png
    .pipe(spritesmith({
      imgName: 'images/' + options1 + '/' + options2 + 'sprite.png', //eg:最终生成的雪碧图的名称和位置images/index/navIconSprite.png
      cssName: 'css/' + options1 + '-' + options2 + '-' + 'sprite.css', //eg:最终生成的雪碧图对应的css名称和位置css/navIconsprite.png
      padding: 10,
      cssTemplate: function (data) { //生成的雪碧图的样式模板
        var arr = [];
        arr.push(".icon{display:inline-block}\n");
        data.sprites.forEach(function (sprite) {
          arr.push("." + options2 + "-" + sprite.name + "{" +
            "background-image:url('" + sprite.escaped_image + "');" +
            "background-position: " + sprite.px.offset_x + " " + sprite.px.offset_y + ";" +
            "-webkit-background-size:" + sprite.px.total_width + " " + sprite.px.total_height + ";" +
            "width: " + sprite.px.width + ";" +
            "height:" + sprite.px.height + ";" +
            "}\n");
        });
        return arr.join("");
      }
    }));
  //输出 image 流通过buffer()
  var imgStream = spriteData.img
    .pipe(buffer())
    .pipe(gulp.dest('src'));
  //输出css文件流通过cssno()
  var cssStream = spriteData.css
    .pipe(csso())
    .pipe(gulp.dest('src'));
  return merge(imgStream, cssStream);
});
gulp.task('clean:files', function () { //清除文件夹里面的内容和pxcss，rev文件夹
  return gulp.src(['dist/**/*.*', 'dist/css/pxCss', 'dist/rev', 'dist/images/*/', 'dist/widget/**/*.html', 'dist/widget'])
    .pipe(clean()); //这里先把images下的全部子目录清除,最后rev图片时会把index目录重新复制进去
});
gulp.task('copyFolders', function () { //复制src的目录结构到dist
  return gulp.src('src/**/*.*', { base: 'src' })
    .pipe(gulp.dest('dist'));
});
/*build任务开始*/
//压缩css
gulp.task('miniCss', function () {
    return gulp.src('dist/css/*.css')
      .pipe(minifyCss())
      .pipe(gulp.dest('dist/css'));
  })
  //base64转码
gulp.task('base64', function () {
    return gulp.src('dist/css/*.css')
      .pipe(base64({
        maxImageSize: 2 * 1024 //设置多大以内的图片转为base64
      }))
      .pipe(gulp.dest('dist/css'))
  })
  //imgbase64
gulp.task('base64:img', function () {
    return gulp.src('src/*.html')
      .pipe(imgBase64({
        baseDir: 'src',
        maxImageSize: 3 * 1024
      }))
      .pipe(gulp.dest('src'))
  })
  //压缩图片
gulp.task('imagemin', function () {
  return gulp.src('dist/images/*/*.*')
    .pipe(imagemin({
      progressive: true //无损压缩jpg
    }))
    .pipe(gulp.dest('dist/images'));
});
//压缩js
gulp.task('uglyJs', function () {
  return gulp.src(['dist/js/**/*.js'], ['!dist/js/lib/*.js'])
    .pipe(uglify({
      mangle: false
    }))
    .pipe(gulp.dest('dist/js'));
});
gulp.task('miniAssets', function () { //总体压缩任务合并
  runSequence(['miniCss', 'imagemin', 'uglyJs'], 'base64');
});
//添加版本号
//css生成文件hash编码并生成rev-manifest.json文件名对照映射
gulp.task('revCss', function () {
  return gulp.src('src/css/*.css')
    .pipe(rev())
    .pipe(gulp.dest('dist/css'))
    .pipe(rev.manifest()) //生成json文件到指定的src/rev文件夹
    .pipe(gulp.dest('src/rev/css'));
});
//js生成文件hash编码并生成rev-manifest.json文件名对照映射
gulp.task('revJs', function () {
  return gulp.src(['src/js/**/*.js'])
    .pipe(rev())
    .pipe(gulp.dest('dist/js'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('src/rev/js'));
});
//img生成hash版本号
gulp.task('revImg', function () {
    return gulp.src('src/images/*/*.*') //从src下取文件
      .pipe(rev())
      .pipe(gulp.dest('dist/images')) //这里不用再写其他目录了，输出时会自动输出子目录
      .pipe(rev.manifest())
      .pipe(gulp.dest('src/rev/images'));
  })
  //html替换css,js文件版本
gulp.task('revHtml', function () {
    return gulp.src(['src/rev/**/*.json', 'src/*.html'])
      .pipe(revCollector())
      .pipe(gulp.dest('dist'));
  }) //执行替换任务
gulp.task('build', function () {
    runSequence('copyFolders', 'clean:files', 'revImg', 'revCss', 'revJs', 'revHtml', 'miniAssets');
  })
  /*build任务结束*/
gulp.task('watcher', function () {
  gulp.watch(['src/css/pxCss/*.css', 'src/widget/**/*.html', 'src/widget/*.json'], ['pxTorem', 'ejs'])
})
gulp.task('default', function () {
  runSequence('pxTorem', 'ejs', 'watcher');
})
