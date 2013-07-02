'use strict';

exports.run = function(grunt, taskData) {
    var CORS_DELETE_SUCCESS = '✗'.red + ' Deleted CORS for bucket %s';
    var CORS_SET_SUCCESS = '↗'.blue + ' Set CORS for bucket: %s';
    var CORS_GET_SUCCESS = '↙'.yellow + ' Set CORS for bucket: %s';
    var AWS = taskData.AWS;

    var _ = require("underscore");

    if (taskData.data.elb !== undefined) {
        var task = taskData.data.elb;
        var options = _(grunt.config.get('aws.options') || {}).chain()
                .extend(taskData.data.options || {})
                .extend(taskData.data.elb.options || {})
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

        var done = taskData.async();
        grunt.log.writeln(JSON.stringify(task.cors));

        s3.putBucketCors({
            'Bucket': corsOptions.bucket,
            'CORSConfiguration': {
                'CORSRules': [
                    task.cors.CORSRules
                ]
            }
        },
        function(err, data) {
            if (err) {
                grunt.log.writeln(JSON.stringify(err));
                done();
            }
            else {
                grunt.log.writeln(JSON.stringify(data));
                done();
            }
        });
    }
};