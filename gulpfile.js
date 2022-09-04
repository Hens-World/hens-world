// fetch command line arguments
var rewrite = require('http-rewrite-middleware');

const CERT_ROOT = process.env.CERT_ROOT ?? "C:/nginx-1.21.6/certs";
const arg = (argList => {
    let arg = {}, a, opt, thisOpt, curOpt;
    for (a = 0; a < argList.length; a++) {
        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, '');
        if (opt === thisOpt) {
            // argument value
            if (curOpt) arg[curOpt] = opt;
            curOpt = null;
        } else {
            // argument name
            curOpt = opt;
            arg[curOpt] = true;
        }
    }
    return arg;
})(process.argv);

const through2 = require('through2');
const touch = () => through2.obj(function (file, enc, cb) {
    if (file.stat) {
        file.stat.atime = file.stat.mtime = file.stat.ctime = new Date();
    }
    cb(null, file);
});

const gulp = require('gulp');
const morgan = require('morgan');
const fs = require('fs');
const debug = require('gulp-debug');
const concat = require('gulp-concat');
const jade = require('gulp-jade');
const less = require('gulp-less');
const open = require('gulp-open');
const uglify = require('gulp-uglify');
const jsonmini = require('gulp-jsonminify');
const cssminify = require('gulp-minify-css');
const minify = require('gulp-minify');
const replace = require('gulp-replace-task');
const gulpif = require('gulp-if');
const util = require('gulp-util');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const babel = require('gulp-babel');
const flatten = require('gulp-flatten');
const connect = require('gulp-connect');
const watch = require('gulp-watch');
const path = require('path');
var history = require('connect-history-api-fallback');
const pkg = require('./package.json');
let prod = !!util.env.release;
const preprod = !!util.env.preprod;
const prodDebug = !!util.env.prodDebug;
const base = prod ? '/' : '/';
const nodeUrl = prod || prodDebug ? 'https://node.hens-world.com' : 'https://localhost:8080';
// const nodeUrl = prod || prodDebug ? 'https://node.hens-world.com' : 'http://localhost:8282';


const dest = str => gulp.dest('./' + str);

const handleError = function (res) {
    console.error('resss', res);
    this.emit('end');
};
gulp.task('compileServiceWorker', async () => {
    return await gulp
        .src(['src/worker/*.js'])
        .pipe(replace({
            patterns: [
                {
                    match: 'nodeUrl',
                    replacement: nodeUrl
                }, {
                    match: 'currentVersion',
                    replacement: pkg.version
                },
                {
                    match: 'cacheVersion',
                    replacement: prod || preprod ? pkg.version : Math.random()
                }
            ]
        }))
        .pipe(concat("service-worker.js"))
        .pipe(gulpif(prod || preprod, babel({
            presets: ['es2015']
        })))
        .pipe(gulpif(prod || preprod, uglify({ mangle: false }).on('error', handleError)))
        .pipe(rename(`service-worker.js`))
        .pipe(touch())
        .pipe(dest(`./dist/`));
});
gulp.task('compileJs', async () => {
    /** SHARED MAIN MODULES **/
    await gulp.src([
        'src/app/app.js', 'src/app/util.js', 'src/app/factories/*.js', 'src/app/config/*.js',
        'src/app/shared/**/*.js'
    ])
        .pipe(replace({
            patterns: [
                {
                    match: 'nodeUrl',
                    replacement: nodeUrl
                }, {
                    match: 'currentVersion',
                    replacement: pkg.version
                }
            ]
        }))
        // .pipe(js({bare: true}).on('error', handleError))
        .pipe(concat("scripts.js"))
        .pipe(gulpif(prod || preprod, babel({
            presets: ['es2015']
        })))
        .pipe(gulpif(prod || preprod, uglify({ mangle: false }).on('error', handleError)))
        .pipe(rename(`scripts.js`))
        .pipe(dest(`./dist/version-${pkg.version}/js`));

    /** MOBILE SCRIPTS **/
    await gulp.src([
        'src/app/mobile/**/*.js'
    ])
        .pipe(replace({
            patterns: [
                {
                    match: 'nodeUrl',
                    replacement: nodeUrl
                }, {
                    match: 'currentVersion',
                    replacement: pkg.version
                }
            ]
        }))
        // .pipe(js({bare: true}).on('error', handleError))
        .pipe(concat("scripts.js"))
        .pipe(gulpif(prod || preprod, babel({
            presets: ['es2015']
        })))
        .pipe(gulpif(prod || preprod, uglify({ mangle: false }).on('error', handleError)))
        .pipe(rename(`scripts_mobile.js`))
        .pipe(dest(`./dist/version-${pkg.version}/js`));

    /** DESKTOP SCRIPTS **/
    return await gulp.src([
        'src/app/desktop/**/*.js'
    ])
        .pipe(replace({
            patterns: [
                {
                    match: 'nodeUrl',
                    replacement: nodeUrl
                }, {
                    match: 'currentVersion',
                    replacement: pkg.version
                }
            ]
        }))
        // .pipe(js({bare: true}).on('error', handleError))
        .pipe(concat("scripts.js"))
        .pipe(gulpif(prod || preprod, babel({
            presets: ['es2015']
        })))
        .pipe(gulpif(prod || preprod, uglify({ mangle: false }).on('error', handleError)))
        .pipe(rename(`scripts_desktop.js`))
        .pipe(dest(`./dist/version-${pkg.version}/js`));
});

