let project_folder = "dist"; // destination folder, where project builds up
let source_folder = "src"; // source folder
let path = {
  build: {                            // Object with paths to build
    html: project_folder+"/",
    css: project_folder+"/css/",
    js: project_folder+"/js/",
    img: project_folder+"/img/",
    fonts: project_folder+"/fonts/"
  },
  src: {                            // Object with paths to sources
    html: [source_folder+"/*.html", "!"+source_folder+"/_*.html"],  //exclude all files with "_" symbol before name
    css: source_folder+"/scss/style.scss",
    js: source_folder+"/js/*.js",
    img: source_folder+"/img/**/*.{jpg,png,svg,gif,ico,webp}",         // ** - means to check all subfolders in img
    fonts: source_folder+"/fonts/*.ttf"
  },

  watch: {                            // Paths to listen files and folders for changes
    html: source_folder+"/**/*.html",
    css: source_folder+"/scss/**/*.scss",
    js: source_folder+"/js/**/*.js",
    img: source_folder+"/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: "./" + project_folder + "/"  // path to clean the "dist" folder when gulp is starting
}

let {src,dest} = require('gulp'),
  gulp = require('gulp'),
  browsersync = require('browser-sync').create(),
  fileinclude = require('gulp-file-include'),
  del = require('del'),
  scss = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  group_media = require('gulp-group-css-media-queries'),
  clean_css = require('gulp-clean-css'),
  rename = require('gulp-rename'),  // helps to create two css files, one for client and one for work ('min.css')
  uglify= require('gulp-uglify-es').default,
  imagemin = require('gulp-imagemin');


function browserSync(params){    // updates the browser with latest changes
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
}

function html(){
  return src(path.src.html)
    .pipe(fileinclude())      // includes all sub-files (header.html, _footer.html etc) into index.html
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())      // move all html files from "src" to "dist" and then reload browser
}

function css(){
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: 'expanded'
      })
    )
    .pipe(
      group_media()
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true
      })
    )
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(rename({
      extname: ".min.css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js(){
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function images(){
  return src(path.src.img)
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        interlaced: true,
        optimizationLevel: 3
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function watchFiles(){
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

function clean () {
  return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(html, css, js, images));  // delete the "dist" folder then build html,css,js
let watch = gulp.parallel(build, watchFiles, browserSync);


exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch; // starts browserSync when call "gulp" in console

