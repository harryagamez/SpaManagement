(function () {

    agGrid.initialiseAgGridWithAngular1(angular);

    angular.module('app.controllers', [])
        .controller("LoginController", LoginController)
        .controller("HomeController", HomeController)
        .controller("ClientesController", ClientesController)
        .controller("ServiciosController", ServiciosController)

    LoginController.$inject = ['$scope', '$state', '$location', '$mdDialog', '$rootScope', '$timeout', 'AuthService'];
    HomeController.$inject = ['$scope', '$rootScope', '$element', '$location', 'localStorageService', 'AuthService'];
    ClientesController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];
    ServiciosController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

    function LoginController($scope, $state, $location, $mdDialog, $rootScope, $timeout, authService) {

        // Variables
        $scope.ValidarDatos = ValidarDatos;
        $scope.Login = Login;
        $scope.ValidarIntegracion = false;
        $scope.DatosUsuario = { Usuario: '', Clave: '', CodigoIntegracion: '' }

        $('#txtUsuario').focus();

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

    }

    function HomeController($scope, $rootScope, $element, $location, localStorageService, authService) {

        $scope.Logout = function () {
            authService.logOut();
        }

        $scope.UsuarioSistema = $rootScope.userData.userName;
        $scope.NombreEmpresa = $rootScope.Nombre_Empresa;

        $scope.$on('successfull.menuload', function () {
            if ($scope.Menu.length == 0)
                $scope.Menu = $rootScope.Menu;
        });

        $scope.$on('$viewContentLoaded', function () {
            $location.replace();
        });

        $scope.$on("$destroy", function () {
            $scope.Menu = [];
        });

    }

    function ClientesController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {

        // Variables
        $scope.Clientes = [];
        $scope.ObjetoCliente = [];
        $scope.Municipios = [];
        $scope.Barrios = [];
        $scope.BarriosGlobales = [];
        $scope.EstadoClientes = [];
        $scope.TipoClientes = [];
        $scope.IsLoading = false;
        $scope.ProcessQueu = [];
        $scope.MunicipioSeleccionado = -1;
        $scope.BarrioSeleccionado = -1;
        $scope.TipoClienteSeleccionado = -1;
        $scope.EstadoSeleccionado = 'ACTIVO';
        $scope.Accion = '';
        $scope.ListadoClientes = false;
        $scope.DetalladoServicios = false;
        $scope.GeneralServicios = false;

        // Inicialización
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.IdUsuario = parseInt($rootScope.userData.userId);

        $scope.Cliente =
        {
            Id_Cliente: -1,
            Cedula: '',
            Nombres: '',
            Apellidos: '',
            Telefono_Fijo: '',
            Telefono_Movil: '',
            Mail: '', Direccion: '',
            Id_Municipio: -1,
            Id_Barrio: -1,
            Fecha_Nacimiento: $filter('date')(new Date(), 'MM-dd-yyyy'),
            Id_Tipo: -1,
            Estado: $scope.EstadoSeleccionado,
            Id_Empresa: $scope.IdEmpresa,
            Id_Usuario_Creacion: $scope.IdUsuario
        }

        $scope.Inicializacion = function () {

            $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();

            $('#txtCedula').focus();

        }

        // Invocaciones API
        $scope.GuardarCliente = function () {

            if ($scope.ValidarDatos()) {

                $scope.ObjetoCliente = [];
                $scope.ObjetoCliente.push($scope.Cliente);

                SPAService._registrarActualizarCliente(JSON.stringify($scope.ObjetoCliente))
                    .then(
                        function (result) {
                            if (result.data === true) {

                                toastr.success('Cliente registrado y/o actualizado correctamente', '', $scope.toastrOptions);
                                $scope.ConsultarClientes();
                                $scope.LimpiarDatos();
                                $('#txtInvoiceNumber').focus();

                            }
                        }, function (err) {
                            toastr.remove();
                            if (err.data !== null && err.status === 500)
                                toastr.error(err.data, '', $scope.toastrOptions);
                        })
            }


        }

        $scope.ConsultarClientes = function () {

            SPAService._consultarClientes($scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.Clientes = [];
                            $scope.Clientes = result.data;                            
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

            $('#txtCedula').focus();

        }

        $scope.ConsultarCliente = function (e, cedula_cliente) {

            $scope.Accion = '';

            $scope.Cliente.Id_Cliente = -1;
            $scope.Cliente.Nombres = '';
            $scope.Cliente.Apellidos = '';
            $scope.Cliente.Telefono_Fijo = '';
            $scope.Cliente.Telefono_Movil = '';
            $scope.Cliente.Mail = '';
            $scope.Cliente.Direccion = '';
            $scope.Cliente.Id_Barrio = -1;
            $scope.Cliente.Id_Municipio = -1;
            $scope.Cliente.Fecha_Nacimiento = $filter('date')(new Date(), 'MM-dd-yyyy');
            $scope.Cliente.Id_Tipo = -1;
            $scope.Cliente.Estado = $scope.EstadoSeleccionado;

            if (cedula_cliente !== null && cedula_cliente !== '') {

                SPAService._consultarCliente(cedula_cliente, $scope.IdEmpresa)
                    .then(
                        function (result) {

                            if (result.data !== undefined && result.data !== null) {

                                $scope.Accion = 'BUSQUEDA_CLIENTE';

                                $scope.Cliente.Id_Cliente = result.data.id_Cliente;
                                $scope.Cliente.Cedula = result.data.cedula;
                                $scope.Cliente.Nombres = result.data.nombres;
                                $scope.Cliente.Apellidos = result.data.apellidos;

                                $scope.Cliente.Telefono_Fijo = result.data.telefono_Fijo;
                                $scope.Cliente.Telefono_Movil = result.data.telefono_Movil;
                                $scope.Cliente.Mail = result.data.mail;
                                $scope.Cliente.Direccion = result.data.direccion;
                                $scope.Cliente.Id_Barrio = result.data.id_Barrio;
                                $scope.Cliente.Id_Municipio = result.data.id_Municipio;
                                $scope.Cliente.Fecha_Nacimiento = $filter('date')(new Date(result.data.fecha_Nacimiento), 'MM/dd/yyyy');
                                $scope.Cliente.Id_Tipo = result.data.id_Tipo;
                                $scope.TipoClienteSeleccionado = result.data.id_Tipo;
                                $scope.Cliente.Estado = result.data.estado;

                                $scope.MunicipioSeleccionado = $scope.Cliente.Id_Municipio;

                                $scope.ConsultarBarrios($scope.MunicipioSeleccionado);

                            }

                        }, function (err) {
                            toastr.remove();
                            if (err.data !== null && err.status === 500)
                                toastr.error(err.data, '', $scope.toastrOptions);
                        })

                $('#txtNombre').focus();
                $scope.CedulaReadOnly = true;

            }

        }

        $scope.ConsultarTipoClientes = function () {

            SPAService._consultarTipoClientes()
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {

                            $scope.TipoClientes = [];
                            $scope.TipoClientes = result.data;
                            $scope.TipoClientes.push({ id_Tipo: -1, nombre: '[Seleccione]', descripcion: "" })
                            $scope.TipoClientes = $filter('orderBy')($scope.TipoClientes, 'nombre', false);

                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        $scope.ConsultarBarrios = function (id_Municipio) {

            SPAService._consultarBarrios(id_Municipio)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {

                            $scope.Barrios = [];
                            $scope.BarrioSeleccionado = -1

                            $scope.Barrios = result.data;
                            if ($scope.Barrios.length > 0) {

                                $scope.Barrios.push({ id_Barrio: -1, nombre: '[Seleccione]', id_Municipio: -1, codigo: "-1", id_Object: -1 });
                                $scope.Barrios = $filter('orderBy')($scope.Barrios, 'nombre', false);
                                $scope.Barrios = $filter('orderBy')($scope.Barrios, 'id_Municipio', false);


                            } else
                                $scope.MunicipioSeleccionado = -1;

                            if ($scope.Accion === 'BUSQUEDA_CLIENTE') {

                                let filtrarBarrio = Enumerable.From($scope.Barrios)
                                    .Where(function (x) { return x.id_Barrio === $scope.Cliente.Id_Barrio })
                                    .ToArray();

                                if (filtrarBarrio.length > 0)
                                    $scope.BarrioSeleccionado = $scope.Cliente.Id_Barrio;
                                else
                                    $scope.BarrioSeleccionado = -1;

                            }
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })

        }

        $scope.ConsultarMunicipios = function () {

            SPAService._consultarMunicipios()
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {

                            $scope.Municipios = [];
                            $scope.Municipios = result.data;
                            $scope.Municipios.push({ id_Municipio: -1, nombre: '[Seleccione]' });

                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })

        }

        // Filtros
        $scope.FiltrarBarrios = function (id_Municipio) {

            $scope.ConsultarBarrios(id_Municipio);

        }

        window.onresize = function () {

            $timeout(function () {
                $scope.ClientesGridOptions.api.sizeColumnsToFit();
            }, 300);

        }

        // Validaciones
        $scope.ValidarDatos = function () {

            let maiL_expression = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,5}$/;

            $scope.Cliente.Id_Barrio = $scope.BarrioSeleccionado
            $scope.Cliente.Id_Tipo = $scope.TipoClienteSeleccionado;

            if ($scope.Cliente.Cedula === '') {
                toastr.info('Identificación del cliente es requerida', '', $scope.toastrOptions);
                $('#txtCedula').focus();
                return false;
            }

            if ($scope.Cliente.Nombres === '') {
                toastr.info('Nombre del cliente es requerido', '', $scope.toastrOptions);
                $('#txtNombre').focus();
                return false;
            }

            if ($scope.Cliente.Apellidos === '') {
                toastr.info('Apellido del cliente es requerido', '', $scope.toastrOptions);
                $('#txtApellido').focus();
                return false;
            }

            if ($scope.Cliente.Mail === '') {
                toastr.info('Correo electrónico del clientes es requerido', '', $scope.toastrOptions);
                $('#txtMail').focus();
                return false;
            }

            if (!maiL_expression.test($scope.Cliente.Mail)) {
                toastr.info('La dirección de correo electrónico no es válida.', '', $scope.toastrOptions);
                $('#txtMail').focus();
                return false;
            }

            if ($scope.Cliente.Telefono_Movil === '') {
                toastr.info('Celular del cliente es requerido', '', $scope.toastrOptions);
                $('#txtMovil').focus();
                return false;
            }

            if ($scope.Cliente.Id_Tipo === -1) {
                toastr.info('Tipo de cliente es requerido', '', $scope.toastrOptions);
                $('#slTipoCliente').focus();
                return false;
            }

            if ($scope.Cliente.Fecha_Nacimiento > $filter('date')(new Date(), 'MM/dd/yyyy')) {
                toastr.info('La fecha de nacimiento, debe ser menor que la fecha actual', '', $scope.toastrOptions);
                $('#dpFechaNacimiento').focus();
                return false;
            }

            if ($scope.Cliente.Id_Barrio === -1) {
                toastr.info('Debe seleccionar un barrio', '', $scope.toastrOptions);
                $('#slBarrio').focus();
                return false;
            }

            return true;
        }

        // Limpiar Datos
        $scope.LimpiarDatos = function () {

            $scope.Cliente =
            {
                Id_Cliente: -1,
                Cedula: '',
                Nombres: '',
                Apellidos: '',
                Telefono_Fijo: '',
                Telefono_Movil: '',
                Mail: '', Direccion: '',
                Id_Municipio: -1,
                Id_Barrio: -1,
                Fecha_Nacimiento: $filter('date')(new Date(), 'MM-dd-yyyy'),
                Id_Tipo: -1,
                Estado: $scope.EstadoSeleccionado,
                Id_Empresa: $scope.IdEmpresa,
                Id_Usuario_Creacion: $scope.IdUsuario
            }

            $scope.MunicipioSeleccionado = -1;
            $scope.BarrioSeleccionado = -1;
            $scope.TipoClienteSeleccionado = -1;

            $scope.ListadoClientes = false;
            $scope.DetalladoServicios = false;
            $scope.GeneralServicios = false;
            $scope.Accion = '';
            $scope.ObjetoCliente = [];

            $('#txtCedula').focus();
            $scope.CedulaReadOnly = false;

        }

        // Agr-grid Options
        $scope.ClientesGridOptionsColumns = [

            {
                headerName: "", field: "Checked", suppressFilter: true, width: 30, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
            },
            {
                headerName: "Cédula", field: 'cedula', width: 110, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
            },
            {
                headerName: "Nombres(s)", field: 'nombres', width: 140, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Apellido(s)", field: 'apellidos', width: 150, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Celular", field: 'telefono_Movil', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
            },
            {
                headerName: "Mail", field: 'mail', width: 250, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Dirección", field: 'direccion', width: 240, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Barrio", field: 'barrio', width: 170, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Registro", field: 'fecha_Registro', width: 120, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, cellRenderer: (data) => {
                    return data.value ? $filter('date')(new Date(data.value), 'MM/dd/yyyy') : '';
                },
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
            rowSelection: 'multiple',
            onRowClicked: OnRowClicked
        }

        function OnRowClicked(event) {

            if (event.node.data !== undefined && event.node.data !== null) {

                $scope.Accion = 'BUSQUEDA_CLIENTE';
                $scope.Cliente.Id_Cliente = event.node.data.id_Cliente;
                $scope.Cliente.Cedula = event.node.data.cedula;
                $scope.Cliente.Nombres = event.node.data.nombres;
                $scope.Cliente.Apellidos = event.node.data.apellidos;

                $scope.Cliente.Telefono_Fijo = event.node.data.telefono_Fijo;
                $scope.Cliente.Telefono_Movil = event.node.data.telefono_Movil;
                $scope.Cliente.Mail = event.node.data.mail;
                $scope.Cliente.Direccion = event.node.data.direccion;
                $scope.Cliente.Id_Municipio = event.node.data.id_Municipio;
                $scope.Cliente.Id_Barrio = event.node.data.id_Barrio;                
                $scope.Cliente.Fecha_Nacimiento = $filter('date')(new Date(event.node.data.fecha_Nacimiento), 'MM/dd/yyyy');
                $scope.Cliente.Id_Tipo = event.node.data.id_Tipo;
                $scope.TipoClienteSeleccionado = event.node.data.id_Tipo;
                $scope.Cliente.Estado = event.node.data.estado;

                $scope.MunicipioSeleccionado = $scope.Cliente.Id_Municipio;
                $scope.BarrioSeleccionado = $scope.Cliente.Id_Barrio;

                $scope.ConsultarBarrios($scope.MunicipioSeleccionado);

                $scope.CedulaReadOnly = true;
                $('#txtNombre').focus();
            }

        }

        // Invocación Funciones
        $scope.ConsultarClientes();
        $scope.ConsultarMunicipios();
        $scope.ConsultarTipoClientes();
        $scope.Inicializacion();

    }

    function ServiciosController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {

        // Variables
        $scope.TipoServicios = [];
        $scope.Servicios = [];
        $scope.TipoServicioSeleccionado = -1;
        $scope.AccionServicio = 'Registrar Servicio';

        // Inicialización
        $scope.Inicializacion = function () {

            $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();

            $('#txtNombreServicio').focus();

        }

        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.IdUsuario = parseInt($rootScope.userData.userId);

        // Invocaciones API
        $scope.ConsultarTipoServicios = function () {

            SPAService._consultarTipoServicios()
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {

                            $scope.TipoServicios = [];
                            $scope.TipoServicios = result.data;
                            $scope.TipoServicios.push({ id_tiposervicio: -1, nombre: '[Seleccione]', descripcion: '', fecha_Registro: null, fecha_Modificacion: null });

                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })

        }

        $scope.ConsultarServicios = function () {

            SPAService._consultarServicios($scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                          
                            $scope.Servicios = [];
                            $scope.Servicios = result.data;
                            $scope.ServiciosGridOptions.api.setRowData($scope.Servicios);

                            $timeout(function () {
                                $scope.ServiciosGridOptions.api.sizeColumnsToFit();
                            }, 300);

                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        // Agr-grid Options
        $scope.ServiciosGridOptionsColumns = [

            {
                headerName: "", field: "Checked", suppressFilter: true, width: 25, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
            },
            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 25, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='ConsultarServicio(data.id_Servicio)' data-toggle='tooltip' title='Editar servicio' class='material-icons' style='font-size:20px;margin-top:-1px;color:#646769;'>create</i>";
                }
            },
            {
                headerName: "Nombre", field: 'nombre', width: 170, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Descripcion", field: 'descripcion', width: 150, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }, cellRenderer: function (params) {
                    return "<span  data-toggle='tooltip' title='{{data.descripcion}}'>{{data.descripcion}}</span>"
                },
            },
            {
                headerName: "Tiempo", field: 'tiempo', width: 70, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
            },
            {
                headerName: "Costo", field: 'valor', width: 60, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
            },
            {
                headerName: "Tipo", field: 'nombre_Tipo_Servicio', width: 90, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Estado", field: 'estado', width: 80, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' },
            },

        ];

        $scope.ServiciosGridOptions = {
            defaultColDef: {
                resizable: true                
            },
            columnDefs: $scope.ServiciosGridOptionsColumns,
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
        

        $scope.onFilterTextBoxChanged = function() {            
            $scope.ServiciosGridOptions.api.setQuickFilter(document.getElementById('txtNombreServicio').value);
        }

        // Formatos
        function currencyFormatter(params) {
            var valueGrid = params.value;
            return $filter('currency')(valueGrid, '$', 0);
        }        

        // Eventos
        window.onresize = function () {

            $timeout(function () {
                $scope.ServiciosGridOptions.api.sizeColumnsToFit();
            }, 300);

        }

        $scope.Cancelar = function () {
            $mdDialog.cancel();
        };

        $scope.ModalNuevoServicio = function () {

            $scope.AccionServicio = 'Registrar Servicio';

            $mdDialog.show({
                contentElement: '#dlgNuevoServicio',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true
            })
                .then(function () {

                }, function () {

                });

        }

        // Invocación Funciones
        $scope.ConsultarTipoServicios();
        $scope.ConsultarServicios();
        $scope.Inicializacion();

    }

    angular.element(document).ready(function () {

        // Eventos
        $("body").tooltip({
            selector: '[data-toggle="tooltip"]',
            trigger: 'hover'
        });

        $('body').on("click", ".dropdown-menu", function (e) {
            $(this).parent().is(".show") && e.stopPropagation();
        });
       
    })

})();