var libs = [
    'node_modules/jquery/dist/jquery.min.js', 'node_modules/easeljs/lib/easeljs.min.js',
    'node_modules/angular/angular.min.js', 'node_modules/angular-route/angular-route.min.js',
    'node_modules/angular-sanitize/angular-sanitize.min.js', 'node_modules/angular-resource/angular-resource.min.js',
    'ext_libs/jquery.nicescroll.custom.js', 'ext_libs/angular-file-upload.js', 'ext_libs/moment-with-locales.js',
    'node_modules/angularjs-slider/dist/rzslider.min.js', 'node_modules/textangular/dist/textAngular-sanitize.js',
    'node_modules/textangular/dist/textAngularSetup.js', 'node_modules/textangular/dist/textAngular-rangy.min.js',
    'node_modules/textangular/dist/textAngular.js', 'ext_libs/TweenMax.min.js', 'ext_libs/preloadjs-0.6.0.min.js',
    'node_modules/socket.io-client/dist/socket.io.slim.js', 'node_modules/lottie-web/build/player/lottie_light.min.js'
];
gulp.task('compileLibs', async () => {
    await gulp.src(libs)
        .pipe(concat('libs.js'))
        .pipe(rename(`libs.js`))
        .pipe(gulpif(prod || preprod, minify().on('error', handleError)))
        .pipe(dest(`./dist/version-${pkg.version}/js/libs`));

    return gulp.src(libs)
        .pipe(dest(`dist/version-${pkg.version}/js/libs/src`));
});

gulp.task('deposeExternals', async function () {
    gulp.src(['node_modules/tone/build/Tone.js'])
        .pipe(dest('./dist/js/externals/'));

    gulp.src(['ext_libs/html2canvas.js'])
        .pipe(dest('./dist/js/externals/'));

    gulp.src(['src/robots.txt'])
        .pipe(dest('./dist/'));

    return gulp.src(['./manifest.json'])
        .pipe(dest('./dist/'));
});

gulp.task('deployVersion', gulp.series('compileServiceWorker', async function () {

    let version = arg.app_version ? arg.app_version : pkg.version
    /** index file**/
    return await gulp.src(['src/app/index.html'])
        .pipe(replace({
            patterns: [
                {
                    match: 'currentVersion',
                    replacement: version
                }
            ]
        }))
        .pipe(replace({
            patterns: [
                {
                    match: 'base',
                    replacement: base
                }
            ]
        }))
        .pipe(rename('index.html'))
        .pipe(dest('./dist/'))
}));

