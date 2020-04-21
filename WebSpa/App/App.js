(function () {
    angular.module('app', [
        "ngRoute",
        "ngAnimate",
        "ngMaterial",
        "LocalStorageModule",
        "ui.bootstrap",
        "ui.router",
        "app.controllers",
        "app.services",
        "app.directives"
    ])
        .config(Configuration)
        .run(Initialize)
        .filter('sumInventory', sumInventory)
        .filter('sumShrink', sumShrink)
    Configuration.$inject = ['$stateProvider', '$urlRouterProvider', '$routeProvider', '$httpProvider', '$locationProvider', '$mdDateLocaleProvider', '$mdThemingProvider'];
    Initialize.$inject = ['$rootScope', '$http', '$window', 'localStorageService', 'AuthService'];

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
            //.state('home.shrink', {
            //    url: '/shrink',
            //    templateUrl: 'views/_shrink.html',
            //    controller: "ShrinkController"
            //})
            //.state('home.products', {
            //    url: '/products',
            //    templateUrl: 'views/_products.html',
            //    controller: "ProductsController"
            //})
            //.state('home.settings', {
            //    url: '/settings',
            //    templateUrl: 'views/_settings.html',
            //    controller: "SettingsController"
            //})

        $mdDateLocaleProvider.formatDate = function (date) {
            if (date) {
                var day = date.getDate();
                var monthIndex = date.getMonth() + 1;
                var year = date.getFullYear();

                day = (day <= 9) ? '0' + day : day;
                monthIndex = (monthIndex <= 9) ? '0' + monthIndex : monthIndex;

                return year + '/' + monthIndex + '/' + day;
            }
        };

    }

    function Initialize($rootScope, $http, $window, localStorageService, authService) {
        $http.get('app-config.json').then(function (data, status, headers, config) {
            $rootScope.config = data;
        },
            function (data, status, headers, config) {
                console.log("Ocurring an error loading configuration: " + data);
            });

        authService.fillAuthData();
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
})();