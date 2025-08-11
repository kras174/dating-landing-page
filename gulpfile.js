const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const del = require('del');

// File paths
const paths = {
	src: {
		html: 'src/**/*.html',
		css: 'src/scss/**/*.scss',
		js: 'src/js/**/*.js',
		images: 'src/images/**/*',
		fonts: 'src/fonts/**/*'
	},
	dist: 'docs',
	watch: 'src/**/*'
};

// Clean dist folder
function clean() {
	return del([paths.dist]);
}

// HTML task
function html() {
	return gulp.src(paths.src.html)
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest(paths.dist))
		.pipe(browserSync.stream());
}

// CSS task
function css() {
	return gulp.src(paths.src.css)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(cleanCSS())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(`${paths.dist}/css`))
		.pipe(browserSync.stream());
}

// JavaScript task
function js() {
	return gulp.src(paths.src.js)
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(`${paths.dist}/js`))
		.pipe(browserSync.stream());
}

// Images task
function images() {
	// Process non-SVG images with optimization
	const nonSvgImages = gulp.src(['src/images/**/*', '!src/images/**/*.svg'])
		.pipe(imagemin())
		.pipe(gulp.dest(`${paths.dist}/images`));

	// Process SVG files without optimization (copy as-is)
	const svgImages = gulp.src('src/images/**/*.svg')
		.pipe(gulp.dest(`${paths.dist}/images`));

	return Promise.all([nonSvgImages, svgImages])
		.then(() => browserSync.stream());
}

// Fonts task
function fonts() {
	return gulp.src(paths.src.fonts)
		.pipe(gulp.dest(`${paths.dist}/fonts`))
		.pipe(browserSync.stream());
}

// Watch files
function watchFiles() {
	gulp.watch(paths.src.html, html);
	gulp.watch(paths.src.css, css);
	gulp.watch(paths.src.js, js);
	gulp.watch(paths.src.images, images);
	gulp.watch(paths.src.fonts, fonts);
}

// Browser sync
function serve() {
	browserSync.init({
		server: {
			baseDir: paths.dist
		},
		port: 3000,
		open: true,
		notify: false
	});
}

// Build task
const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));

// Dev task
const dev = gulp.series(build, gulp.parallel(watchFiles, serve));

// Export tasks
exports.clean = clean;
exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.build = build;
exports.dev = dev;
exports.default = dev;
