(function () {
    angular.module('app.services', [])
        .service("serviceRest", serviceRest)
        .factory('AuthtenticantionIntecerptorService', AuthtenticantionIntecerptorService)
        .factory("AuthService", AuthService)
        //.factory("DSDService", DSDService)

    serviceRest.$inject = ['$http', '$q', '$rootScope'];
    AuthtenticantionIntecerptorService.$inject = ['$q', '$location', 'localStorageService', '$stateParams'];
    AuthService.$inject = ['$http', '$q', '$rootScope', '$state', 'localStorageService', '$timeout', '$filter', 'serviceRest'];
    //DSDService.$inject = ['$http', '$rootScope', '$q', 'serviceRest'];

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
                    localStorageService.set('authorizationData', { token: response.data.access_token, userName: response.data.UserName, userId: response.data.UserId, userRole: response.data.Role, integrationCode: response.data.IntegrationCode });

                    $rootScope.userData = { userName: response.data.UserName, userId: response.data.UserId, userRole: response.data.Role }

                    _authentication.isAuth = true;
                    _authentication.userName = userName;
                    _authentication.userPassword = password;

                    deferred.resolve(response);
                },
                function (err) {
                    _logOut();
                    deferred.reject(err);
                }
            )

            return deferred.promise;
        };

        //var _login = function (userName, password, validatedIntegration, integrationCode) {
        //    var deferred = $q.defer();
        //    serviceRest.Get('SPA', 'ValidarUsuario?Nombre=' + userName + '&Password=' + password + '&ValidarIntegracion=' + validatedIntegration + '&CodigoIntegracion=' + integrationCode
        //         ,
        //        function (data) {
        //            deferred.resolve(data);
        //        },
        //        function (err) {
        //            deferred.reject(err);
        //        });
        //    return deferred.promise;
        //}

        var _logOut = function () {
            localStorageService.remove('authorizationData');
            //localStorageService.remove('menu');

            _authentication.isAuth = false;
            _authentication.userName = "";
            _authentication.useRefreshTokens = false;
            $rootScope.userData = { userName: '', userId: '', userRole: ''}

            $timeout(function () { $state.go('login') }, 0);
        };

        var _fillAuthData = function () {
            var authData = localStorageService.get('authorizationData');
            if (authData) {
                _authentication.isAuth = true;
                _authentication.userName = authData.userName;

                $rootScope.userData = { userName: authData.userName, userId: authData.userId }

                //if (authData.companyCode == "Local") $rootScope.userData.companyCode = "FFT";
            }
            else {
                _logOut();
            }
        };

        //var _getMenu = function () {
        //    var authorizationData = localStorageService.get('authorizationData');

        //    $http({
        //        headers: { 'Content-Type': 'application/json' },
        //        method: 'GET',
        //        url: $rootScope.config.data.API_URL + 'DSD/GetMenu?endPoint=' + authorizationData.endPoint + '&UserId=' + authorizationData.userId
        //    }).then(function (result) {
        //        localStorageService.set('menu', result.data);
        //        $rootScope.$broadcast('successfull.menuload');
        //    })
        //}

        authServiceFactory.login = _login;
        authServiceFactory.logOut = _logOut;
        authServiceFactory.fillAuthData = _fillAuthData;
        authServiceFactory.authentication = _authentication;
        //authServiceFactory.getCompanies = _getCompanies;
        //authServiceFactory.getMenu = _getMenu

        return authServiceFactory;
    }

    //function DSDService($http, $rootScope, $q, serviceRest) {
    //    return {
    //        getColorsByCategory: GetColorsByCategory,
    //        getInventory: GetInventory,
    //        getInventoryDetails: GetInventoryDetails,
    //        saveInventory: SaveInventory,
    //        saveProcess: SaveProcess,
    //        getProductCategory: GetProductCategory,
    //        getProductCategoryAvailableWF: GetProductCategoryAvailableWF,
    //        saveProductCategories: SaveProductCategories,
    //        getRTVReasons: GetRTVReasons,
    //        getAllSchematics: GetAllSchematics,
    //        getShrinkByRtvAndStore: GetShrinkByRtvAndStore,
    //        getShrinkDetails: GetShrinkDetails,
    //        saveShrink: SaveShrink,
    //        getStoreAndMarchandisers: GetStoreAndMarchandisers,
    //        saveSettings: SaveSettings
    //    }

    //    function GetColorsByCategory(categoryId) {
    //        var deferred = $q.defer();
    //        serviceRest.Get('DSD', 'GetColorsByCategory?CategoryId=' + categoryId,
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }

    //    function GetInventory(date) {
    //        var deferred = $q.defer();
    //        serviceRest.Get('DSD', 'GetInventory?Date=' + date,
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }

    //    function GetInventoryDetails(companyCode, storeNumber, merchandiser, date) {
    //        var deferred = $q.defer();

    //        serviceRest.Get('DSD', 'GetInventoryDetails?CompanyCode=' + companyCode + '&Store=' + storeNumber + '&Merchandiser=' + merchandiser + '&Date=' + date,
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }

    //    function SaveInventory(source) {
    //        var deferred = $q.defer();

    //        serviceRest.Post('DSD', 'SaveInventory', source,
    //            function (data, status) {
    //                deferred.resolve(data);
    //            },
    //            function (err, status) {
    //                deferred.reject(err);
    //            });

    //        return deferred.promise;
    //    }

    //    function SaveProcess(date, storeNumber) {
    //        var deferred = $q.defer();

    //        serviceRest.Get('DSD', 'SaveProcess?Date=' + date + '&StoreNumber=' + storeNumber,
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }

    //    function GetProductCategory(companyCode) {
    //        var deferred = $q.defer();
    //        serviceRest.Get('DSD', 'GetProductCategory?CompanyCode=' + companyCode,
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }

    //    function GetProductCategoryAvailableWF(companyCode) {
    //        var deferred = $q.defer();
    //        serviceRest.Get('DSD', 'GetProductCategoryAvailableWF?CompanyCode=' + companyCode,
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }

    //    function SaveProductCategories(source) {
    //        var deferred = $q.defer();
    //        serviceRest.Post('DSD', 'SaveProductCategories', source,
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }

    //    function GetRTVReasons() {
    //        var deferred = $q.defer();
    //        serviceRest.Get('DSD', 'GetRTVReasons',
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }

    //    function GetAllSchematics() {
    //        var deferred = $q.defer();
    //        serviceRest.Get('DSD', 'GetAllSchematics',
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }

    //    function GetShrinkByRtvAndStore(storeNumber, RTV) {

    //        var deferred = $q.defer();
    //        serviceRest.Get('DSD', 'GetShrinkByRtvAndStore?Store=' + storeNumber + '&RTVNumber=' + RTV,
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }

    //    function GetShrinkDetails(companyCode, storeNumber, RTV, dateShrink) {
    //        var deferred = $q.defer();
    //        serviceRest.Get('DSD', 'GetShrinkDetails?CompanyCode=' + companyCode + '&Store=' + storeNumber + '&RTVNumber=' + RTV + '&DateShrink=' + dateShrink,
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }

    //    function SaveShrink(source) {
    //        var deferred = $q.defer();
    //        serviceRest.Post('DSD', 'SaveShrink', source,
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }

    //    function GetStoreAndMarchandisers(endPoint, userId) {
    //        var deferred = $q.defer();
    //        serviceRest.Get('DSD', 'GetStoreAndMarchandisers?endPoint=' + endPoint + '&userId=' + userId,
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }

    //    function SaveSettings(source) {
    //        var deferred = $q.defer();
    //        serviceRest.Post('DSD', 'SaveSettings', source,
    //            function (data) {
    //                deferred.resolve(data);
    //            },
    //            function (err) {
    //                deferred.reject(err);
    //            });
    //        return deferred.promise;
    //    }
    //}

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