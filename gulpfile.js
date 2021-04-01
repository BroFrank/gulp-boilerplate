const {src, dest} = require('gulp');
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');
const del = require('del');
const sass = require('gulp-sass');
const gulpAutoprefixer = require('gulp-autoprefixer');
const groupeMedia = require('gulp-group-css-media-queries');
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const imageMin = require('gulp-imagemin');
const webp = require('gulp-webp');
const webpHtml = require('gulp-webp-html');
const webpCss = require('gulp-webpcss');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');

const dist_folder = 'dist';
const src_folder = 'src';
const port = 3000;

const path = {
  build: {
    html: dist_folder + '/',
    css: dist_folder + '/css/',
    js: dist_folder + '/js/',
    img: dist_folder + '/img/',
    fonts: dist_folder + '/fonts/',
  },
  src: {
    html: [src_folder + '/*.html', '!' + src_folder + '/_*.html'],
    css: src_folder + '/scss/style.scss',
    js: src_folder + '/js/script.js',
    img: src_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp,jpeg}',
    fonts: src_folder + '/fonts/*.ttf',
  },
  watch: {
    html: src_folder + '/**/*.html',
    css: src_folder + '/scss/**/*.scss',
    js: src_folder + '/js/**/*.js',
    img: src_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
  },
  clean: './' + dist_folder + '/',
};

const browser = () => {
  browserSync.init({
    server: {
      baseDir: path.clean,
    },
    port,
    notify: false,
  });
};

const html = () => {
  return src(path.src.html)
    .pipe(fileInclude())
    .pipe(webpHtml())
    .pipe(dest(path.build.html))
    .pipe(browserSync.stream());
};

const css = () => {
  return src(path.src.css)
  .pipe(
    sass({
      outputStyle: 'expanded',
    })
  )
  .pipe(groupeMedia())
  .pipe(
    gulpAutoprefixer({
      overrideBrowserslist: ['last 5 versions'],
      cascade: true,
    })
  )
  .pipe(webpCss({}))
  .pipe(dest(path.build.css))
  .pipe(cleanCss())
  .pipe(
    rename({
      extname: '.min.css',
    })
  )
  .pipe(dest(path.build.css))
  .pipe(browserSync.stream());
};

const js = () => {
  return src(path.src.js)
    // .pipe(fileInclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: '.min.js',
      })
    )
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browserSync.stream());
};

const images = () => {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imageMin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false, }],
        interlaced: true,
        optimizationLevel: 3
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browserSync.stream());
};

const fonts = () => {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
};

gulp.task('svgSprite', () => {
  return gulp.src([src_folder + '/iconsprite/*.svg'])
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../icons/icons.svg',
            // example: true,
          },
        },
      })
    )
    .pipe(dest(path.build.img));
});

gulp.task('otf2ttf', () => {
  return src([src_folder + '/fonts/*.otf'])
    .pipe(
      fonter({
        formats: ['ttf'],
      })
    )
    .pipe(dest(path.src.fonts));
});

const watchFiles = () => {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
};

const clean = () => {
  return del(path.clean);
};

const build = gulp.series(clean, gulp.parallel(js, css, images, fonts, html));
const watch = gulp.parallel(build, watchFiles, browser);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;