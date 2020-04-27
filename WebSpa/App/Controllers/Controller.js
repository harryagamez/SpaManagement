(function () {

    agGrid.initialiseAgGridWithAngular1(angular);

    angular.module('app.controllers', [])
        .controller("LoginController", LoginController)
        .controller("HomeController", HomeController)
        .controller("ClientesController", ClientesController)

    LoginController.$inject = ['$scope', '$state', '$location', '$mdDialog', '$rootScope', '$timeout', 'AuthService'];
    HomeController.$inject = ['$scope', '$rootScope', '$element', '$location', 'localStorageService', 'AuthService'];
    ClientesController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

    function LoginController($scope, $state, $location, $mdDialog, $rootScope, $timeout, authService) {

        // Variables
        $scope.ValidarDatos = ValidarDatos;
        $scope.Login = Login;
        $scope.ValidarIntegracion = false;
        $scope.IsLoading = false;
        $scope.ProcessQueu = [];
        $scope.DatosUsuario = { Usuario: '', Clave: '', CodigoIntegracion: '' }

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
                                    if (result.data.IntegrationCode == null || result.data.IntegrationCode === "undefined") {
                                        $scope.validarIntegracion = true;
                                        $('#ctlIntegration').focus();
                                    } else {
                                        $state.go('home')
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

    function HomeController($scope, $rootScope, $element, $location, localStorageService, authService) {

        $scope.Logout = Logout;

        $scope.$on('successfull.menuload', function () {
            $scope.Menu = [];
            $scope.Menu = $rootScope.Menu;
        });

        $scope.$on('$viewContentLoaded', function () {
            $location.replace();
        });

        $scope.toggleSidebar = function () {
            document.getElementById("sidebar").classList.toggle('active');
        }

        function Logout() {
            authService.logOut();
        }
    }

    function ClientesController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {

        // Inicializacion
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.IdUsuario = parseInt($rootScope.userData.userId);

        // Variables
        $scope.Clientes = [];
        $scope.ObjetoCliente = [];
        $scope.Municipios = [];
        $scope.Barrios = [];
        $scope.EstadoClientes = [];
        $scope.TipoClientes = [];
        $scope.IsLoading = false;
        $scope.ProcessQueu = [];

        // Enviar - Traer Datos
        $scope.EstadoClientes.push({ Id: -1, Descripcion: '[Seleccione]' });
        $scope.EstadoClientes.push({ Id: 1, Descripcion: 'ACTIVO' });
        $scope.EstadoClientes.push({ Id: 2, Descripcion: 'INACTIVO' });

        $scope.Clientes = $rootScope.Clientes;
        $scope.Municipios = $rootScope.Municipios;
        $scope.Barrios = $rootScope.Barrios;
        $scope.TipoClientes = $rootScope.TipoClientes;

        // Objecto Cliente
        $scope.Cliente =
        {
            Id_Cliente: 6, Cedula: '37930050',
            Nombres: 'Camila', Apellidos: 'Yepes',
            Telefono_Fijo: '4678902', Telefono_Movil: '3224567812',
            Mail: 'camila78@gmail.com', Direccion: 'Calle 47D # 72-36',
            Id_Barrio: $scope.Barrios[68].id_Barrio,
            Fecha_Nacimiento: $filter('date')(new Date(), 'MM-dd-yyyy'),
            Id_Tipo: $scope.TipoClientes[0].id_Tipo,
            Estado: -1,
            Id_Empresa: $scope.IdEmpresa,
            Id_Usuario_Creacion: $scope.IdUsuario
        }

        $scope.ObjetoCliente.push($scope.Cliente);

        // Invocaciones API
        $scope.GuardarCliente = GuardarCliente;
        $scope.ConsultarClientes = ConsultarClientes;
        $scope.Inicializacion = Inicializacion;

        function GuardarCliente() {

            SPAService._registrarActualizarCliente(JSON.stringify($scope.ObjetoCliente))
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Cliente registrado y/o actualizado correctamente', '', $scope.toastrOptions);
                            $scope.ConsultarClientes();
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })

        }

        function ConsultarClientes() {
         
            SPAService._consultarClientes($scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.Clientes = [];
                            $scope.Clientes = result.data;
                            localStorageService.remove("clientes");
                            $scope.ClientesGridOptions.api.setRowData($scope.Clientes);

                            $timeout(function () {
                                $scope.ClientesGridOptions.api.sizeColumnsToFit();
                            }, 300);
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        function Inicializacion() {
            document.getElementById("divGridClientes").style.height = (window.innerHeight - 260) + "px"
            $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
        }

        // Eventos
        $("body").tooltip({
            selector: '[data-toggle="tooltip"]',
            trigger: 'hover'
        });

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

        window.onresize = function () {
            document.getElementById("divGridClientes").style.height = (window.innerHeight - 260) + "px"

            $timeout(function () {
                $scope.ClientesGridOptions.api.sizeColumnsToFit();
            }, 300);
        }

        // Agr-grid Options
        $scope.ClientesGridOptionsColumns = [

            {
                headerName: "", field: "Checked", suppressFilter: true, width: 30, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
            },
            {
                headerName: "Cédula", field: 'cedula', width: 130, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
            },
            {
                headerName: "Nombres(s)", field: 'nombres', width: 130, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Apellido(s)", field: 'apellidos', width: 130, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Celular", field: 'telefono_Movil', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
            },
            {
                headerName: "Mail", field: 'mail', width: 220, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Dirección", field: 'direccion', width: 240, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Barrio", field: 'barrio', width: 170, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Registro", field: 'fecha_Registro', width: 130, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' },
            }

        ];

        $scope.ClientesGridOptions = {
            defaultColDef: {
                resizable: true
            },
            columnDefs: $scope.ClientesGridOptionsColumns,
            rowData: [],
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            angularCompileRows: true,
            onGridReady: function (params) {
                $timeout(function () {
                }, 400)
            },
            fullWidthCellRenderer: true,
            animateRows: true,
            suppressRowClickSelection: true,
            rowSelection: 'multiple'
        }

        $scope.ConsultarClientes();
        $scope.Inicializacion();
    }

})();

