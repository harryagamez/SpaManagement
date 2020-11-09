﻿(function () {
    angular.module('app', [
        "ngRoute",
        "ngAnimate",
        "ngMaterial",
        "ADM-dateTimePicker",
        "agGrid",
        "LocalStorageModule",
        "ui.bootstrap",
        "ui.router",
        "app.controllers",
        "app.services",
        "app.directives",
        "ngLoadingSpinner"
    ])
        .config(Configuration)
        .run(Initialize)
        .filter('sumInventory', sumInventory)
        .filter('sumShrink', sumShrink)
        .filter('mathOperation', mathOperation)
        .filter('decimalParseAmount', decimalParseAmount)
    Configuration.$inject = ['$stateProvider', '$urlRouterProvider', '$routeProvider', '$httpProvider', '$locationProvider', '$mdDateLocaleProvider', '$mdThemingProvider', 'ADMdtpProvider'];
    Initialize.$inject = ['$rootScope', '$state', '$http', '$window', '$location', 'localStorageService', 'AuthService'];

    function Configuration($stateProvider, $urlRouterProvider, $routeProvider, $httpProvider, $locationProvider, $mdDateLocaleProvider, $mdThemingProvider) {
        $httpProvider.interceptors.push('AuthtenticantionIntecerptorService');

        $locationProvider.hashPrefix('');

        $urlRouterProvider.otherwise("/");

        $mdThemingProvider.theme('red').primaryPalette('red');

        $mdThemingProvider.theme('blue').primaryPalette('blue');

        $stateProvider
            .state('login', {
                url: '/',
                templateUrl: "Views/_login.html",
                controller: "LoginController"
            })
            .state('home', {
                url: '/home',
                templateUrl: 'Views/_home.html',
                controller: "HomeController"
            })
            .state('home.clientes', {
                url: '/clientes',
                templateUrl: 'Views/_clientes.html',
                controller: "ClientesController"
            })
            .state('home.servicios', {
                url: '/servicios',
                templateUrl: 'Views/_servicios.html',
                controller: 'ServiciosController'
            })
            .state('home.empleados', {
                url: '/empleados',
                templateUrl: 'Views/_empleados.html',
                controller: 'EmpleadosController'
            })
            .state('home.productos', {
                url: '/productos',
                templateUrl: 'Views/_productos.html',
                controller: 'ProductosController'
            })
            .state('home.gastos', {
                url: '/gastos',
                templateUrl: 'Views/_gastos.html',
                controller: 'GastosController'
            })
            .state('home.gestion', {
                url: '/gestion',
                templateUrl: 'Views/_gestion.html',
                controller: 'GestionController'
            })
            .state('home.dashboard', {
                url: '/dashboard',
                templateUrl: 'Views/_dashboard.html',
                controller: 'DashboardController'
            })
            .state('home.transacciones', {
                url: '/transacciones',
                templateUrl: 'Views/_transacciones.html',
                controller: 'TransaccionesController'
            })
            .state('home.reportes_spc', {
                url: '/serviciosclientes',
                templateUrl: 'Views/_serviciosClientes.html',
                controller: 'ServiciosClientesController'
            })
            .state('home.reportes_ppc', {
                url: '/pagosclientes',
                templateUrl: 'Views/_pagosClientes.html',
                controller: 'PagosClientesController'
            })
            .state('home.reportes_spe', {
                url: '/serviciosempleados',
                templateUrl: 'Views/_serviciosEmpleados.html',
                controller: 'ServiciosEmpleadosController'
            })
            .state('home.reportes', {
            })
            .state('home.visitas', {
                url: '/visitas',
                templateUrl: 'Views/_visitas.html'
            })
            .state('home.encuestas', {
                url: '/encuestas',
                templateUrl: 'Views/_encuestas.html'
            })
            .state('administrator', {
                url: '/administrator',
                templateUrl: 'Views/_administrator.html',
                controller: 'AdministratorController'
            })
            .state('apanel', {
                url: '/apanel',
                templateUrl: 'Views/_apanel.html',
                controller: 'AdministratorPanelController'
            })
    }

    function Initialize($rootScope, $state, $http, $window, $location, localStorageService, authService) {
        $http.get('app-config-dev.json').then(function (data, status, headers, config) {
            $rootScope.config = data;
        },
            function (data, status, headers, config) {
                console.log("Ocurring an error loading configuration: " + data);
            });

        authService.fillAuthData();

        $rootScope.$on('$stateChangeStart', function (e, route) {
            if (route.controller !== "LoginController" && route.controller !== "AdministratorController") {
                let _authentication = authService.authentication;
                if (route.controller === "AdministratorPanelController" && _authentication
                    && _authentication.isAuth && _authentication.userRole !== "[MANAGER]") {
                    e.preventDefault();
                    $location.replace();
                    $state.go('home');
                }

                if (_authentication && !_authentication.isAuth) {
                    e.preventDefault();
                    $location.replace();
                    $state.go('login');
                }
            }
        });

        $rootScope.$on('$viewContentLoaded', function () {
            $location.replace();
        });
    }

    function sumInventory() {
        return function (data, key) {
            if (typeof (data) === 'undefined' || typeof (key) === 'undefined') {
                return 0;
            }

            var sum = 0;

            for (var i = data.length - 1; i >= 0; i--) {
                sum += parseInt(data[i]["Front"] + data[i]["Back"] + data[i]["Delivery"]);
            }

            if (sum == 0) {
                sum = pad(sum, 2);
            }
            return sum;
        };
    }

    function sumShrink() {
        return function (data, key) {
            if (typeof (data) === 'undefined' || typeof (key) === 'undefined') {
                return 0;
            }

            var sum = 0;

            for (var i = data.length - 1; i >= 0; i--) {
                if (data[i][key] != undefined) {
                    sum += parseInt(data[i][key]);
                }
            }

            return sum;
        };
    }

    function mathOperation() {
        return function (values, args) {
            if (!values || values.length <= 0) return 0;
            if (values.length == 1) return parseFloat(values[0][args.property]);

            return values.reduce(function (a, b) {
                var valueA, valueB;

                valueA = a[args.property] != null &&
                    a[args.property] != undefined &&
                    a[args.property].toString().trim() != "" &&
                    a[args.property] != null
                    ? parseFloat(a[args.property])
                    : parseFloat(a);

                valueB = b[args.property] != null &&
                    b[args.property] != undefined &&
                    b[args.property].toString().trim() != "" &&
                    b[args.property] != null
                    ? parseFloat(b[args.property])
                    : parseFloat(b);


                valueA = (isNaN(valueA)) ? 0 : valueA
                valueB = (isNaN(valueB)) ? 0 : valueB

                return eval("valueA " + args.operation + " valueB");
            });
        }
    }

    function decimalParseAmount() {
        return function (text, len) {

            if (len == undefined || len == null) {
                len = 3
            }

            if (text != null) {
                return parseFloat(text).toFixed(len)
            }
        }
    }

})();