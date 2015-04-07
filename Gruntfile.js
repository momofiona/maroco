module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json');
    grunt.initConfig({
        pkg: pkg,
        //copy from bower to tamago/vendor
        /*        copy: {
                    jquery: {
                        src: 'bower_components/jquery/dist/jquery.min.js',
                        dest: 'tamago/vendor/jquery.js',
                        options: {
                            process: function(content, srcpath) {
                                return content.replace("&&define.amd", "&&(define.amd||define.cmd)");
                            }
                        }
                    },
                    bower: {
                        expand: true,
                        cwd: 'bower_components/',
                        src: ['doT/doT.min.js', 'json2/json2.js', 'seajs/dist/sea.js'],
                        dest: 'tamago/vendor/',
                        flatten: true,
                        filter: 'isFile'
                    }
                },*/

        concat: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
                // separator: ';',
                stripBanners: true
            },
            build: {
                files: {
                    'public/maroco.js': [
                        'public/js/vendor/json2.js',
                        'public/js/vendor/sea.js',
                        'public/js/vendor/seajs-text.js',
                        'public/js/vendor/seajs-css.js',
                        'public/js/vendor/jquery.min.js',
                        'public/js/vendor/doT.min.js',
                        'public/js/vendor/underscore-min.js',
                        'public/js/ui/menu.js',
                        //组件只用到了position dragable 
                        //datepicker autocomplete，逐渐淘汰jquery UI
                        //position drag drop sortable继续留用或找其他方案
                        // 'public/js/vendor/jqueryui/jquery-ui.min.js',
                        'public/js/vendor/jqueryui/jquery.ui.core.min.js',
                        'public/js/vendor/jqueryui/jquery.ui.widget.min.js',
                        'public/js/vendor/jqueryui/jquery.ui.mouse.min.js',
                        'public/js/vendor/jqueryui/jquery.ui.position.min.js',
                        'public/js/vendor/jqueryui/jquery.ui.draggable.min.js', //notify.js 使用，19K 可精简
                        'public/js/vendor/jqueryui/jquery.ui.sortable.min.js', //table.js 使用，这货居然24K，算法肯定不咋的

                        //navgoco 这个可以去除
                        'public/js/vendor/jquery.cookie.min.js'


                    ]
                }
            }
        },
        uglify: {
            options: {
                mangle: {
                    except: ['jQuery', 'define', 'require']
                }
            },
            ui:{
                files:{
                    'public/_ui.js':'public/js/ui/ui.js'
                }
            },
            allui: {
                files: [{
                    expand: true,
                    cwd: 'public/js/ui', //js目录下
                    src: '*.js', //所有js文件
                    dest: 'public/js/_ui' //输出到此目录下
                }]
            }
        },
        jshint: {
            beforeconcat: [],
            afterconcat: []
        },
        watch: {
            /*            less: {
                            files: ['css/*.less'],
                            tasks: ['less']
                        },*/
            livereload: {
                options: {
                    livereload: true //'<%= connect.options.livereload %>'
                },
                files: ['public/css/*.css', 'public/js/*.js', 'public/*.html']
            }
        },
        connect: {
            options: {
                port: 9001,
                livereload: 35731,
                // change this to '0.0.0.0' to access the server from outside  
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: 'http://<%= connect.options.hostname %>:<%= connect.options.port %>/',
                }
            }
        },
        jsdoc: {
            dist: {
                src: 'book.js',
                options: {
                    destination: 'jsdoc'
                }
            }
        },
        clean: {
            build: ['public/js/_ui/*']
        }
    });

    //loadNpmTasks
    for (var key in pkg.devDependencies) {
        grunt.loadNpmTasks(key);
        console.log('loadNpmTasks:' + key);
    };
    //grunt.registerTask('default', ['copy', 'uglify', 'concat']);
    grunt.registerTask('default', ['concat','uglify:ui']);
    grunt.registerTask('liveload', ['watch:livereload']);
    grunt.registerTask('less', ['less:dev']);
    grunt.registerTask('doc', ['jsdoc']);

    /*    grunt.event.on('watch', function(action, filepath, target) {
            // grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
        });*/
};
