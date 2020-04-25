module.exports = grunt => {
    const files = {
        mainJs: 'src/main.js',
        serverJs: 'src/**/*.js',
        testServerJs: 'test/**/*.js',
        clientAppJs: 'public/src/app.js',
        clientJs: 'public/src/**/*.js',
        testClientJs: 'public/test/**/*.js',
        clientLibJs: [
            'public/lib/angular/angular.js',
            'public/lib/angular-*/*.js',
            'public/lib/lodash/lodash.js',
        ],
        distJs: 'public/dist/app.js',
        bowerTargetDir: 'public/lib',
        initJs: 'tools/init.js',
    };

    const confFiles = {
        eslintServer: '.eslintrc.server.json',
        eslintClient: '.eslintrc.client.json',
        karma: 'karma.conf.js',
    };

    grunt.initConfig({
        env: {
            development: {
                NODE_ENV: 'development',
            },
            test: {
                NODE_ENV: 'test',
            }
        },
        run: {
            server: {
                args: [
                    files.mainJs
                ]
            }
        },
        concat: {
            dist: {
                options: {
                    // Replace all 'use strict' statements in the code with a single one at the top
                    banner: "'use strict';\n",
                    process: (src, filepath) => {
                        return '// Source: ' + filepath + '\n' + src.replace(/(^|\n)[ \t]*('use strict');?\s*/g, '$1');
                    },
                },
                files: [
                    {
                        src: [files.clientAppJs, files.clientJs],
                        dest: files.distJs
                    }
                ]
            },
        },
        bower: {
            install: {
                options: {
                    targetDir: files.bowerTargetDir,
                    copy: true,
                    install: true,
                    verbose: false,
                    cleanup: true,
                }
            }
        },
        execute: {
            init: {
                src: files.initJs
            },
        },
        mochaTest: {
            test: {
                src: files.testServerJs
            },
            options: {
                reporter: 'spec',
                timeout: 4000
            }
        },
        mocha_nyc: {
            coverage: {
                src: files.testServerJs,
                options: {
                    mochaOptions: ['--exit']
                }
            }
        },
        eslint: {
            server: {
                src: [
                    files.serverJs,
                    files.testServerJs,
                    files.mainJs,
                ],
                options: {
                    configFile: confFiles.eslintServer
                }
            },
            client: {
                src: [
                    files.clientJs,
                    files.testClientJs
                ],
                options: {
                    configFile: confFiles.eslintClient
                }
            },
        },
        karma: {
            options: {
                configFile: confFiles.karma,
                files: [
                    files.clientLibJs,
                    files.clientAppJs,
                    files.clientJs,
                    files.testClientJs,
                ],
            },
            test: {
                singleRun: true,
                reporters: ['progress'],
            },
            coverage: {
                singleRun: true,
                reporters: ['progress', 'coverage'],
                preprocessors: {
                    [files.clientJs]: ['coverage']
                },
                coverageReporter: {
                    reporters: [
                        {
                            type : 'html',
                        },
                        {
                            type : 'text-summary',
                        }
                    ]
                }
            },
            tdd: {
                singleRun: false,
                autoWatch: true,
                reporters: ['progress', 'coverage'],
                preprocessors: {
                    [files.clientJs]: ['coverage']
                },
                coverageReporter: {
                    reporters: [
                        {
                            type : 'html',
                        },
                        {
                            type : 'text-summary',
                        }
                    ]
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('init', ['env:development', 'execute:init']);
    grunt.registerTask('dist', ['concat']);
    grunt.registerTask('runServer', ['env:development', 'dist', 'run:server']);
    grunt.registerTask('test', ['env:test', 'mochaTest:test', 'karma:test']);
    grunt.registerTask('coverage', ['env:test', 'mocha_nyc:coverage', 'karma:coverage']);
    grunt.registerTask('lint', ['eslint']);
};
