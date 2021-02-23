angular.module('app.controllers')
    .controller("LoginController", LoginController);

LoginController.$inject = ['$scope', '$state', '$location', '$rootScope', '$timeout', 'AuthService', '$mdDialog', 'SPAService', '$http'];

function LoginController($scope, $state, $location, $rootScope, $timeout, authService, $mdDialog, SPAService, $http) {
    $rootScope.header = 'Login';
    $rootScope.IniciandoSesionMensajes = '';
    $scope.ValidarDatos = ValidarDatos;
    $scope.Login = Login;
    $scope.ValidarIntegracion = false;
    $scope.DatosUsuario = { Usuario: '', Clave: '', CodigoIntegracion: '' };

    $scope.RegistrarSesion = function () {        
        $scope.SesionUsuario = {
            Id_Registro: -1,
            Usuario_Registro: $rootScope.userData.userName,
            Ip_Address: $scope.Ip,
            Hostname: $scope.Hostname,
            Ciudad: $scope.Ciudad,
            Region: $scope.Region,
            Pais: $scope.Pais,
            Localizacion: $scope.Localizacion,
            Org: $scope.Org,
            Codigo_Postal: $scope.Postal,
            Zona_Horaria: $scope.TimeZone,
            Id_Empresa: $rootScope.Id_Empresa
        };       

        SPAService._registrarSesion(JSON.stringify($scope.SesionUsuario))
            .then(
                function (result) {
                    console.log('Sesión Registrada: ' + result.data);
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        console.log(err.data);
                })        
    }

    $scope.GetUserData = function () {
        $http.get("https://ipinfo.io/json?token=312ef10a0e7258")
            .then(function (response) {
                $scope.Ip = response.data.ip;
                $scope.Hostname = response.data.hostname;
                $scope.Ciudad = response.data.city;
                $scope.Region = response.data.region;
                $scope.Pais = response.data.country;
                $scope.Localizacion = response.data.loc;
                $scope.Org = response.data.org;
                $scope.Postal = response.data.postal;
                $scope.TimeZone = response.data.timezone;
        });        
    }

    $scope.GetUserData();

    $scope.ModalLogin = function ()
    {
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

    $timeout(function () {
        $('#txtUsuario').focus();
    }, 200);

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
                                } else {
                                    $scope.DatosUsuario = { Usuario: '', Clave: '', CodigoIntegracion: '' };
                                    $timeout(function () {
                                        $scope.RegistrarSesion();
                                    }, 0); 
                                    $timeout(function () { $rootScope.IniciandoSesionMensajes = 'Cargando datos de usuario...'; }, 100);
                                    $timeout(function () { $rootScope.IniciandoSesionMensajes = 'Cargando menús...'; }, 1800);
                                    $timeout(function () { $rootScope.IniciandoSesionMensajes = 'Iniciando sesión...'; }, 2200);                                                                       

                                    $timeout(function () {                                        
                                        $state.go('home');                                        
                                    }, 3000);
                                    $timeout(function () {
                                        $scope.Cancelar();
                                    }, 3500);


                                }
                            }
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data.error == "invalid_grant" && err.status === 400) {
                            $scope.Cancelar();
                            toastr.error(err.data.error_description, '', $scope.toastrOptions);                            
                        }                           
                        else if (err.data !== null && err.status === 500) {
                            $scope.Cancelar();
                            toastr.error(err.data, '', $scope.toastrOptions);
                        }
                            
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