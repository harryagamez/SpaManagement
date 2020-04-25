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
        $scope.Login = Login;
        $scope.ValidarIntegracion = false;
        $scope.IsLoading = false;
        $scope.ProcessQueu = [];

        function Login() {

            if ($scope.ValidarDatos()) {

                $scope.BeginProcess("Login");

                authService.login($scope.DatosUsuario.Usuario, $scope.DatosUsuario.Password, $scope.ValidarIntegracion, $scope.DatosUsuario.CodigoIntegracion)
                    .then(
                        function (result) {
                            if (result.data !== undefined && result.data !== null) {
                                if (result.data.access_token !== undefined && result.data.access_token !== null) {
                                    if (result.data.IntegrationCode == null || result.data.IntegrationCode === "undefined") {
                                        $scope.EndProcess("Login");
                                        $scope.validarIntegracion = true;
                                        $('#ctlIntegration').focus();
                                    } else {
                                        $scope.EndProcess("Login");
                                        $state.go('home')
                                    }
                                }
                            }
                        }, function (err) {
                            $scope.EndProcess("login");
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

        $scope.BeginProcess = function (processName) {
            $scope.ProcessQueu.push(processName);
            $scope.IsLoading = true;
        };

        $scope.EndProcess = function (processName) {
            for (var i = 0; i < $scope.ProcessQueu.length; i++) {
                if ($scope.ProcessQueu[i] === processName) {
                    $scope.ProcessQueu.splice(i, 1);
                }
            }

            if ($scope.ProcessQueu.length === 0) {
                $scope.IsLoading = false;
            }
        };

    }

    function HomeController($scope, $rootScope, $element, localStorageService, authService) {

        $scope.Menu = [];
        $scope.Logout = Logout;

        $scope.$on('successfull.menuload', function () {
            $scope.Menu = localStorageService.get("menu");
        });

        $scope.toggleSidebar = function () {
            document.getElementById("sidebar").classList.toggle('active');
        }

        function Logout() {
            authService.logOut();
        }
    }

    function ClientesController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, localStorageService, SPAService) {

        // Variables
        $scope.Clientes = [];
        $scope.ObjetoCliente = [];
        $scope.Municipios = [];
        $scope.Barrios = [];
        $scope.EstadoClientes = [];
        $scope.TipoClientes = [];
        $scope.IsLoading = false;
        $scope.ProcessQueu = [];

        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.IdUsuario = parseInt($rootScope.userData.userId);

        // Enviar - Traer Datos
        $scope.EstadoClientes.push({ 'Id': 1, 'Descripcion': 'ACTIVO' });
        $scope.EstadoClientes.push({ 'Id': 2, 'Descripcion': 'INACTIVO' });

        $scope.Clientes = localStorageService.get("clientes");
        $scope.Municipios = localStorageService.get("municipios");
        $scope.Barrios = localStorageService.get("barrios");
        $scope.TipoClientes = localStorageService.get("tipo_clientes");

        // Objecto Cliente
        $scope.Cliente =
        {
            Id_Cliente: 6, Cedula: '37930050',
            Nombres: 'Camila', Apellidos: 'Yepes',
            Telefono_Fijo: '4678902', Telefono_Movil: '3224567812',
            Mail: 'camila78@gmail.com', Direccion: 'Calle 47D # 72-36',
            Id_Barrio: $scope.Barrios[68].id_Barrio,
            Fecha_Nacimiento: $filter('date')(new Date(), 'yyyy-MM-dd'),
            Id_Tipo: $scope.TipoClientes[0].id_Tipo,
            Estado: $scope.EstadoClientes[0].Descripcion,
            Id_Empresa: $scope.IdEmpresa,
            Id_Usuario_Creacion: $scope.IdUsuario
        }

        $scope.ObjetoCliente.push($scope.Cliente);

        // Invocaciones API
        $scope.GuardarCliente = GuardarCliente;
        $scope.ConsultarClientes = ConsultarClientes;

        function GuardarCliente() {

            $scope.BeginProcess("GuardarCliente");

            SPAService._registrarActualizarCliente(JSON.stringify($scope.ObjetoCliente))
                .then(
                    function (result) {
                        if (result.data === true) {
                            $scope.EndProcess("GuardarCliente");
                            toastr.success('Cliente registrado y/o actualizado correctamente', '', $scope.toastrOptions);
                            $scope.ConsultarClientes();
                        }
                    }, function (err) {
                        toastr.remove();
                        $scope.EndProcess("GuardarCliente");
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })

        }

        function ConsultarClientes() {

            $scope.BeginProcess("ConsultarClientes");

            SPAService._consultarClientes($scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.EndProcess("ConsultarClientes");
                            $scope.Clientes = [];
                            $scope.Clientes = result.data;
                            localStorageService.remove("clientes");
                        }
                    }, function (err) {
                        toastr.remove();
                        $scope.EndProcess("ConsultarClientes");
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }


        // Handlers
        $("body").tooltip({
            selector: '[data-toggle="tooltip"]',
            trigger: 'hover'
        });

        // Eventos
        $scope.BeginProcess = function (processName) {
            $scope.ProcessQueu.push(processName);
            $scope.IsLoading = true;
        };

        $scope.EndProcess = function (processName) {
            for (var i = 0; i < $scope.ProcessQueu.length; i++) {
                if ($scope.ProcessQueu[i] === processName) {
                    $scope.ProcessQueu.splice(i, 1);
                }
            }

            if ($scope.ProcessQueu.length === 0) {
                $scope.IsLoading = false;
            }
        };

    }

})();

