let gulp = require('gulp');
let path = require('path');
let clean = require('gulp-clean');
let scss2css = require('gulp-sass');
let cssMinify = require('gulp-minify-css');
let cssSpriter = require('gulp-css-spriter');
let imageMin = require('gulp-imagemin');
let imagePngquant = require('imagemin-pngquant');
let fileInclude = require('gulp-file-include');
let rename = require('gulp-rename');
let runSequence = require('run-sequence');//解决gulp异步执行问题，添加依赖执行
let webServer = require('gulp-webserver');
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
let prejectPublicEntry = {
    image:entryPath + 'image/public/**',
    js:entryPath + 'js/**',
    css:entryPath + 'scss/**',
    html:entryPath + 'html/**'
}
let prejectEntry = {
    image:entryPath + 'image/' + projectName + '/**',
    scss:entryPath + 'scss/' + projectName + '/',
    html:entryPath + 'html/' + projectName + '/*.html',
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
    return gulp.src([ prejectEntry.image, prejectPublicEntry.image ])
        .pipe(gulp.dest(prejectOutput.image))
});
//scss转css
gulp.task('scss-css', () => {
    return gulp.src(prejectEntry.scss + '*.scss')
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
            spriteSheet: prejectOutput.image +'spriter/' + projectName + '.png',
            // 生成样式文件图片引用地址的路径
            pathToSpriteSheetFromCSS: '../image/spriter/' + projectName + '.png',
            spritesmithOptions: {
                padding: 10
            }
        }))
        .pipe(gulp.dest(prejectOutput.css))
});
//image-minify
gulp.task('image-minify', () => {
    return gulp.src(prejectOutput.image + '**')
        .pipe(imageMin({
            progressive: true, // 无损压缩JPG图片
            svgoPlugins: [{removeViewBox: false}], // 不移除svg的viewbox属性
            use: [imagePngquant()] // 使用pngquant插件进行深度压缩
        }))
        .pipe(gulp.dest(prejectOutput.image))
});
//css-minify
gulp.task('css-minify', () => {
    return gulp.src(prejectOutput.css + '**')
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
    return gulp.src(prejectEntry.html)
        .pipe(fileInclude({
          prefix: '@@',
          basepath: '@file'
        }))
    .pipe(gulp.dest(prejectOutput.html));
});
//webserver
gulp.task('webServer',() => {
    return gulp.src(path.join(__dirname))
                .pipe(webServer({
                    port:8080,
                    path:'/',
                    livereload: true,
                    directoryListing: true,
                    open: true
                }))
});

//-----------build-----------------
gulp.task('css-build',() => {
    let runCss = ['copy-image','scss-css','css-spriter'];
    if(projectEnv == 'pro'){
        runCss.push('image-minify');
        runCss.push('css-minify');
    }
    return runSequence.apply(null,runCss);
});
gulp.task('html-build',() => {
    return runSequence('html-create');
});
gulp.task('js-build',() => {
    return runSequence('webpack');
});
gulp.task('webServer-build',() => {
    return runSequence('webServer');
});
//默认执行
gulp.task('default',() => {
    runSequence('clean','css-build','js-build','html-build','webServer-build',() => {
        //watch
        gulp.watch(prejectPublicEntry.css,['css-build']);
        gulp.watch(prejectPublicEntry.js,['js-build']);
        gulp.watch(prejectPublicEntry.html,['html-build']);
    });
});