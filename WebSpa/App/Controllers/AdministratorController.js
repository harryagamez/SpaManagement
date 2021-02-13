angular.module('app.controllers')
    .controller("AdministratorController", AdministratorController);

AdministratorController.$inject = ['$scope', '$state', '$location', '$rootScope', '$timeout', 'AuthService', '$mdDialog'];

function AdministratorController($scope, $state, $location, $rootScope, $timeout, authService, $mdDialog) {
    $rootScope.header = 'Administrator';
    $scope.ValidarDatos = ValidarDatos;
    $scope.Login = Login;
    $scope.ValidarIntegracion = false;
    $scope.DatosUsuario = { Usuario: '', Clave: '', CodigoIntegracion: '' };

    $timeout(function () {
        $('#txtUsuario').focus();
    }, 200);

    $scope.ModalLogin = function () {
        try {
            $mdDialog.show({
                contentElement: '#dlgLogin',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                multiple: false,
            })
                .then(function () {
                }, function () {
                });

        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.Cancelar = function () {
        $mdDialog.cancel();
    };

    $scope.$on('$viewContentLoaded', function () {
        $location.replace();
    });

    function Login() {
        if ($scope.ValidarDatos()) {
            $scope.ModalLogin();
            $rootScope.IniciandoSesionMensajes = 'Validando datos de usuario...';
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
                                } else if (result.data.Role === '[MANAGER]') {
                                    $scope.DatosUsuario = { Usuario: '', Clave: '', CodigoIntegracion: '' };
                                    $timeout(function () { $rootScope.IniciandoSesionMensajes = 'Cargando datos de usuario...'; }, 100);
                                    $timeout(function () { $rootScope.IniciandoSesionMensajes = 'Cargando menús...'; }, 1800);
                                    $timeout(function () { $rootScope.IniciandoSesionMensajes = 'Iniciando sesión...'; }, 2200);
                                    $timeout(function () {
                                        $state.go('apanel');                                        
                                    }, 3000);
                                    $timeout(function () {
                                        $scope.Cancelar();
                                    },3500);                                   
                                }
                                else {
                                    $scope.DatosUsuario = { Usuario: '', Clave: '', CodigoIntegracion: '' };
                                    $scope.Cancelar();
                                    toastr.info('Credenciales de Super Usuario no válidas', '', $scope.toastrOptions);
                                    authService.logOut();
                                }
                            }
                        }
                    }, function (err) {
                        $scope.Cancelar();
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