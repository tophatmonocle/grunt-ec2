"use strict";

var gru =

module.exports = function(grunt) {
    grunt.registerMultiTask('aws', 'AWS in Grunt.', function() {

        var requiredir = require("require-dir");
        this.AWS = require("aws-sdk");
        this.services = requiredir("./service");
/*
        if (this.data.s3 !== undefined || (this.target === 's3' && this.data.s3 === undefined)) {
            this.services.s3.run(grunt, this);
        }*/

        if (this.data.elb !== undefined || (this.target === 'elb' && this.data.elb === undefined)) {
            this.services.elb.run(grunt, this);
        }

        /*
        if (this.ec2 !== undefined){
            services.ec2.run(config, this.ec2);
        }*/
    });
};