/********** JADE COMPILE *************/
gulp.task('compileJade', async function () {

    /*********** DESKTOP *************/
    await gulp.src([
        'src/app/desktop/**/*.jade'
    ])
        .pipe(flatten())
        .pipe(jade().on('error', handleError))
        .pipe(dest(`./dist/version-${pkg.version}/templates/desktop/`));

    /*********** MOBILE *************/
    await gulp.src([
        'src/app/mobile/**/*.jade'
    ])
        .pipe(flatten())
        .pipe(jade().on('error', handleError))
        .pipe(dest(`./dist/version-${pkg.version}/templates/mobile/`));

    /*********** SHARED *************/
    await gulp.src([
        'src/app/shared/**/*.jade'
    ])
        .pipe(flatten())
        .pipe(jade().on('error', handleError))
        .pipe(dest(`./dist/version-${pkg.version}/templates/shared/`));
});


/*********** LESS COMPILE *************/
gulp.task('compileLess', async () => {
    /**** MOBILE ****/
    await gulp.src([
        'src/app/mobile/mobile.less',
        'src/app/mobile/**/*.less'
    ])
        .pipe(concat("style_mobile.less"))
        .pipe(less().on('error', handleError))
        .pipe(rename(`style_mobile.css`))
        .pipe(dest(`./dist/version-${pkg.version}/`));

    /*** DESKTOP ***/
    await gulp.src([
        'src/app/desktop/desktop.less',
        'src/app/desktop/**/*.less'
    ])
        .pipe(concat("style_desktop.less"))
        .pipe(less().on('error', handleError))
        .pipe(rename(`style_desktop.css`))
        .pipe(dest(`./dist/version-${pkg.version}/`));

    /*** GLOBAL ***/
    return await gulp.src([
        'src/styles/style.less',
        'src/app/shared/**/*.less'
    ])
        .pipe(concat("style.less"))
        .pipe(less({
            paths: [path.join(__dirname, 'src/styles/')]
        }).on('error', handleError))
        .pipe(rename(`style.css`))
        .pipe(dest(`./dist/version-${pkg.version}/`))
    // .pipe(gulpif(!prod && !preprod && !prodDebug, browserSync.stream()))
});

gulp.task('compileJson', () => {
    return gulp.src(['src/json/**/*.json', 'src/json/*.json'])
        .pipe(jsonmini().on('error', handleError))
        // .pipe(rename(path => path.basename += `_${pkg.version}`))
        .pipe(dest(`./dist/version-${pkg.version}/json/`))
});

gulp.task('webserver', () => {
    return connect.server({
        name: "Hens Front End",
        https: {
            key: fs.readFileSync(CERT_ROOT + "/localhost-key.pem"),
            cert: fs.readFileSync(CERT_ROOT + "/localhost.pem"),
        },
        port: 8081,
        // livereload: true, // doesn't work for now :(
        middleware: function (connect, opt) {
            return [history(connect)];
            // return [history, morgan]
        },
        root: ["./dist/", "./"]
    })
});


gulp.task('serve', gulp.series([
    'compileLess', 'compileJson', 'compileLibs', 'compileJs', 'compileJade', 'deposeExternals', 'compileServiceWorker', 'deployVersion'
], async function () {
    if (!prod && !preprod && !prodDebug) {
        // browserSync.init({
        //     // proxy: 'hens-world.dev'
        //     open: false
        // });
        await gulp.watch(['src/app/index.html', 'src/app/shared/**/*.jade', 'src/app/desktop/**/*.jade', 'src/app/mobile/**/*.jade'], gulp.series(['compileJade', 'deployVersion', 'compileServiceWorker']));
        await gulp.watch(['src/**/*.js', 'src/app/shared/**/*.js', 'src/app/desktop/**/*.js', 'src/app/mobile/**/*.js'], gulp.series(['compileJs', 'compileServiceWorker']));
        await gulp.watch(['src/styles/**/*.less', 'src/app/**/*.less'], gulp.series(['compileLess', 'compileServiceWorker']));
        return await gulp.watch(['src/json/**/*.json'], gulp.series(['compileJson', 'compileServiceWorker']));
    }
}));

gulp.task('release', gulp.series([
    'compileLess', 'compileJson', 'compileLibs', 'compileJs', 'compileJade', 'deposeExternals',
]));

gulp.task('default', gulp.series(['serve', 'webserver']));