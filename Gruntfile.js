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
                },
        less: {
            dev: {
                options: {
                    paths: ["css"]
                },
                files: {
                    "css/*.css": "css/*.less"
                }
            },
            prod: {
                options: {
                    paths: ["assets/css"],
                    cleancss: true,
                    modifyVars: {
                        imgPath: '"http://mycdn.com/path/to/images"',
                        bgColor: 'red'
                    }
                },
                files: {
                    "path/to/result.css": "path/to/source.less"
                }
            }
        },*/
        concat: {
            options: {
                banner:'/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
                // separator: ';',
                stripBanners: true
            },
            build: {
                files: {
                    'public/js/maroco.js': [
                        'public/js/vendor/json2.js',
                        'public/js/vendor/sea.js',
                        'public/js/vendor/seajs-text.js',
                        'public/js/vendor/seajs-css.js',
                        'public/js/vendor/jquery.js',
                        'public/js/vendor/doT.min.js',
                        'public/js/vendor/underscore-min.js',
                        // 'public/js/vendor/backbone-min.js',
                        // 'public/js/vendor/doT.min.js',
                        //组件只用到了menu dialog datepicker autocomplete，逐渐淘汰jquery UI
                        //position drag drop sortable继续留用或找其他方案
                        'public/js/vendor/jqueryui/jquery-ui.min.js',
                        'public/js/vendor/jquery.cookie.min.js',
                        'public/js/vendor/navgoco/jquery.navgoco.min.js'
                        

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
            build: {
                files: {
                    'public/js/_ui.js': 'public/js/ui/ui.js'
                }
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
                    livereload: true//'<%= connect.options.livereload %>'
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
        clean:{
            build:['_config.js']
        }
    });

    //loadNpmTasks
    for(var key in pkg.devDependencies){
        grunt.loadNpmTasks(key);
        console.log('loadNpmTasks:'+key);
    };
    //grunt.registerTask('default', ['copy', 'uglify', 'concat']);
    grunt.registerTask('default', ['uglify:build','concat',"clean:build"]);
    grunt.registerTask('liveload', ['watch:livereload']);
    grunt.registerTask('less', ['less:dev']);
    grunt.registerTask('doc', ['jsdoc']);

    /*    grunt.event.on('watch', function(action, filepath, target) {
            // grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
        });*/
};
