(function () {
    angular.module('app.services', [])
        .service("serviceRest", serviceRest)
        .factory('AuthtenticantionIntecerptorService', AuthtenticantionIntecerptorService)
        .factory("AuthService", AuthService)
        .factory("SPAService", SPAService)

    serviceRest.$inject = ['$http', '$rootScope'];
    AuthtenticantionIntecerptorService.$inject = ['$q', 'localStorageService'];
    AuthService.$inject = ['$http', '$q', '$rootScope', '$state', 'localStorageService', '$timeout'];
    SPAService.$inject = ['$q', 'serviceRest', 'localStorageService'];

    function AuthtenticantionIntecerptorService($q, localStorageService) {
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

    function AuthService($http, $q, $rootScope, $state, localStorageService, $timeout) {
        var authServiceFactory = {};

        var _authentication = {
            isAuth: false,
            userName: "",
            userPassword: "",
            userRole: ""
        };

        var _login = function (userName, password, validatedIntegration, integrationCode) {
            localStorageService.remove('authorizationData');
            localStorageService.remove('masterdataMenu');
            localStorageService.remove('masterdataUserAvatar');
            localStorageService.remove('masterdataEmpresaPropiedades');
            localStorageService.remove('masterdataSistemaPropiedades');
            localStorageService.remove('masterDataTipoClientes');
            localStorageService.remove('masterdataClientes');
            localStorageService.remove('masterdataMunicipios');
            localStorageService.remove('masterdataBarrios');
            localStorageService.remove('masterdataTipoServicio');
            localStorageService.remove('masterdataTipoTransacciones');
            localStorageService.remove('masterdataEmpresas');
            localStorageService.remove('masterdataCategoriaServicios');

            $rootScope.Menu = [];
            $rootScope.TipoClientes = [];
            $rootScope.Clientes = [];
            $rootScope.Municipios = [];
            $rootScope.Barrios = [];
            $rootScope.Empresas = [];
            $rootScope.EmpresaPropiedades = [];
            $rootScope.SistemaPropiedades = [];

            $rootScope.Id_Empresa = '';
            $rootScope.Nombre_Empresa = '';
            $rootScope.Categoria_Empresa = '';

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
                    $rootScope.Categoria_Empresa = '';
                    localStorageService.set('authorizationData',
                        {
                            token: response.data.access_token,
                            userName: response.data.UserName,
                            userId: response.data.UserId,
                            userRole: response.data.Role,
                            integrationCode: response.data.IntegrationCode,
                            companyId: response.data.CompanyId,
                            companyName: response.data.CompanyName,
                            companyCategory: response.data.CompanyCategory
                        });

                    $rootScope.userData = { userName: response.data.UserName, userId: response.data.UserId, userRole: response.data.Role, companyName: response.data.CompanyName, companyCategory: response.data.companyCategory }

                    $rootScope.Id_Empresa = response.data.CompanyId;
                    $rootScope.Perfil = response.data.userRole;
                    $rootScope.Nombre_Empresa = response.data.CompanyName;
                    $rootScope.Categoria_Empresa = response.data.CompanyCategory;

                    _authentication.isAuth = true;
                    _authentication.userName = userName;
                    _authentication.userPassword = password;
                    _authentication.userRole = $rootScope.userData.userRole;
                    _consultarMenu($rootScope.userData.userId);

                    if (($rootScope.userData.companyName === '[MULTIPLE]')
                        && ($rootScope.Id_Empresa === '00000000-0000-0000-0000-000000000000'))

                        _consultarEmpresas();

                    else {
                        _consultarUserAvatar($rootScope.userData.userId);
                        _consultarUsuarioEmpresas($rootScope.userData.userId);
                    }

                    _consultarSistemaPropiedades();

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
            localStorageService.remove('masterdataUserAvatar');
            localStorageService.remove('masterdataEmpresaPropiedades');
            localStorageService.remove('masterdataSistemaPropiedades');
            localStorageService.remove('masterDataTipoClientes');
            localStorageService.remove('masterdataClientes');
            localStorageService.remove('masterdataMunicipios');
            localStorageService.remove('masterdataBarrios');
            localStorageService.remove('masterdataTipoServicio');
            localStorageService.remove('masterdataTipoTransacciones');
            localStorageService.remove('masterdataEmpresas');
            localStorageService.remove('masterdataCategoriaServicios');

            $rootScope.Menu = [];
            $rootScope.TipoClientes = [];
            $rootScope.Clientes = [];
            $rootScope.Municipios = [];
            $rootScope.Barrios = [];
            $rootScope.Empresas = [];
            $rootScope.EmpresaPropiedades = [];
            $rootScope.SistemaPropiedades = [];
            $rootScope.UserAvatar = '../../Images/default_perfil_alt.png';
            $rootScope.Errores = '';

            _authentication.isAuth = false;
            _authentication.userName = "";
            _authentication.useRefreshTokens = false;
            _authentication.userRole = "";
            $rootScope.userData = { userName: '', userId: '', userRole: '' }

            $timeout(function () { $state.go('login') }, 0);
        };

        var _fillAuthData = function () {
            var authData = localStorageService.get('authorizationData');
            if (authData) {
                _authentication.isAuth = true;
                _authentication.userName = authData.userName;
                _authentication.userRole = authData.userRole;

                $rootScope.userData = { userName: authData.userName, userId: authData.userId, userRole: authData.userRole, companyName: authData.companyName, companyCategory: authData.companyCategory }

                if (authData.companyId !== '00000000-0000-0000-0000-000000000000' && authData.companyName !== '[MULTIPLE]') {
                    $rootScope.Id_Empresa = authData.companyId;
                    $rootScope.Nombre_Empresa = authData.companyName;
                    $rootScope.Categoria_Empresa = authData.companyCategory;
                }

                var masterDataMenu = localStorageService.get('masterdataMenu');
                if (masterDataMenu)
                    $rootScope.Menu = masterDataMenu.menu;

                var masterDataUserAvatar = localStorageService.get('masterdataUserAvatar');
                if (masterDataUserAvatar)
                    $rootScope.UserAvatar = masterDataUserAvatar.useravatar;

                var masterDataEmpresaPropiedades = localStorageService.get('masterdataEmpresaPropiedades');
                if (masterDataEmpresaPropiedades)
                    $rootScope.EmpresaPropiedades = masterDataEmpresaPropiedades.empresapropiedades;

                var masterDataSistemaPropiedades = localStorageService.get('masterdataSistemaPropiedades');
                if (masterDataSistemaPropiedades)
                    $rootScope.SistemaPropiedades = masterDataSistemaPropiedades.sistemapropiedades;

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

                var masterdataEmpresas = localStorageService.get('masterdataEmpresas');
                if (masterdataEmpresas)
                    $rootScope.Empresas = masterdataEmpresas.empresas;

                var masterdataCategoriaServicios = localStorageService.get('masterdataCategoriaServicios');
                if (masterdataCategoriaServicios)
                    $rootScope.CategoriaServicios = masterdataCategoriaServicios.categoriaServicios;
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
                url: $rootScope.config.data.API_URL + 'SPA/ConsultarMenu?IdUsuario=' + parseInt(authorizationData.userId) + '&IdEmpresa=' + authorizationData.companyId + '&Perfil=' + authorizationData.userRole
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

        var _consultarUserAvatar = function () {
            var authorizationData = localStorageService.get('authorizationData');

            $http({
                headers: { 'Content-Type': 'application/json' },
                method: 'GET',
                url: $rootScope.config.data.API_URL + 'SPA/ConsultarUserAvatar?UserId=' + parseInt(authorizationData.userId) + '&IdEmpresa=' + authorizationData.companyId
            }).then(function (result) {
                if (result.data !== null) {
                    $rootScope.UserAvatar = result.data.logo_Base64;
                    localStorageService.set('masterdataUserAvatar',
                        {
                            useravatar: result.data.logo_Base64
                        });
                } else { $rootScope.UserAvatar = '../../Images/default_perfil_alt.png' };

                $rootScope.$broadcast('successfull.useravatarload');
            })
        }

        var _consultarSistemaPropiedades = function () {
            $http({
                headers: { 'Content-Type': 'application/json' },
                method: 'GET',
                url: $rootScope.config.data.API_URL + 'SPA/ConsultarSistemaPropiedades'
            }).then(function (result) {
                $rootScope.SistemaPropiedades = result.data;
                $rootScope.$broadcast('successfull.sistemapropiedadesload');
                localStorageService.set('masterdataSistemaPropiedades',
                    {
                        sistemapropiedades: result.data
                    });
            }, function (error) {
                $rootScope.Errores = error.data;
                $rootScope.$broadcast('failed.sistemapropiedadesload');
            })
        }

        var _consultarEmpresaPropiedades = function (idEmpresa) {
            $http({
                headers: { 'Content-Type': 'application/json' },
                method: 'GET',
                url: $rootScope.config.data.API_URL + 'SPA/ConsultarEmpresaPropiedades?IdEmpresa=' + idEmpresa
            }).then(function (result) {
                $rootScope.EmpresaPropiedades = result.data;
                $rootScope.$broadcast('successfull.empresapropiedadesload');
                localStorageService.set('masterdataEmpresaPropiedades',
                    {
                        empresapropiedades: result.data
                    });
            }, function (error) {
                $rootScope.Errores = error.data;
                $rootScope.$broadcast('failed.empresapropiedadesload');
            })
        }

        var _consultarEmpresas = function () {
            $http({
                headers: { 'Content-Type': 'application/json' },
                method: 'GET',
                url: $rootScope.config.data.API_URL + 'SPA/ConsultarEmpresas'
            }).then(function (result) {
                localStorageService.set('empresas', result.data);
                $rootScope.Empresas = result.data;
                $rootScope.$broadcast('successfull.companiesLoaded');
                let ids = '00000000-0000-0000-0000-000000000000';
                _consultarEmpresaPropiedades(ids);
                localStorageService.set('masterdataEmpresas',
                    {
                        empresas: result.data
                    });
            })
        }

        var _consultarUsuarioEmpresas = function () {
            var authData = localStorageService.get('authorizationData');

            $http({
                headers: { 'Content-Type': 'application/json' },
                method: 'GET',
                url: $rootScope.config.data.API_URL + 'SPA/ConsultarUsuarioEmpresas?IdUsuario=' + parseInt(authData.userId)
            }).then(function (result) {
                localStorageService.set('empresas', result.data);
                $rootScope.Empresas = result.data;
                $rootScope.$broadcast('successfull.companiesLoaded');
                let ids = Enumerable.From($rootScope.Empresas)
                    .Select(function (x) { return x.id_Empresa })
                    .ToArray().join(',');
                _consultarEmpresaPropiedades(ids);
                localStorageService.set('masterdataEmpresas',
                    {
                        empresas: result.data
                    });
            })
        }

        authServiceFactory.login = _login;
        authServiceFactory.logOut = _logOut;
        authServiceFactory.fillAuthData = _fillAuthData;
        authServiceFactory.authentication = _authentication;
        authServiceFactory.consultarMenu = _consultarMenu;
        authServiceFactory.consultarUserAvatar = _consultarUserAvatar;
        authServiceFactory.consultarEmpresaPropiedades = _consultarEmpresaPropiedades;

        return authServiceFactory;
    }

    function SPAService($q, serviceRest, localStorageService) {
        return {
            _registrarActualizarCliente: RegistrarActualizarCliente,
            _registrarClientes: RegistrarClientes,
            _consultarClientes: ConsultarClientes,
            _consultarBarrios: ConsultarBarrios,
            _consultarMunicipios: ConsultarMunicipios,
            _consultarTipoClientes: ConsultarTipoClientes,
            _consultarCliente: ConsultarCliente,
            _consultarTipoServicios: ConsultarTipoServicios,
            _consultarServicios: ConsultarServicios,
            _consultarServiciosMaestro: ConsultarServiciosMaestro,
            _consultarServiciosActivos: ConsultarServiciosActivos,
            _guardarServicio: GuardarServicio,
            _eliminarImagenAdjunta: EliminarImagenAdjunta,
            _consultarEmpleados: ConsultarEmpleados,
            _consultarTipoPagos: ConsultarTipoPagos,
            _consultarTipoTransacciones: ConsultarTipoTransacciones,
            _consultarProductos: ConsultarProductos,
            _registrarActualizarEmpleado: RegistrarActualizarEmpleado,
            _guardarProducto: GuardarProducto,
            _asignarEmpleadoServicio: AsignarEmpleadoServicio,
            _consultarEmpleadoServicio: ConsultarEmpleadoServicio,
            _consultarProductoTransacciones: ConsultarProductoTransacciones,
            _consultarEmpleado: ConsultarEmpleado,
            _desasignarEmpleadoServicio: DesasignarEmpleadoServicio,
            _asignarEmpleadoInsumo: AsignarEmpleadoInsumo,
            _consultarEmpleadoInsumos: ConsultarEmpleadoInsumos,
            _eliminarEmpleadoInsumo: EliminarEmpleadoInsumo,
            _consultarGastos: ConsultarGastos,
            _consultarCajaMenor: ConsultarCajaMenor,
            _guardarCajaMenor: GuardarCajaMenor,
            _reemplazarCajaMenor: ReemplazarCajaMenor,
            _guardarGasto: GuardarGasto,
            _eliminarGastos: EliminarGastos,
            _consultarUsuarios: ConsultarUsuarios,
            _consultarUsuario: ConsultarUsuario,
            _guardarUsuario: GuardarUsuario,
            _consultarEmpresaPropiedades: ConsultarEmpresaPropiedades,
            _consultarEmpleadosAutoComplete: ConsultarEmpleadosAutoComplete,
            _guardarActualizarAgenda: GuardarActualizarAgenda,
            _consultarAgenda: ConsultarAgenda,
            _consultarAgendaTransacciones : ConsultarAgendaTransacciones,
            _cancelarAgenda: CancelarAgenda,
            _confirmarAgenda: ConfirmarAgenda,
            _consultarNumeroCitasDia: ConsultarNumeroCitasDia,
            _guardarEmpresaPropiedades: GuardarEmpresaPropiedades,
            _consultarCategoriaServicios: ConsultarCategoriaServicios,
            _consultarSedesPrincipales: ConsultarSedesPrincipales,
            _guardarEmpresa: GuardarEmpresa,
            _consultarEmpresasAdmin: ConsultarEmpresasAdmin,
            _consultarMenuAdmin: ConsultarMenuAdmin,
            _consultarUsuariosAdmin: ConsultarUsuariosAdmin,
            _consultarServiciosAdmin: ConsultarServiciosAdmin,
            _guardarServicioAdmin: GuardarServicioAdmin,
            _consultarBarriosAdmin: ConsultarBarriosAdmin,
            _guardarCategoriaServicio: GuardarCategoriaServicio,
            _guardarTipoServicio: GuardarTipoServicio,
            _guardarMunicipio: GuardarMunicipio,
            _guardarBarrio: GuardarBarrio,
            _consultarDepartamentos: ConsultarDepartamentos,
            _registrarFacturacionServicios: RegistrarFacturacionServicios,
            _consultarNominaEmpleados: ConsultarNominaEmpleados,
            _consultarNominaEmpleadoServicios: ConsultarNominaEmpleadoServicios,
            _consultarEmpleadoPrestamos: ConsultarEmpleadoPrestamos,
            _liquidarNominaEmpleados: LiquidarNominaEmpleados,
            _consultarServiciosCliente: ConsultarServiciosCliente,
            _consultarPagosCliente: ConsultarPagosCliente,
            _consultarServiciosEmpleado: ConsultarServiciosEmpleado,
            _consultarMovimientosCajaMenor: ConsultarMovimientosCajaMenor,
            _guardarPromocion: GuardarPromocion,
            _consultarTipoPromociones: ConsultarTipoPromociones,
            _consultarPromociones: ConsultarPromociones,
            _eliminarServicioPromocion: EliminarServicioPromocion,
            _consultarPromocion: ConsultarPromocion
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

        function RegistrarClientes(clientes) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'RegistrarClientes', clientes,
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

        function ConsultarServiciosMaestro(CategoriaEmpresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarServiciosMaestro?CategoriaEmpresa=' + CategoriaEmpresa,
                function (data) {
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

        function ConsultarServiciosActivos(id_empresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarServiciosActivos?IdEmpresa=' + id_empresa,
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

        function EliminarImagenAdjunta(IdImagenAdjunta) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'EliminarImagenAdjunta?IdImagenAdjunta=' + IdImagenAdjunta,
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

        function ConsultarEmpleado(cedula_empleado, id_empresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarEmpleado?Cedula=' + cedula_empleado + '&IdEmpresa=' + id_empresa,
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

        function AsignarEmpleadoServicio(empleadoServicio) {
            var deferred = $q.defer();
            serviceRest.Post('SPA', 'AsignarEmpleadoServicio', empleadoServicio,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function DesasignarEmpleadoServicio(IdEmpleadoServicio) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'DesasignarEmpleadoServicio?IdEmpleadoServicio=' + IdEmpleadoServicio,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function AsignarEmpleadoInsumo(empleadoinsumo) {
            var deferred = $q.defer();
            serviceRest.Post('SPA', 'AsignarEmpleadoInsumo', empleadoinsumo,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function EliminarEmpleadoInsumo(transaccionInsumo) {
            var deferred = $q.defer();
            serviceRest.Post('SPA', 'EliminarEmpleadoInsumo', transaccionInsumo,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarEmpleadoServicio(IdEmpleado, IdEmpresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarEmpleadoServicio?IdEmpleado=' + IdEmpleado + '&IdEmpresa=' + IdEmpresa,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarEmpleadoInsumos(IdEmpleado, IdEmpresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarEmpleadoInsumos?IdEmpleado=' + IdEmpleado + '&IdEmpresa=' + IdEmpresa,
                function (data) {
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

        function ConsultarProductoTransacciones(id_producto, id_empresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarProductoTransacciones?IdProducto=' + id_producto + '&IdEmpresa=' + id_empresa,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarGastos(busqueda_gasto) {
            var deferred = $q.defer();
            serviceRest.Post('SPA', 'ConsultarGastos', busqueda_gasto,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarCajaMenor(IdEmpresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarCajaMenor?IdEmpresa=' + IdEmpresa,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function GuardarCajaMenor(cajamenor) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'GuardarCajaMenor', cajamenor,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function ReemplazarCajaMenor(cajamenor) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'ReemplazarCajaMenor', cajamenor,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function GuardarGasto(gasto) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'GuardarGasto', gasto,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function EliminarGastos(gastos) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'EliminarGastos', gastos,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function ConsultarUsuarios(id_empresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarUsuarios?IdEmpresa=' + id_empresa,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarUsuario(Nombre) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarUsuario?Nombre=' + Nombre,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function GuardarUsuario(usuario) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'GuardarUsuario', usuario,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function ConsultarEmpresaPropiedades(id_empresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarEmpresaPropiedades?IdEmpresa=' + id_empresa,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarEmpleadosAutoComplete(id_empresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarEmpleadosAutoComplete?IdEmpresa=' + id_empresa,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function GuardarActualizarAgenda(agenda) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'GuardarActualizarAgenda', agenda,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function ConsultarAgenda(agenda) {
            var deferred = $q.defer();
            serviceRest.Post('SPA', 'ConsultarAgenda', agenda,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarAgendaTransacciones(agenda) {
            var deferred = $q.defer();
            serviceRest.Post('SPA', 'ConsultarAgendaTransacciones', agenda,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function CancelarAgenda(IdAgenda, IdEmpresa, UsuarioSistema) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'CancelarAgenda?IdAgenda=' + IdAgenda + '&IdEmpresa=' + IdEmpresa + '&UsuarioSistema=' + UsuarioSistema,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConfirmarAgenda(IdAgenda, IdEmpresa, UsuarioSistema) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConfirmarAgenda?IdAgenda=' + IdAgenda + '&IdEmpresa=' + IdEmpresa + '&UsuarioSistema=' + UsuarioSistema,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function GuardarEmpresaPropiedades(propiedades) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'GuardarEmpresaPropiedades', propiedades,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function ConsultarNumeroCitasDia(fechaConsulta, idEmpresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarNumeroCitasDia?fechaConsulta=' + fechaConsulta + '&idEmpresa=' + idEmpresa,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarCategoriaServicios() {
            var deferred = $q.defer();
            serviceRest.Get('Admin', 'ConsultarCategoriaServicios',
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarMenuAdmin() {
            var deferred = $q.defer();
            serviceRest.Get('Admin', 'ConsultarMenuAdmin',
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarSedesPrincipales() {
            var deferred = $q.defer();
            serviceRest.Get('Admin', 'ConsultarSedesPrincipales',
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarEmpresasAdmin() {
            var deferred = $q.defer();
            serviceRest.Get('Admin', 'ConsultarEmpresasAdmin',
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarUsuariosAdmin() {
            var deferred = $q.defer();
            serviceRest.Get('Admin', 'ConsultarUsuariosAdmin',
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function GuardarEmpresa(empresa) {
            var deferred = $q.defer();
            serviceRest.Post('Admin', 'GuardarEmpresa', empresa,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function ConsultarServiciosAdmin() {
            var deferred = $q.defer();
            serviceRest.Get('Admin', 'ConsultarServiciosAdmin',
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function GuardarServicioAdmin(servicio) {
            var deferred = $q.defer();
            serviceRest.Post('Admin', 'GuardarServicioAdmin', servicio,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function ConsultarBarriosAdmin() {
            var deferred = $q.defer();
            serviceRest.Get('Admin', 'ConsultarBarriosAdmin',
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarDepartamentos() {
            var deferred = $q.defer();
            serviceRest.Get('Admin', 'ConsultarDepartamentos',
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function GuardarCategoriaServicio(categoria) {
            var deferred = $q.defer();
            serviceRest.Post('Admin', 'GuardarCategoriaServicio', categoria,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function GuardarMunicipio(municipio) {
            var deferred = $q.defer();
            serviceRest.Post('Admin', 'GuardarMunicipio', municipio,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function GuardarBarrio(barrio) {
            var deferred = $q.defer();
            serviceRest.Post('Admin', 'GuardarBarrio', barrio,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function GuardarTipoServicio(tiposervicio) {
            var deferred = $q.defer();
            serviceRest.Post('Admin', 'GuardarTipoServicio', tiposervicio,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function RegistrarFacturacionServicios(aplicacionpagos) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'RegistrarFacturacionServicios', aplicacionpagos,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function ConsultarNominaEmpleados(idEmpresa, fechaNomina) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarNominaEmpleados?idEmpresa=' + idEmpresa + '&fechaNomina=' + fechaNomina,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarNominaEmpleadoServicios(idEmpresa, idEmpleado, fechaNomina) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarNominaEmpleadoServicios?idEmpresa=' + idEmpresa + '&idEmpleado=' + idEmpleado + '&fechaNomina=' + fechaNomina,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarEmpleadoPrestamos(idEmpresa, idEmpleado) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarEmpleadoPrestamos?idEmpresa=' + idEmpresa + '&idEmpleado=' + idEmpleado,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function LiquidarNominaEmpleados(aplicacionnomina) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'LiquidarNominaEmpleados', aplicacionnomina,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function ConsultarServiciosCliente(agenda) {
            var deferred = $q.defer();
            serviceRest.Post('SPA', 'ConsultarServiciosCliente', agenda,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarPagosCliente(busquedaPago) {
            var deferred = $q.defer();
            serviceRest.Post('SPA', 'ConsultarPagosCliente', busquedaPago,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarServiciosEmpleado(agenda) {
            var deferred = $q.defer();
            serviceRest.Post('SPA', 'ConsultarServiciosEmpleado', agenda,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarMovimientosCajaMenor(idEmpresa, fechaDesde, fechaHasta) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarMovimientosCajaMenor?idEmpresa=' + idEmpresa + '&fechaDesde=' + fechaDesde + '&fechaHasta=' + fechaHasta,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function GuardarPromocion(promocion) {
            var deferred = $q.defer();

            serviceRest.Post('SPA', 'GuardarPromocion', promocion,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function ConsultarTipoPromociones() {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarTipoPromociones',
                function (data) {                    
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarPromociones(id_empresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarPromociones?IdEmpresa=' + id_empresa,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function EliminarServicioPromocion(IdDetallePromocion, IdPromocion) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'EliminarServicioPromocion?IdDetallePromocion=' + IdDetallePromocion + '&IdPromocion=' + IdPromocion,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        function ConsultarPromocion(id_promocion, id_empresa) {
            var deferred = $q.defer();
            serviceRest.Get('SPA', 'ConsultarPromocion?IdPromocion=' + id_promocion + '&IdEmpresa=' + id_empresa, 
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

    }

    function serviceRest($http, $rootScope) {
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