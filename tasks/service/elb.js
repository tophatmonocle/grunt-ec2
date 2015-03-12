'use strict';

exports.run = function (grunt, taskData) {
    var ELB_INSTANCE_ADD_TO_ELB_SUCCESS = '↗'.yellow + ' Instance(s) added to ELB';
    var ELB_INSTANCE_ADD_TO_ELB_FAIL = '✗'.red + ' Adding instance(s) to ELB failed with %s';
    var ELB_INSTANCE_REMOVE_FROM_ELB_SUCCESS = '↙'.blue + ' Instance(s) removed from ELB';
    var ELB_INSTANCE_REMOVE_FROM_ELB_FAIL = '✗'.red + ' Removing instance from ELB failed with %s';
    
    var AWS = taskData.AWS;

    var _ = require("underscore");

    if (taskData.data.elb !== undefined) {
        var task = taskData.data.elb;
        var options = _(grunt.config.get('aws.options') || {}).chain()
                .extend(taskData.data.options || {})
                .extend(taskData.data.elb.options || {})
                .value();
    } else {
        var task = taskData;
    }

    if (task.create) {
        var elbCreateOptions = _(_.clone(options)).extend(task.create.options || {});
        if (elbCreateOptions.region == 'us-standard') {
            elbCreateOptions.region = 'us-east-1';
        }
        AWS.config.update(_.pick(elbCreateOptions, 'accessKeyId', 'secretAccessKey', 'region'));
        var elb = new AWS.ELB(_.pick(elbCreateOptions, 'accessKeyId', 'secretAccessKey', 'region'));

        task.create.forEach(function (loadBalancer) {
            elb.createLoadBalancer(loadBalancer,
            function (err, data) {
                if (err) {
                    grunt.log.writeln(JSON.stringify(err));
                } else {
                    grunt.log.writeln("ELB " + data.DNSName + " created");
                }
            });
        });
    }

    if (task.delete) {
        var elbDeleteOptions = _(_.clone(options)).extend(task.delete.options || {});
        if (elbDeleteOptions.region == 'us-standard') {
            elbDeleteOptions.region = 'us-east-1';
        }
        AWS.config.update(_.pick(elbDeleteOptions, 'accessKeyId', 'secretAccessKey', 'region'));
        var elb = new AWS.ELB(_.pick(elbDeleteOptions, 'accessKeyId', 'secretAccessKey', 'region'));

        task.delete.forEach(function (loadBalancer) {
            elb.deleteLoadBalancer({"LoadBalancerName": loadBalancer},
            function (err, data) {
                if (err) {
                    grunt.log.writeln(JSON.stringify(err));
                } else {
                    grunt.log.writeln("ELB " + loadBalancer + " deleted");
                }
            });
        });
    }

    if (task.addInstances) {
        var elbAddInstancesOptions = _(_.clone(options)).extend(task.addInstances.options || {});
        if (elbAddInstancesOptions.region == 'us-standard') {
            elbAddInstancesOptions.region = 'us-east-1';
        }
        AWS.config.update(_.pick(elbAddInstancesOptions, 'accessKeyId', 'secretAccessKey', 'region'));
        var elb = new AWS.ELB(_.pick(elbAddInstancesOptions, 'accessKeyId', 'secretAccessKey', 'region'));

        elb.registerInstancesWithLoadBalancer(loadBalancer,
        function (err, data) {
            if (err) {
                grunt.log.writeln(JSON.stringify(err));                    
            } else {
                grunt.log.writeln(JSON.stringify(data.instances) + " instances added to " + loadBalancer.LoadBalancerName);
            }
        });
    }
};
