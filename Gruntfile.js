module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //copy from bower to tamago/vendor
        copy: {
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
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            build: {
                files: {
                    'tamago/tamago.js': [
                        'tamago/vendor/json2.js',
                        'tamago/vendor/sea.js',
                        'tamago/sea.config.js',
                        'tamago/vendor/jquery.js',
                        'tamago/vendor/doT.min.js'
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
                    'tamago/vendor/json2.js': 'bower_components/json2/json2.js'
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
                    livereload: '<%= connect.options.livereload %>'
                },
                files: ['css/*.css', 'js/*.js', './*.html']
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
                    open: 'http://<%= connect.options.hostname %>:<%= connect.options.port %>/main/print.html',
                }
            }
        },
        jsdoc: {
            dist: {
                src: 'book.js',
                options: {
                    destination: 'doc'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-devtools');



    grunt.registerTask('default', ['copy', 'uglify', 'concat']);
    grunt.registerTask('watch', ['watch']);
    grunt.registerTask('less', ['less']);
    grunt.registerTask('doc', ['jsdoc']);
    grunt.registerTask('usebower', ['copy']);

    grunt.event.on('watch', function(action, filepath, target) {
        // grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });
};
