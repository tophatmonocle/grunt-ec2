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
        var eblCreateOptions = _(_.clone(options)).extend(task.create.options || {});
        if (eblCreateOptions.region == 'us-standard') {
            eblCreateOptions.region = 'us-east-1';
        }
        AWS.config.update(_.pick(eblCreateOptions, 'accessKeyId', 'secretAccessKey', 'region'));
        var elb = new AWS.ELB(_.pick(eblCreateOptions, 'accessKeyId', 'secretAccessKey', 'region'));

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
        var eblDeleteOptions = _(_.clone(options)).extend(task.delete.options || {});
        if (eblDeleteOptions.region == 'us-standard') {
            eblDeleteOptions.region = 'us-east-1';
        }
        AWS.config.update(_.pick(eblDeleteOptions, 'accessKeyId', 'secretAccessKey', 'region'));
        var elb = new AWS.ELB(_.pick(eblDeleteOptions, 'accessKeyId', 'secretAccessKey', 'region'));

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
        var eblAddInstancesOptions = _(_.clone(options)).extend(task.addInstances.options || {});
        if (eblAddInstancesOptions.region == 'us-standard') {
            eblAddInstancesOptions.region = 'us-east-1';
        }
        AWS.config.update(_.pick(eblAddInstancesOptions, 'accessKeyId', 'secretAccessKey', 'region'));
        var elb = new AWS.ELB(_.pick(eblAddInstancesOptions, 'accessKeyId', 'secretAccessKey', 'region'));

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
