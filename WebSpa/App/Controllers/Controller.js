(function () {

    agGrid.initialiseAgGridWithAngular1(angular);

    angular.module('app.controllers', [])
        .controller("LoginController", LoginController)
        .controller("HomeController", HomeController)
        .controller("ClientesController", ClientesController)

    LoginController.$inject = ['$scope', '$state', '$location', '$mdDialog', '$rootScope', '$timeout', 'AuthService'];
    HomeController.$inject = ['$scope', '$rootScope', '$element', 'localStorageService', 'AuthService'];
    ClientesController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', 'localStorageService', 'SPAService'];

    function LoginController($scope, $state, $location, $mdDialog, $rootScope, $timeout, authService) {

        $scope.ValidarDatos = ValidarDatos;
        $scope.login = login;
        $scope.ValidarIntegracion = false;

        function login() {
            if ($scope.ValidarDatos()) {
                authService.login($scope.DatosUsuario.Usuario, $scope.DatosUsuario.Password, $scope.ValidarIntegracion, $scope.DatosUsuario.CodigoIntegracion)
                    .then(
                        function (result) {
                            if (result.data !== undefined && result.data !== null) {
                                if (result.data.access_token !== undefined && result.data.access_token !== null) {
                                    if (result.data.IntegrationCode == null || result.data.IntegrationCode === "undefined") {
                                        $scope.validarIntegracion = true;
                                        $('#ctlIntegration').focus();
                                    } else {
                                        $state.go('home')
                                        toastr.success('Login OK', '', $scope.toastrOptions);
                                    }
                                }
                            }
                        }, function (err) {
                            toastr.remove();
                            if (err.data.error == "invalid_grant" && err.status === 400)
                                toastr.warning(err.data.error_description, '', $scope.toastrOptions);
                            else if (err.data !== null && err.status === 500)
                                toastr.error(err.data, '', $scope.toastrOptions);
                        })
            }
        }

        function ValidarDatos() {

            if ($scope.DatosUsuario === undefined
                && $scope.DatosUsuario.Usuario === ''
                || $scope.DatosUsuario.Password === '') {
                toastr.error('Debe digitar nombre y contraseña', '', $scope.toastrOptions);
                return false
            }
            return true;

        }

        $scope.DatosUsuario = { Usuario: '', Clave: '', CodigoIntegracion: '' }

    }

    function HomeController($scope, $rootScope, $element, localStorageService, authService) {

        $scope.Menu = [];
        $scope.logout = logout;

        $scope.$on('successfull.menuload', function () {
            $scope.Menu = localStorageService.get("menu");
        });

        $scope.toggleSidebar = function () {
            document.getElementById("sidebar").classList.toggle('active');
        }

        function logout() {
            authService.logOut();
        }
    }

    function ClientesController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, localStorageService, SPAService) {

        debugger;
        $scope.Clientes = [];
        $scope.Clientes = localStorageService.get("clientes");

        if ($scope.Clientes.length > 0)
            toastr.success('Clientes OK', '', $scope.toastrOptions);

    }

})();

