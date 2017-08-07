let gulp = require('gulp');
let path = require('path');
let clean = require('gulp-clean');
let scss2css = require('gulp-sass');
let cssMinify = require('gulp-minify-css');
let cssSpriter = require('gulp-css-spriter');
let imageMin = require('gulp-imagemin');
let imagePngquant = require('imagemin-pngquant');
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
    css:entryPath + 'scss/**'
}
let prejectEntry = {
    image:entryPath + 'image/' + projectName + '/**',
    scss:entryPath + 'scss/' + projectName + '/',
}
//工程资源导出目录
let prejectOutput = {
    image:outputPath + projectName + '/image/',
    css:outputPath + projectName + '/css/',
    js:outputPath + projectName + '/js/',
}

//删除原有图片
gulp.task('clean-image', () => {
    return gulp.src(prejectOutput.image)
                .pipe(clean())
});
//复制图片
gulp.task('copy-image', ['clean-image'], () => {
    return gulp.src([ prejectEntry.image, prejectPublicEntry.image ])
                .pipe(gulp.dest(prejectOutput.image))
});
//scss转css
gulp.task('scss-css', ['copy-image'], () => {
    return gulp.src(prejectEntry.scss + 'index.scss')
                .pipe(scss2css())
                .pipe(gulp.dest(prejectOutput.css))
});
//css-spriter
gulp.task('css-spriter', ['scss-css'], () => {
    return gulp.src(prejectOutput.css + 'index.css')
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
gulp.task('image-minify', ['css-spriter'], () => {
    return gulp.src(prejectOutput.image + '**')
                .pipe(imageMin({
                    progressive: true, // 无损压缩JPG图片
                    svgoPlugins: [{removeViewBox: false}], // 不移除svg的viewbox属性
                    use: [imagePngquant()] // 使用pngquant插件进行深度压缩
                }))
                .pipe(gulp.dest(prejectOutput.image))
});
//css-minify
gulp.task('css-minify', ['image-minify'], () => {
    return gulp.src(prejectOutput.css + 'index.css')
                .pipe(cssMinify())
                .pipe(gulp.dest(prejectOutput.css))
});

//webpack
gulp.task('webpack', () => {
    let webpackPlugin = webpack(webpackConifg(projectName, projectEnv));
    webpackPlugin.run((err, status) => {
        console.log('webpack:' + err);
        console.log('webpack:' + status);
    })
});

// css,js
let runCss = projectEnv == 'pro' ? 'css-minify' : 'css-spriter';
let runJs = 'webpack';

//watch
gulp.task('watch', () => {
    gulp.watch(prejectPublicEntry.css,[runCss]);
    gulp.watch(prejectPublicEntry.js,[runJs]);
});




gulp.task('default',() => {
    gulp.start(runCss,runJs,'watch');
});