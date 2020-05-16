(function () {

    angular.module('app.services', [])
        .service("serviceRest", serviceRest)
        .factory('AuthtenticantionIntecerptorService', AuthtenticantionIntecerptorService)
        .factory("AuthService", AuthService)
        .factory("SPAService", SPAService)

    serviceRest.$inject = ['$http', '$q', '$rootScope'];
    AuthtenticantionIntecerptorService.$inject = ['$q', '$location', 'localStorageService', '$stateParams'];
    AuthService.$inject = ['$http', '$q', '$rootScope', '$state', 'localStorageService', '$timeout', '$filter', 'serviceRest'];
    SPAService.$inject = ['$http', '$rootScope', '$q', 'serviceRest', 'localStorageService'];

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
            localStorageService.remove('masterdataMenu');
            localStorageService.remove('masterDataTipoClientes');
            localStorageService.remove('masterdataClientes');
            localStorageService.remove('masterdataMunicipios');
            localStorageService.remove('masterdataBarrios');
            localStorageService.remove('masterdataTipoServicio');
            localStorageService.remove('masterdataTipoTransacciones');

            $rootScope.Menu = [];
            $rootScope.TipoClientes = [];
            $rootScope.Clientes = [];
            $rootScope.Municipios = [];
            $rootScope.Barrios = [];

            $rootScope.Id_Empresa = '';
            $rootScope.Nombre_Empresa = '';

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

                    $rootScope.Id_Empresa = '';

                    localStorageService.set('authorizationData',
                        {
                            token: response.data.access_token,
                            userName: response.data.UserName,
                            userId: response.data.UserId,
                            userRole: response.data.Role,
                            integrationCode: response.data.IntegrationCode,
                            companyId: response.data.CompanyId,
                            companyName: response.data.CompanyName
                        });

                    $rootScope.userData = { userName: response.data.UserName, userId: response.data.UserId, userRole: response.data.Role, companyName: response.data.CompanyName }

                    $rootScope.Id_Empresa = response.data.CompanyId;
                    $rootScope.Nombre_Empresa = response.data.CompanyName;

                    _authentication.isAuth = true;
                    _authentication.userName = userName;
                    _authentication.userPassword = password;
                    _consultarMenu($rootScope.userData.userId);

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
            localStorageService.remove('masterdataMenu');
            localStorageService.remove('masterDataTipoClientes');
            localStorageService.remove('masterdataClientes');
            localStorageService.remove('masterdataMunicipios');
            localStorageService.remove('masterdataBarrios');
            localStorageService.remove('masterdataTipoServicio');
            localStorageService.remove('masterdataTipoTransacciones');

            $rootScope.Menu = [];
            $rootScope.TipoClientes = [];
            $rootScope.Clientes = [];
            $rootScope.Municipios = [];
            $rootScope.Barrios = [];

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
                $rootScope.Id_Empresa = authData.companyId;
                $rootScope.Nombre_Empresa = authData.companyName;

                var masterDataMenu = localStorageService.get('masterdataMenu');
                if (masterDataMenu)
                    $rootScope.Menu = masterDataMenu.menu;

                var masterDataTipoClientes = localStorageService.get('masterdataTipoClientes');
                if (masterDataTipoClientes)
                    $rootScope.TipoClientes = masterDataTipoClientes.tipoClientes;

                var masterDataClientes = localStorageService.get('masterdataClientes');
                if (masterDataClientes)
                    $rootScope.Clientes = masterDataClientes.clientes;

                var masterDataMunicipios = localStorageService.get('masterdataMunicipios');
                if (masterDataMunicipios)
                    $rootScope.Municipios = masterDataMunicipios.municipios;

                var masterDataBarrios = localStorageService.get('masterdataBarrios');
                if (masterDataBarrios)
                    $rootScope.Barrios = masterDataBarrios.barrios;

                var masterdataTipoServicio = localStorageService.get('masterdataTipoServicio');
                if (masterdataTipoServicio)
                    $rootScope.TipoServicios = masterdataTipoServicio.tipoServicios;

                var masterDataTipoPagos = localStorageService.get('masterdataTipoPagos');
                if (masterDataTipoPagos)
                    $rootScope.TipoPagos = masterDataTipoPagos.tipopagos;

                var masterdataTipoTransaccion = localStorageService.get('masterdataTipoTransacciones');
                if (masterdataTipoTransaccion)
                    $rootScope.TipoTransacciones = masterdataTipoTransaccion.tipoTransacciones;

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
                $rootScope.Menu = result.data;
                $rootScope.$broadcast('successfull.menuload');
                localStorageService.set('masterdataMenu',
                    {
                        menu: result.data
                    });
            })

        }

        authServiceFactory.login = _login;
        authServiceFactory.logOut = _logOut;
        authServiceFactory.fillAuthData = _fillAuthData;
        authServiceFactory.authentication = _authentication;
        authServiceFactory.consultarMenu = _consultarMenu

        return authServiceFactory;

    }

    function SPAService($http, $rootScope, $q, serviceRest, localStorageService) {

        return {

            _registrarActualizarCliente: RegistrarActualizarCliente,
            _consultarClientes: ConsultarClientes,
            _consultarBarrios: ConsultarBarrios,
            _consultarMunicipios: ConsultarMunicipios,
            _consultarTipoClientes: ConsultarTipoClientes,
            _consultarCliente: ConsultarCliente,
            _consultarTipoServicios: ConsultarTipoServicios,
            _consultarServicios: ConsultarServicios,
            _guardarServicio: GuardarServicio,
            _consultarEmpleados: ConsultarEmpleados,
            _consultarTipoPagos: ConsultarTipoPagos,
            _consultarTipoTransacciones: ConsultarTipoTransacciones,
            _consultarProductos: ConsultarProductos,
            _registrarActualizarEmpleado: RegistrarActualizarEmpleado,
            _guardarProducto: GuardarProducto,
            _asignarEmpleadoServicio: AsignarEmpleadoServicio,
            _consultarEmpleadoServicio : ConsultarEmpleadoServicio
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

        function ConsultarCliente(cedula_cliente, id_empresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarCliente?Cedula=' + cedula_cliente + '&IdEmpresa=' + id_empresa,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }


        function ConsultarBarrios(id_municipio) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarBarrios?IdMunicipio=' + id_municipio,
                function (data) {
                    localStorageService.set('masterdataBarrios',
                        {
                            barrios: data
                        });
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarMunicipios() {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarMunicipios',
                function (data) {
                    localStorageService.set('masterdataMunicipios',
                        {
                            municipios: data
                        });
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarTipoClientes() {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarTipoClientes',
                function (data) {
                    localStorageService.set('masterdataTipoClientes',
                        {
                            tipoClientes: data
                        });
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarTipoServicios() {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarTipoServicios',
                function (data) {
                    localStorageService.set('masterdataTipoServicio',
                        {
                            tipoServicios: data
                        });
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }


        function ConsultarServicios(id_empresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarServicios?IdEmpresa=' + id_empresa,
                function (data) {
                    deferred.resolve(data);

                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function GuardarServicio(servicio) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'GuardarServicio', servicio,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function ConsultarEmpleados(id_empresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarEmpleados?IdEmpresa=' + id_empresa,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarTipoTransacciones() {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarTipoTransacciones',
                function (data) {
                    localStorageService.set('masterdataTipoTransacciones',
                        {
                            tipoTransacciones: data
                        });
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarTipoPagos() {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarTipoPagos',
                function (data) {
                    localStorageService.set('masterdataTipopagos',
                        {
                            tipopagos: data
                        });
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function RegistrarActualizarEmpleado(empleado) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'RegistrarActualizarEmpleado', empleado,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function AsignarEmpleadoServicio(empleadoservicio) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'AsignarEmpleadoServicio', empleadoservicio,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function ConsultarEmpleadoServicio(id_empleado) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarEmpleadoServicio',
                function (data) {
                    localStorageService.set('masterdataEmpleadoservicio',
                        {
                            empleadoservicio: data
                        });
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarProductos(id_empresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarProductos?IdEmpresa=' + id_empresa,
                function (data) {
                    deferred.resolve(data);

                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function GuardarProducto(producto) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'GuardarProducto', producto,
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