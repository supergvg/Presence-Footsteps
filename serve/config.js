angular.module("gliist", [])
.constant("production", {"EnvironmentConfig":{"api":"http://gjests.azurewebsites.net/"}})
.constant("development", {"EnvironmentConfig":{"api":"http://gjests-api.ideas-implemented.com/"}})
.constant("staging", {"EnvironmentConfig":{"api":"http://gjests-staging.azurewebsites.net/"}})
.constant("test", {"EnvironmentConfig":{"api":""}});
