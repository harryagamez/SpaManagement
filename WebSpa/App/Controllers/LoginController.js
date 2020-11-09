angular.module('app.controllers')
    .controller("LoginController", LoginController);

LoginController.$inject = ['$scope', '$state', '$location', '$mdDialog', '$rootScope', '$timeout', 'AuthService'];

function LoginController($scope, $state, $location, $mdDialog, $rootScope, $timeout, authService) {
    $rootScope.header = 'Login';
    $scope.ValidarDatos = ValidarDatos;
    $scope.Login = Login;
    $scope.ValidarIntegracion = false;
    $scope.DatosUsuario = { Usuario: '', Clave: '', CodigoIntegracion: '' };

    $timeout(function () {
        $('#txtUsuario').focus();
    }, 200);

    $scope.$on('$viewContentLoaded', function () {
        $location.replace();
    });

    function Login() {
        if ($scope.ValidarDatos()) {
            authService.login($scope.DatosUsuario.Usuario, $scope.DatosUsuario.Clave, $scope.ValidarIntegracion, $scope.DatosUsuario.CodigoIntegracion)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            if (result.data.access_token !== undefined && result.data.access_token !== null) {
                                if (result.data.IntegrationCode == null
                                    || result.data.IntegrationCode === "undefined"
                                    || result.data.Validated === "False") {
                                    $scope.validarIntegracion = true;
                                    $('#ctlIntegration').focus();
                                } else {
                                    $scope.DatosUsuario = { Usuario: '', Clave: '', CodigoIntegracion: '' };
                                    $state.go('home');
                                }
                            }
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data.error == "invalid_grant" && err.status === 400)
                            toastr.error(err.data.error_description, '', $scope.toastrOptions);
                        else if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    function ValidarDatos() {
        if ($scope.DatosUsuario === undefined
            || $scope.DatosUsuario.Usuario === ''
            || $scope.DatosUsuario.Clave === '') {
            toastr.info('Debe digitar nombre de usuario y contraseña', '', $scope.toastrOptions);
            return false
        }
        return true;
    }
}