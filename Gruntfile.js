module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    blueprints: {
      templates: {
         options: { minify: false },
         src: 'templates/',
         dest: 'js/ui/templates.js'
      }
    },
    concat: {
      css: {
        src: ['css/**/*.css'],
        dest: 'dist/<%= pkg.name %>.css'
      },
      js: {
        options: { separator: ';' },
        src: ['js/ext/*.js', 'js/ui/drawingboard.js', 'js/ui/*.js', 'js/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: { banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n' },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.js.dest %>']
        }
      }
    },
    cssmin: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.css': ['<%= concat.css.dest %>']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-blueprints');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['blueprints', 'concat', 'uglify', 'cssmin']);

};
