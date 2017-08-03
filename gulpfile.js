let gulp = require('gulp');
let path = require('path');
let clean = require('gulp-clean');
let scss2css = require('gulp-sass');
let minifyCss = require('gulp-minify-css');
let cssSpriter = require('gulp-css-spriter');
let imageMin = require('gulp-imagemin');

let NODE_ENV = process.env.NODE_ENV.split('::'),
    projectName = NODE_ENV[0],
    projectDev = NODE_ENV[1] == 'dev';
let entryPath = path.join(__dirname,'src/'),
    outPath = path.join(__dirname,'dist/');

//工程引入目录
let prejectPublicEntry = {
    image:entryPath + 'image/public/**',
    scss:entryPath + 'scss/public/',
    js:entryPath + 'js/public/',
}
let prejectEntry = {
    image:entryPath + 'image/' + projectName + '/**',
    scss:entryPath + 'scss/' + projectName + '/',
    js:entryPath + 'js/' + projectName + '/',
}
//工程导出目录
let prejectOut = {
    image:outPath + projectName + '/image/',
    css:outPath + projectName + '/css/',
    js:outPath + projectName + '/js/',
}

//删除原有图片
gulp.task('clean-image',() => {
    return gulp.src(prejectOut.image)
                .pipe(clean())
});
//复制图片
gulp.task('copy-image',['clean-image'],() => {
    return gulp.src([ prejectEntry.image, prejectPublicEntry.image ])
                .pipe(gulp.dest(prejectOut.image))
});
//scss转css
gulp.task('scss-css',['copy-image'],() => {
    return gulp.src(prejectEntry.scss + 'index.scss')
                .pipe(scss2css())
                .pipe(gulp.dest(prejectOut.css))
});
//css-spriter
gulp.task('css-spriter',['scss-css'],() => {
    return gulp.src(prejectOut.css + 'index.css')
                .pipe(cssSpriter({
                    // 生成的spriter的位置
                    spriteSheet: prejectOut.image +'spriter/' + projectName + '.png',
                    // 生成样式文件图片引用地址的路径
                    pathToSpriteSheetFromCSS: '../image/spriter/' + projectName + '.png'
                }))
                .pipe(gulp.dest(prejectOut.css))
});
//css-minify
gulp.task('css-minify',['css-spriter'],() => {
    return gulp.src(prejectOut.css + 'index.css')
                .pipe(minifyCss())
                .pipe(gulp.dest(prejectOut.css))
});
//image-minify
gulp.task('image-minify',['css-minify'],() => {
    return gulp.src(prejectOut.image + '**')
                .pipe(imageMin())
                .pipe(gulp.dest(prejectOut.image))
})
gulp.task('default', () => {
    return (() => {
        let runCss = projectDev ? 'css-spriter' : 'image-minify';
        gulp.start(runCss);
    })()
});