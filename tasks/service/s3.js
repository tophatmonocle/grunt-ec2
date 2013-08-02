'use strict';

exports.run = function(grunt, taskData) {
    var CORS_DELETE_SUCCESS = '✗'.red + ' Deleted CORS for bucket %s';
    var CORS_SET_SUCCESS = '↗'.blue + ' Set CORS for bucket: %s';
    var CORS_GET_SUCCESS = '↙'.yellow + ' Set CORS for bucket: %s';
    var AWS = taskData.AWS;

    var _ = require("underscore");
    var util = require('util');
    var done = taskData.async();

    if (taskData.data.s3 !== undefined) {
        var task = taskData.data.s3;
        var options = _(grunt.config.get('aws.options') || {}).chain()
                .extend(taskData.data.options || {})
                .extend(taskData.data.s3.options || {})
                .value();
    }
    else {
        var task = taskData;
    }

    if (task.cors) {
        var corsOptions = _(_.clone(options)).extend(task.cors.options || {});
        if (corsOptions.region == 'us-standard') {
            corsOptions.region = 'us-east-1';
        }
        AWS.config.update(_.pick(corsOptions, 'accessKeyId', 'secretAccessKey', 'region'));
        var s3 = new AWS.S3(_.pick(corsOptions, 'accessKeyId', 'secretAccessKey', 'region'));

        s3.putBucketCors({
            'Bucket': corsOptions.bucket,
            'CORSConfiguration': {
                'CORSRules': [
                    task.cors.rules
                ]
            }
        },
        function(err, data) {
            if (err) {
                grunt.log.writeln(JSON.stringify(err));
            }
            else {
                grunt.log.writeln(util.format(CORS_SET_SUCCESS,corsOptions.bucket));
            }
            done();
        });
    }
};