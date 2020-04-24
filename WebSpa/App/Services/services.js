(function () {

    angular.module('app.services', [])
        .service("serviceRest", serviceRest)
        .factory('AuthtenticantionIntecerptorService', AuthtenticantionIntecerptorService)
        .factory("AuthService", AuthService)
        .factory("SPAService", SPAService)

    serviceRest.$inject = ['$http', '$q', '$rootScope'];
    AuthtenticantionIntecerptorService.$inject = ['$q', '$location', 'localStorageService', '$stateParams'];
    AuthService.$inject = ['$http', '$q', '$rootScope', '$state', 'localStorageService', '$timeout', '$filter', 'serviceRest'];
    SPAService.$inject = ['$http', '$rootScope', '$q', 'serviceRest'];

    function AuthtenticantionIntecerptorService($q, $location, localStorageService, $stateParams) {

        var authInterceptorServiceFactory = {};

        var _request = function (config) {

            config.headers = config.headers || {};

            var authData = localStorageService.get('authorizationData');
            if (authData) {
                config.headers.Authorization = 'Bearer ' + authData.token;
            }
            return config;
        }

        var _responseError = function (rejection) {
            return $q.reject(rejection);
        }

        authInterceptorServiceFactory.request = _request;
        authInterceptorServiceFactory.responseError = _responseError;

        return authInterceptorServiceFactory;

    }

    function AuthService($http, $q, $rootScope, $state, localStorageService, $timeout, $filter, serviceRest) {

        var authServiceFactory = {};

        var _authentication = {
            isAuth: false,
            userName: "",
            userPassword: ""
        };

        var _login = function (userName, password, validatedIntegration, integrationCode) {

            localStorageService.remove('authorizationData');
            localStorageService.remove('menu');
            localStorageService.remove('clientes');

            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.config.data.TOKEN_URL + '/token',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {
                    grant_type: 'password',
                    username: userName,
                    password: password,
                    validatedintegration: validatedIntegration,
                    integrationcode: integrationCode
                }
            }).then(
                function (response) {
                    localStorageService.set('authorizationData', { token: response.data.access_token, userName: response.data.UserName, userId: response.data.UserId, userRole: response.data.Role, integrationCode: response.data.IntegrationCode, companyId: response.data.CompanyId });

                    $rootScope.userData = { userName: response.data.UserName, userId: response.data.UserId, userRole: response.data.Role }

                    _authentication.isAuth = true;
                    _authentication.userName = userName;
                    _authentication.userPassword = password;
                    _consultarMenu($rootScope.userData.userId);
                    _consultarClientes();

                    deferred.resolve(response);
                },
                function (err) {
                    _logOut();
                    deferred.reject(err);
                }
            )

            return deferred.promise;

        };

        var _logOut = function () {

            localStorageService.remove('authorizationData');
            localStorageService.remove('menu');
            localStorageService.remove('clientes');

            _authentication.isAuth = false;
            _authentication.userName = "";
            _authentication.useRefreshTokens = false;
            $rootScope.userData = { userName: '', userId: '', userRole: '' }

            $timeout(function () { $state.go('login') }, 0);

        };

        var _fillAuthData = function () {

            var authData = localStorageService.get('authorizationData');
            if (authData) {
                _authentication.isAuth = true;
                _authentication.userName = authData.userName;

                $rootScope.userData = { userName: authData.userName, userId: authData.userId }
            }
            else {
                _logOut();
            }

        };

        var _consultarMenu = function () {

            var authorizationData = localStorageService.get('authorizationData');

            $http({
                headers: { 'Content-Type': 'application/json' },
                method: 'GET',
                url: $rootScope.config.data.API_URL + 'SPA/ConsultarMenu?IdUsuario=' + parseInt(authorizationData.userId)
            }).then(function (result) {
                localStorageService.set('menu', result.data);
                $rootScope.$broadcast('successfull.menuload');
            })

        }

        var _consultarClientes = function () {

            var authorizationData = localStorageService.get('authorizationData');

            $http({
                headers: { 'Content-Type': 'application/json' },
                method: 'GET',
                url: $rootScope.config.data.API_URL + 'SPA/ConsultarClientes?IdEmpresa=' + authorizationData.companyId
            }).then(function (result) {
                localStorageService.set('clientes', result.data);
            })

        }

        authServiceFactory.login = _login;
        authServiceFactory.logOut = _logOut;
        authServiceFactory.fillAuthData = _fillAuthData;
        authServiceFactory.authentication = _authentication;
        authServiceFactory.consultarMenu = _consultarMenu
        authServiceFactory.consultarClientes = _consultarClientes;

        return authServiceFactory;
    }

    function SPAService($http, $rootScope, $q, serviceRest) {

        return {
            _registrarActualizarCliente: RegistrarActualizarCliente,
            _consultarClientes: ConsultarClientes
        }

        function RegistrarActualizarCliente(cliente) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'RegistrarActualizarCliente', cliente,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function ConsultarClientes(id_empresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarClientes?IdEmpresa=' + id_empresa,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

    }

    function serviceRest($http, $q, $rootScope) {
        return {
            Get: function (controller, action, callback, errorCallback) {
                var _Uri = $rootScope.config.data.API_URL + controller + (action.trim() != '' ? '/' + action : '');
                return $http(
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        url: _Uri,
                    }).then(callback, errorCallback);
            },
            Patch: function (controller, action, callback, errorCallback) {
                var _Uri = $rootScope.config.data.API_URL + controller + (action.trim() != '' ? '/' + action : '');
                return $http(
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        url: _Uri
                    }).then(callback, errorCallback);
            },
            Post: function (controller, action, data, callback, errorCallback) {
                var _Uri = $rootScope.config.data.API_URL + controller + (action.trim() != '' ? '/' + action : '');
                return $http(
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        url: _Uri,
                        data: data,
                    }).then(callback, errorCallback);
            },
            Put: function (controller, action, data, callback, errorCallback) {
                var _Uri = $rootScope.config.data.API_URL + controller + (action.trim() != '' ? '/' + action : '');
                return $http(
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        url: _Uri,
                        data: data
                    }).then(callback, errorCallback);
            },
            Delete: function (controller, action, data, callback, errorCallback) {
                var _Uri = $rootScope.config.data.API_URL + controller + (action.trim() != '' ? '/' + action : '');
                return $http(
                    {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        url: _Uri,
                        data: data
                    }).then(callback, errorCallback);
            }
        };
    }

})();