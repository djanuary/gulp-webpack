let gulp = require('gulp');
let path = require('path');
let clean = require('gulp-clean');
let scss2css = require('gulp-sass');
let cssMinify = require('gulp-minify-css');
let cssSpriter = require('gulp-css-spriter');
let smushit = require('gulp-smushit');
let fileInclude = require('gulp-file-include');
let rename = require('gulp-rename');
let runSequence = require('run-sequence');//解决gulp异步执行问题，添加依赖执行
let connect = require('gulp-connect');
let webpack = require('webpack');
let webpackConifg = require('./webpack.config.js'); 
//环境变量
let NODE_ENV = process.env.NODE_ENV.split('::'),
    projectName = NODE_ENV[0],
    projectEnv = NODE_ENV[1] ? NODE_ENV[1] : '';
//入口
let entryPath = path.join(__dirname,'src/'),
    outputPath = path.join(__dirname,'dist/');

//工程资源引入目录
let prejectDevEntry = {
    image:entryPath + 'image/',
    js:entryPath + 'js/',
    scss:entryPath + 'scss/',
    html:entryPath + 'html/'
}
let prejectEntry = {
    image:entryPath + 'image/' + projectName + '/',
    scss:entryPath + 'scss/' + projectName + '/',
    html:entryPath + 'html/' + projectName + '/',
}
//工程资源导出目录
let prejectOutput = {
    image:outputPath + projectName + '/image/',
    css:outputPath + projectName + '/css/',
    html:outputPath + projectName + '/html/',
}

//删除原有图片
gulp.task('clean', () => {
    return gulp.src(outputPath + projectName)
        .pipe(clean())
});
//复制图片
gulp.task('copy-image', () => {
    return gulp.src([ prejectEntry.image + '**/*.{jpg,png,gif}', prejectDevEntry.image + 'public/**/*.{jpg,png,gif}'])
        .pipe(gulp.dest(prejectOutput.image))
});
//scss转css
gulp.task('scss-css', () => {
    return gulp.src(prejectEntry.scss + 'index.scss')
        .pipe(scss2css())
        .pipe(rename((path) => {
            path.dirname += "/";
            path.basename = projectName;
            path.extname = ".css";
        }))
        .pipe(gulp.dest(prejectOutput.css))
});
//css-spriter
gulp.task('css-spriter', () => {
    return gulp.src(prejectOutput.css + '*.css')
        .pipe(cssSpriter({
            // 生成的spriter的位置
            spriteSheet: prejectOutput.image +'spriter/' + projectName + 'spriter.png',
            // 生成样式文件图片引用地址的路径
            pathToSpriteSheetFromCSS: '../image/spriter/' + projectName + 'spriter.png',
            spritesmithOptions: {
                padding: 10
            }
        }))
        .pipe(gulp.dest(prejectOutput.css))
});
//image-minify
gulp.task('image-minify', () => {
    return gulp.src(prejectOutput.image + '**/*.{jpg,png}')
        .pipe(smushit())
        .pipe(gulp.dest(prejectOutput.image))
});
//css-minify
gulp.task('css-minify', () => {
    return gulp.src(prejectOutput.css + '**/*.css')
        .pipe(cssMinify())
        .pipe(gulp.dest(prejectOutput.css))
});

//webpack
gulp.task('webpack', () => {
    let webpackPlugin = webpack(webpackConifg(projectName, projectEnv));
    return webpackPlugin.run((err, status) => {
        console.log('webpack:' + err);
        console.log('webpack:' + status);
    })
});

//html-创建
gulp.task('html-create', () => {
    // 适配page中所有文件夹下的所有html，排除page下的include文件夹中html
    return gulp.src(prejectEntry.html + '*.html')
        .pipe(fileInclude({
          prefix: '@@',
          basepath: '@file'
        }))
    .pipe(gulp.dest(prejectOutput.html));
});
//webserver
gulp.task('web-server',() => {
    connect.server({
        //host:'',
        root: 'dist/' + projectName,
        port: 8888,
        livereload: true,
        index:false,
        middleware:(connect,opt) => {
            openBrowser('http://' + opt.host + ':' + opt.port);
            return []
        }
    });
});

//-----------build-----------------
gulp.task('css-build',() => {
    let runCss = ['copy-image','scss-css','css-spriter'];
    if(projectEnv == 'pro'){
        runCss.push('css-minify');
        runCss.push('image-minify');
    }
    runCss.push(reloadHtml);
    return runSequence.apply(null,runCss);
});
gulp.task('html-build',() => {
    return runSequence('html-create',reloadHtml);
});
gulp.task('js-build',() => {
    return runSequence('webpack',reloadHtml);
});
//---------reload--------------
gulp.task('reload-html',() => {
    return gulp.src(prejectOutput.html + '*.html')
                .pipe(connect.reload())
});
function reloadHtml(){
    if(projectEnv == 'pro'){ return; }
    gulp.start('reload-html');
}
function defaultBack(){
    if(projectEnv == 'pro'){ return;}
    //watch
    gulp.watch(prejectDevEntry.scss + '**/*.scss', ['css-build']);
    gulp.watch(prejectDevEntry.js + '**/*.js', ['js-build']);
    gulp.watch(prejectDevEntry.html + '**/*.html', ['html-build']);
    //webserver
    gulp.start('web-server');
}
function openBrowser(url){
    let c = require('child_process');
        c.exec('start ' + url);
}
//默认执行
gulp.task('default',() => {
    runSequence('clean','css-build','js-build','html-build',defaultBack);
});