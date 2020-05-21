(function () {

    agGrid.initialiseAgGridWithAngular1(angular);

    angular.module('app.controllers', [])
        .controller("LoginController", LoginController)
        .controller("HomeController", HomeController)
        .controller("ClientesController", ClientesController)
        .controller("ServiciosController", ServiciosController)
        .controller("EmpleadosController", EmpleadosController)
        .controller("ProductosController", ProductosController)

    LoginController.$inject = ['$scope', '$state', '$location', '$mdDialog', '$rootScope', '$timeout', 'AuthService'];
    HomeController.$inject = ['$scope', '$rootScope', '$element', '$location', 'localStorageService', 'AuthService'];
    ClientesController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];
    ServiciosController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];
    EmpleadosController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];
    ProductosController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

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

        $scope.Barrios.push({ id_Barrio: -1, nombre: '[Seleccione]', id_Municipio: -1, codigo: "-1", id_Object: -1 });

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
                            }, 200);

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

                                $('#txtNombre').focus();
                                $scope.CedulaReadOnly = true;

                            }

                        }, function (err) {
                            toastr.remove();
                            if (err.data !== null && err.status === 500)
                                toastr.error(err.data, '', $scope.toastrOptions);
                        })

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
                            $scope.Municipios = $filter('orderBy')($scope.Municipios, 'nombre', false);
                            $scope.Municipios = $filter('orderBy')($scope.Municipios, 'id_Municipio', false);

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
            }, 200);

        }

        // Validaciones
        $scope.ValidarDatos = function () {

            let maiL_expression = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,5}$/;

            $scope.Cliente.Id_Barrio = $scope.BarrioSeleccionado
            $scope.Cliente.Id_Tipo = $scope.TipoClienteSeleccionado;
            $scope.Cliente.Estado = $scope.EstadoSeleccionado;

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

            if (new Date($scope.Cliente.Fecha_Nacimiento) > $filter('date')(new Date(), 'MM/dd/yyyy')) {
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

            $scope.EstadoSeleccionado = 'ACTIVO';

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
                headerName: "Apellido(s)", field: 'apellidos', width: 155, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Celular", field: 'telefono_Movil', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#212121', 'background': 'RGBA(210,216,230,0.75)', 'font-weight': 'bold', 'border-bottom': '1px dashed #212121', 'border-right': '1px dashed #212121', 'border-left': '1px dashed #212121' },
            },
            {
                headerName: "Mail", field: 'mail', width: 250, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Dirección", field: 'direccion', width: 240, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Barrio", field: 'barrio', width: 175, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Registro", field: 'fecha_Registro', hide: true, width: 120, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, cellRenderer: (data) => {
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
            },
            fullWidthCellRenderer: true,
            animateRows: true,
            suppressRowClickSelection: true,
            rowSelection: 'multiple',
            onRowClicked: OnRowClicked,
            getRowStyle: ChangeRowColor
        }

        function ChangeRowColor(params) {

            if (params.data.estado === 'INACTIVO') {
                return { 'background-color': '#ecf0e0', 'color': '#999999', 'font-weight': '300' };
            }

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
                $scope.EstadoSeleccionado = $scope.Cliente.Estado;
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

        // VARIABLES
        $scope.TipoServicios = [];
        $scope.ObjetoServicio = [];
        $scope.Servicios = [];
        $scope.TipoServicioSeleccionado = -1;
        $scope.EstadoSeleccionado = 'ACTIVO';
        $scope.AccionServicio = 'Registrar Servicio';
        $scope.ImagenServicioBase64 = '';
        $scope.InformacionImagen = '';


        // INICIALIZACIÓN
        $scope.Inicializacion = function () {

            $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();

            $('#txtBuscarServicio').focus();

        }

        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.IdUsuario = parseInt($rootScope.userData.userId);

        $scope.Servicio =
        {
            Descripcion: '',
            Estado: $scope.EstadoSeleccionado,
            Fecha_Registro: $filter('date')(new Date(), 'MM-dd-yyyy'),
            Id_Empresa: $scope.IdEmpresa,
            Id_TipoServicio: -1,
            Id_Servicio: -1,
            Nombre: '',
            Nombre_Tipo_Servicio: '',
            Tiempo: 0,
            Valor: 0,
            Logo_Base64: '',
        }

        // INVOCACIONES API
        $scope.GuardarServicio = function () {

            if ($scope.ValidarDatos()) {

                $scope.ObjetoServicio = [];
                $scope.ObjetoServicio.push($scope.Servicio);

                SPAService._guardarServicio(JSON.stringify($scope.ObjetoServicio))
                    .then(
                        function (result) {
                            if (result.data === true) {

                                toastr.success('Servicio registrado/actualizado correctamente', '', $scope.toastrOptions);
                                $scope.ConsultarServicios();
                                $scope.LimpiarDatos();

                                if ($scope.AccionServicio === 'Editar Servicio')
                                    $scope.Cancelar();

                            }
                        }, function (err) {
                            toastr.remove();
                            if (err.data !== null && err.status === 500)
                                toastr.error(err.data, '', $scope.toastrOptions);
                        })

            }

        }

        $scope.ConsultarTipoServicios = function () {

            SPAService._consultarTipoServicios()
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {

                            $scope.TipoServicios = [];
                            $scope.TipoServicios = result.data;
                            $scope.TipoServicios.push({ id_TipoServicio: -1, nombre: '[Seleccione]', descripcion: '', fecha_Registro: null, fecha_Modificacion: null });
                            $scope.TipoServicios = $filter('orderBy')($scope.TipoServicios, 'nombre', false);
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
                            }, 200);

                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })

        }

        // FUNCIONES

        // Consultar Servicio
        $scope.ConsultarServicio = function (data) {

            $scope.TipoServicioSeleccionado = -1;

            if (data.id_Servicio !== undefined && data.id_Servicio !== null) {

                $scope.Servicio.Nombre = data.nombre;
                $scope.Servicio.Descripcion = data.descripcion;
                $scope.Servicio.Estado = data.estado;
                $scope.Servicio.Fecha_Modificacion = $filter('date')(new Date(), 'MM-dd-yyyy');
                $scope.Servicio.Id_Empresa = $scope.IdEmpresa;
                $scope.Servicio.Id_TipoServicio = data.id_TipoServicio;
                $scope.Servicio.Id_Servicio = data.id_Servicio;
                $scope.Servicio.Tiempo = data.tiempo;
                $scope.Servicio.Valor = data.valor;
                $scope.Servicio.Id_Servicio = data.id_Servicio;
                $scope.Servicio.Logo_Base64 = data.logo_Base64;
                $scope.TipoServicioSeleccionado = data.id_TipoServicio;
                $scope.ModalEditarServicio();
                $scope.NombreServicioReadOnly = true;

                $scope.EstadoSeleccionado = $scope.Servicio.Estado;

            }

        }

        // Consultar Servicio Por Nombre
        $scope.ConsultarServicioNombre = function (e, nombre) {

            let row = $scope.ServiciosGridOptions.api.getRowNode(nombre);
            if (row === undefined) return;

            if (row.data.nombre !== undefined && row.data.nombre !== null) {

                $scope.AccionServicio = 'Editar Servicio';
                $scope.Servicio.Nombre = row.data.nombre;
                $scope.Servicio.Descripcion = row.data.descripcion;
                $scope.Servicio.Estado = row.data.estado;
                $scope.Servicio.Fecha_Modificacion = $filter('date')(new Date(), 'MM-dd-yyyy');
                $scope.Servicio.Id_Empresa = $scope.IdEmpresa;
                $scope.Servicio.Id_TipoServicio = row.data.id_TipoServicio;
                $scope.Servicio.Id_Servicio = row.data.id_Servicio;
                $scope.Servicio.Tiempo = row.data.tiempo;
                $scope.Servicio.Valor = row.data.valor;
                $scope.Servicio.Id_Servicio = row.data.id_Servicio;
                $scope.TipoServicioSeleccionado = row.data.id_TipoServicio;

                $scope.NombreServicioReadOnly = true;
                $scope.OcultarbtnNuevo = true;

            }

        }

        // Limpiar Datos
        $scope.LimpiarDatos = function () {

            $scope.EstadoSeleccionado = 'ACTIVO';

            $scope.Servicio =
            {
                Nombre: '',
                Descripcion: '',
                Estado: $scope.EstadoSeleccionado,
                Fecha_Registro: $filter('date')(new Date(), 'MM-dd-yyyy'),
                Id_Empresa: $scope.IdEmpresa,
                Id_TipoServicio: -1,
                Id_Servicio: -1,
                Nombre_Tipo_Servicio: '',
                Tiempo: 0,
                Valor: 0,
                Logo_Base64: '',
            }

            $scope.ImagenServicioBase64 = '';
            $scope.InformacionImagen = '';
            $scope.TipoServicioSeleccionado = -1;

            $('#txtNombreServicio').focus();

        }

        // Validaciones Servicios
        $scope.ValidarDatos = function () {

            $scope.Servicio.Id_TipoServicio = $scope.TipoServicioSeleccionado;
            $scope.Servicio.Estado = $scope.EstadoSeleccionado;

            if ($scope.Servicio.Nombre === '') {
                toastr.info('Nombre del servicio es requerido', '', $scope.toastrOptions);
                $('#txtNombreServicio').focus();
                return false;
            }

            if ($scope.Servicio.Descripcion === '') {
                toastr.info('Descripción del servicio es requerida', '', $scope.toastrOptions);
                $('#txtDescripcionServicio').focus();
                return false;
            }

            if (parseInt($scope.Servicio.Tiempo) === 0) {
                toastr.info('Tiempo del servicio es requerido', '', $scope.toastrOptions);
                $('#txtTiempoServicio').focus();
                return false;
            }

            if ($scope.Servicio.Id_TipoServicio === -1) {
                toastr.info('Tipo de servicio es requerido', '', $scope.toastrOptions);
                $('#slTipoServicio').focus();
                return false;
            }

            if (parseInt($scope.Servicio.Valor) === 0) {
                toastr.info('Valor del servicio es requerido', '', $scope.toastrOptions);
                $('#txtValorServicio').focus();
                return false;
            }

            return true;

        }

        // Modal Nuevo Servicio
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
                    $('#txtBuscarServicio').focus();
                });

            $scope.LimpiarDatos();
            $scope.NombreServicioReadOnly = false;
            $scope.OcultarbtnNuevo = false;

        }

        // Modal Editar Servicio
        $scope.ModalEditarServicio = function () {

            $scope.AccionServicio = 'Editar Servicio';

            $mdDialog.show({
                contentElement: '#dlgNuevoServicio',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true
            })
                .then(function () {
                }, function () {
                    $('#txtBuscarServicio').focus();
                    $scope.LimpiarDatos();
                });

            $scope.NombreServicioReadOnly = true
            $scope.OcultarbtnNuevo = true;

        }

        // Agr-grid Options
        $scope.ServiciosGridOptionsColumns = [

            {
                headerName: "", field: "Checked", suppressFilter: true, width: 25, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
            },
            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 25, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='ConsultarServicio(data)' data-toggle='tooltip' title='Editar servicio' class='material-icons' style='font-size:20px;margin-top:-1px;color:#646769;'>create</i>";
                },
            },
            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 25, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='VisualizarImagen(data)' data-toggle='tooltip' title='Ver imagen' class='material-icons' style='font-size:20px;margin-top:-1px;color:#646769;'>image</i>";
                },
            },
            {
                headerName: "Nombre", field: 'nombre', width: 150, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Descripcion", field: 'descripcion', width: 150, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }, cellRenderer: function (params) {
                    return "<span  data-toggle='tooltip' data-placement='left' title='{{data.descripcion}}'>{{data.descripcion}}</span>"
                },
            },
            {
                headerName: "Tiempo", field: 'tiempo', width: 70, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
            },
            {
                headerName: "Costo", field: 'valor', width: 60, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#212121', 'background': 'RGBA(210,216,230,0.75)', 'font-weight': 'bold', 'border-bottom': '1px dashed #212121', 'border-right': '1px dashed #212121', 'border-left': '1px dashed #212121' }, valueFormatter: currencyFormatter
            },
            {
                headerName: "Tipo", field: 'nombre_Tipo_Servicio', width: 100, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Estado", field: 'estado', width: 70, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' },
            }

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
            },
            fullWidthCellRenderer: true,
            animateRows: true,
            suppressRowClickSelection: true,
            rowSelection: 'multiple',
            getRowStyle: ChangeRowColor

        }

        //Change Row Color Inactive Users
        function ChangeRowColor(params) {

            if (params.data.estado === 'INACTIVO') {
                return { 'background-color': '#ecf0e0', 'color': '#999999', 'font-weight': '300' };
            }

        }

        $scope.ServiciosGridOptions.getRowNodeId = function (data) {

            return data.nombre;

        };

        $scope.onFilterTextBoxChanged = function () {

            $scope.ServiciosGridOptions.api.setQuickFilter($('#txtBuscarServicio').val());

        }

        // Formatos
        function currencyFormatter(params) {

            let valueGrid = params.value;
            return $filter('currency')(valueGrid, '$', 0);

        }

        // Eventos
        window.onresize = function () {

            $timeout(function () {
                $scope.ServiciosGridOptions.api.sizeColumnsToFit();
            }, 200);

        }

        $scope.Cancelar = function () {

            $mdDialog.cancel();
            $('#txtBuscarServicio').focus();

        };

        $scope.SeleccionarImagen = function (event) {

            $scope.ImagenServicioBase64 = '';
            $scope.InformacionImagen = '';
            let files = event.target.files;

            let fileSize = files[0].size / 1024 / 1024;
            if (fileSize <= 2) {

                $scope.InformacionImagen = 'Nombre: ' + files[0].name + ' - Tamaño: ' + fileSize.toFixed(3) + ' MB';
                getBase64(files[0]);

            } else {

                toastr.info('El tamaño de la imagen, no puede ser mayor a 2 MB', '', $scope.toastrOptions);
                $scope.$apply();

            }

        }

        $scope.ProcesarImagen = function () {

            $('#ImagenServicio').trigger('click');

        }

        function getBase64(file) {

            let reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = function () {
                $scope.ImagenServicioBase64 = reader.result;
                $scope.Servicio.Logo_Base64 = $scope.ImagenServicioBase64;
                $("#ImagenServicio").val('');
                $('#txtNombreServicio').focus();
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
                $("#ImagenServicio").val('');
            };

        }

        // Invocación Funciones
        $scope.ConsultarTipoServicios();
        $scope.ConsultarServicios();
        $scope.Inicializacion();

    }

    function EmpleadosController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {

        // VARIABLES
        $scope.Empleados = [];
        $scope.Municipios = [];
        $scope.TipoPagos = [];
        $scope.Barrios = [];
        $scope.ServiciosAsignados = [];
        $scope.ProductoSeleccionado = -1;
        $scope.CantidadInsumo = '';
        $scope.MunicipioSeleccionado = -1;
        $scope.BarrioSeleccionado = -1;
        $scope.EstadoSeleccionado = 'ACTIVO';
        $scope.EstadoCivilSeleccionado = 'SOLTERA';
        $scope.TipoPagoSeleccionado = '00000000-000-000-000000000000';

        //INICIALIZACIÓN        
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.IdUsuario = parseInt($rootScope.userData.userId);

        $scope.Empleado =
        {
            Id_Empleado: -1,
            Cedula: '',
            Nombres: '',
            Apellidos: '',
            Telefono_Fijo: '',
            Telefono_Movil: '',
            Estado_Civil: $scope.EstadoCivilSeleccionado, Direccion: '',
            Id_Municipio: -1,
            Id_Barrio: -1,
            Fecha_Nacimiento: $filter('date')(new Date(), 'MM-dd-yyyy'),
            Numero_Hijos: '',
            Id_TipoPago: $scope.TipoPagoSeleccionado,
            Monto: '',
            Estado: $scope.EstadoSeleccionado,
            Id_Empresa: $scope.IdEmpresa
        }

        $scope.Barrios.push({ id_Barrio: -1, nombre: '[Seleccione]', id_Municipio: -1, codigo: "-1", id_Object: -1 });
        $scope.Municipios.push({ id_Municipio: -1, nombre: '[Seleccione]' });
        $scope.TipoPagos.push({ id_TipoPago: '00000000-000-000-000000000000', descripcion: '[Seleccione]', criterio: '' });

        $scope.Inicializacion = function () {
            $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
            $('#txtCedula').focus();

        }


        // INVOCACIONES API
        //Asignar Insumos Empleado
        $scope.AsignarEmpleadoInsumo = function () {
            
            if ($scope.ProductoSeleccionado != -1) {
                if ($scope.CantidadInsumo > 0) {
                    if ($scope.CantidadInsumo <= $scope.InventarioProducto) {
                        debugger;
                        $scope.InsumoAsignado = [];
                        $scope.Insumo =
                        {
                            Id_Transaccion: -1, Id_Producto: $scope.ProductoSeleccionado, Cantidad: $scope.CantidadInsumo, Id_EmpleadoCliente: $scope.IdEmpleado, Id_TipoTransaccion: $scope.TipoTransaccionSeleccionada
                        }
                        $scope.InsumoAsignado.push($scope.Insumo);
                        SPAService._asignarEmpleadoInsumo(JSON.stringify($scope.InsumoAsignado))
                            .then(
                                function (result) {
                                    if (result.data === true) {
                                        toastr.success('Insumo asignado correctamente', '', $scope.toastrOptions);
                                        $scope.InsumoAsignado = [];
                                        $scope.ProductoSeleccionado = -1;                                       
                                        $scope.CantidadInsumo = '';
                                        $scope.InventarioProducto = [];
                                        $scope.ConsultarEmpleadoInsumos();
                                        $scope.ConsultarProductos();
                                    }
                                }, function (err) {
                                    toastr.remove();
                                    if (err.data !== null && err.status === 500)
                                        toastr.error(err.data, '', $scope.toastrOptions);
                                })
                    }
                    else
                        toastr.info('El cantidad de insumos a asignar no puede ser mayor a la cantidad existente en inventario', '', $scope.toastrOptions);
                }
                else
                    toastr.info('El número de insumos a asignar debe ser mayor a 0', '', $scope.toastrOptions);
            }
            else
                toastr.info('Debe seleccionar al menos 1 producto', '', $scope.toastrOptions);
        }

        // Asignar Servicios Empleados
        $scope.AsignarEmpleadoServicio = function () {

            if ($scope.ServiciosAsignados.length > 0) {                
                $scope.ListaServiciosAsignados = [];
                $scope.ListaServiciosAsignados = $scope.ServiciosAsignados.map(function (e) {
                    return { Id_Empleado_Servicio: -1, Id_Servicio: e, Id_Empleado: $scope.IdEmpleado }
                });

                SPAService._asignarEmpleadoServicio(JSON.stringify($scope.ListaServiciosAsignados))
                    .then(
                        function (result) {
                            if (result.data === true) {
                                toastr.success('Servicios asignados correctamente', '', $scope.toastrOptions);
                                $scope.ServiciosAsignados = [];
                                $scope.ServiciosSeleccionados = [];
                                $scope.ConsultarEmpleadoServicio();
                            }
                        }, function (err) {
                            toastr.remove();
                            if (err.data !== null && err.status === 500)
                                toastr.error(err.data, '', $scope.toastrOptions);
                        })


            } else toastr.info('Debe seleccionar al menos 1 servicio', '', $scope.toastrOptions);

        }

        // Desasignar Servicios Empleados
        $scope.DesasignarEmpleadoServicio = function (data) {

            let IdEmpleadoServicio = data.id_Empleado_Servicio;

            SPAService._desasignarEmpleadoServicio(IdEmpleadoServicio)
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Servicio ' + data.servicio + ' desasignado correctamente', '', $scope.toastrOptions);
                            $scope.ConsultarEmpleadoServicio();
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        //Eliminar Insumo Empleados
        $scope.EliminarEmpleadoInsumo = function (data) {
            
            let IdTransaccion = data.id_Transaccion;
            SPAService._eliminarEmpleadoInsumo(IdTransaccion)
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Insumo ' + data.nombre_Producto + ' eliminado correctamente', '', $scope.toastrOptions);                            
                            $scope.InsumoAsignado = [];
                            $scope.ProductoSeleccionado = -1;
                            $scope.CantidadInsumo = '';
                            $scope.InventarioProducto = [];
                            $scope.ConsultarEmpleadoInsumos();
                            $scope.ConsultarProductos();
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    }) 
        }

        // Guardar Empleado
        $scope.GuardarEmpleado = function () {

            if ($scope.ValidarDatos()) {

                $scope.ObjetoEmpleado = [];
                $scope.ObjetoEmpleado.push($scope.Empleado);

                SPAService._registrarActualizarEmpleado(JSON.stringify($scope.ObjetoEmpleado))
                    .then(
                        function (result) {
                            if (result.data === true) {
                                toastr.success('Empleado registrado y/o actualizado correctamente', '', $scope.toastrOptions);
                                $scope.ConsultarEmpleados();
                                $scope.LimpiarDatos();
                                $('#txtCedula').focus();

                            }
                        }, function (err) {
                            toastr.remove();
                            if (err.data !== null && err.status === 500)
                                toastr.error(err.data, '', $scope.toastrOptions);
                        })
            }

        }

        // Consultar Empleados
        $scope.ConsultarEmpleados = function () {

            SPAService._consultarEmpleados($scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.Empleados = [];
                            $scope.Empleados = result.data;
                            $scope.EmpleadosGridOptions.api.setRowData($scope.Empleados);

                            $timeout(function () {
                                $scope.EmpleadosGridOptions.api.sizeColumnsToFit();
                            }, 200);

                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })

            $('#txtCedula').focus();

        }

        //Consultar Empleado
        $scope.ConsultarEmpleado = function (e, cedula_empleado) {

            $scope.Accion = '';

            $scope.Empleado.Id_Empleado = -1;
            $scope.Empleado.Nombres = '';
            $scope.Empleado.Apellidos = '';
            $scope.Empleado.Telefono_Fijo = '';
            $scope.Empleado.Telefono_Movil = '';
            $scope.Empleado.Direccion = '';
            $scope.Empleado.Id_Barrio = -1;
            $scope.Empleado.Id_Municipio = -1;
            $scope.Empleado.Fecha_Nacimiento = $filter('date')(new Date(), 'MM-dd-yyyy');
            $scope.Empleado.Id_TipoPago = -1;
            $scope.Empleado.Estado_Civil = '';
            $scope.Empleado.Monto = '';
            $scope.Empleado.Numero_Hijos;
            $scope.Empleado.Estado = $scope.EstadoSeleccionado;

            if (cedula_empleado !== null && cedula_empleado !== '') {

                SPAService._consultarEmpleado(cedula_empleado, $scope.IdEmpresa)
                    .then(
                        function (result) {

                            if (result.data !== undefined && result.data !== null) {

                                $scope.Accion = 'BUSQUEDA_EMPLEADO';

                                $scope.Empleado.Id_Empleado = result.data.id_Empleado;
                                $scope.Empleado.Cedula = result.data.cedula;
                                $scope.Empleado.Nombres = result.data.nombres;
                                $scope.Empleado.Apellidos = result.data.apellidos;
                                $scope.Empleado.Telefono_Fijo = result.data.telefono_Fijo;
                                $scope.Empleado.Telefono_Movil = result.data.telefono_Movil;
                                $scope.Empleado.Numero_Hijos = result.data.numero_Hijos;
                                $scope.Empleado.Direccion = result.data.direccion;
                                $scope.Empleado.Id_Barrio = result.data.id_Barrio;
                                $scope.Empleado.Id_Municipio = result.data.id_Municipio;
                                $scope.Empleado.Fecha_Nacimiento = $filter('date')(new Date(result.data.fecha_Nacimiento), 'MM/dd/yyyy');
                                $scope.Empleado.Id_TipoPago = result.data.id_TipoPago;
                                $scope.Empleado.Estado_Civil = result.data.estado_Civil;
                                $scope.Empleado.Estado = result.data.estado;
                                $scope.Empleado.Monto = result.data.monto;

                                $scope.EstadoCivilSeleccionado = $scope.Empleado.Estado_Civil;
                                $scope.MunicipioSeleccionado = $scope.Empleado.Id_Municipio;
                                $scope.TipoPagoSeleccionado = $scope.Empleado.Id_TipoPago;

                                $scope.ConsultarBarrios($scope.MunicipioSeleccionado);

                                $('#txtNombre').focus();
                                $scope.CedulaReadOnly = true;

                            }

                        }, function (err) {
                            toastr.remove();
                            if (err.data !== null && err.status === 500)
                                toastr.error(err.data, '', $scope.toastrOptions);
                        })

            }

        }

        // Consultar EmpleadoServicios
        $scope.ConsultarEmpleadoServicio = function () {

            SPAService._consultarEmpleadoServicio($scope.IdEmpleado)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.EmpleadoServicio = [];
                            $scope.EmpleadoServicio = result.data;
                            $scope.EmpleadoServicioGridOptions.api.setRowData($scope.EmpleadoServicio);

                            $scope.TempListadoServicios = [];
                            $scope.TempListadoServicios = $scope.Servicios.filter(function (s) {
                                return !$scope.EmpleadoServicio.some(function (es) {
                                    return s.id_Servicio === es.id_Servicio;
                                });
                            });

                            $scope.TempListadoServicios = $filter('orderBy')($scope.TempListadoServicios, 'nombre', false);
                            $timeout(function () {
                                $scope.EmpleadoServicioGridOptions.api.sizeColumnsToFit();
                            }, 200);

                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        //Consultar EmpleadoInsumos
        $scope.ConsultarEmpleadoInsumos = function () {

            SPAService._consultarEmpleadoInsumos($scope.IdEmpleado)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.EmpleadoInsumos = [];
                            $scope.EmpleadoInsumos = result.data;                            
                            $scope.EmpleadoInsumosGridOptions.api.setRowData($scope.EmpleadoInsumos);
                            
                            $timeout(function () {
                                $scope.EmpleadoInsumosGridOptions.api.sizeColumnsToFit();
                            }, 200);

                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })


        }

        // Consultar Barrios
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

                            if ($scope.Accion === 'BUSQUEDA_EMPLEADO') {

                                let filtrarBarrio = Enumerable.From($scope.Barrios)
                                    .Where(function (x) { return x.id_Barrio === $scope.Empleado.Id_Barrio })
                                    .ToArray();

                                if (filtrarBarrio.length > 0)
                                    $scope.BarrioSeleccionado = $scope.Empleado.Id_Barrio;
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

        // Consultar Municipios
        $scope.ConsultarMunicipios = function () {

            SPAService._consultarMunicipios()
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {

                            $scope.Municipios = [];
                            $scope.Municipios = result.data;
                            $scope.Municipios.push({ id_Municipio: -1, nombre: '[Seleccione]' });
                            $scope.Municipios = $filter('orderBy')($scope.Municipios, 'nombre', false);
                            $scope.Municipios = $filter('orderBy')($scope.Municipios, 'id_Municipio', false);

                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })

        }

        // Consultar Tipo Pagos
        $scope.ConsultarTipoPagos = function () {

            SPAService._consultarTipoPagos()
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.TipoPagos = [];
                            $scope.TipoPagos = result.data;
                            $scope.TipoPagos.push({ id_TipoPago: '00000000-000-000-000000000000', descripcion: '[Seleccione]', criterio: '' });
                            $scope.TipoPagos = $filter('orderBy')($scope.TipoPagos, 'descripcion', false);

                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })

        }

        //Consultar Tipo Servicios
        $scope.ConsultarTipoServicios = function () {

            SPAService._consultarTipoServicios()
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {

                            $scope.TipoServicios = [];
                            $scope.TipoServicios = result.data;
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        // Consultar Servicios
        $scope.ConsultarServicios = function () {

            SPAService._consultarServicios($scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.Servicios = [];
                            $scope.Servicios = result.data;
                            $scope.Servicios = $filter('orderBy')($scope.Servicios, 'id_Servicio', false);
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        //Consultar Tipo Transacciones
        $scope.ConsultarTipoTransacciones = function () {

            SPAService._consultarTipoTransacciones()
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {

                            $scope.TipoTransacciones = [];
                            $scope.TipoTransacciones = result.data;
                            $scope.TipoTransacciones.push({ id_TipoTransaccion: -1, nombre: '[Seleccione]', descripcion: '' });
                            $scope.TipoTransacciones = $filter('orderBy')($scope.TipoTransacciones, 'nombre', false);

                            let filtrarEntrada = Enumerable.From($scope.TipoTransacciones)
                                .Where(function (x) { return x.nombre === "INSUMO" })
                                .ToArray();

                            if (filtrarEntrada.length > 0)
                                $scope.TipoTransaccionSeleccionada = filtrarEntrada[0].id_TipoTransaccion;


                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })

        }

        //Consultar Productos
        $scope.ConsultarProductos = function () {

            SPAService._consultarProductos($scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {

                            $scope.Productos = [];
                            $scope.Productos = result.data; 

                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        // Limpiar Datos
        $scope.LimpiarDatos = function () {

            $scope.CedulaReadOnly = false;
            $scope.EstadoSeleccionado = 'ACTIVO';

            $scope.Empleado =
            {
                Id_Empleado: -1,
                Cedula: '',
                Nombres: '',
                Apellidos: '',
                Telefono_Fijo: '',
                Telefono_Movil: '',
                Estado_Civil: $scope.EstadoCivilSeleccionado, Direccion: '',
                Id_Municipio: -1,
                Id_Barrio: -1,
                Fecha_Nacimiento: $filter('date')(new Date(), 'MM-dd-yyyy'),
                Numero_Hijos: '',
                Id_TipoPago: $scope.TipoPagoSeleccionado,
                Monto: '',
                Estado: $scope.EstadoSeleccionado,
                Id_Empresa: $scope.IdEmpresa
            }

            $scope.MunicipioSeleccionado = -1;
            $scope.BarrioSeleccionado = -1;
            $scope.TipoPagoSeleccionado = '00000000-000-000-000000000000';
            $scope.EstadoCivilSeleccionado = 'SOLTERA';
            $('#txtCedula').focus();
            $scope.CedulaReadOnly = false;

        }


        // FUNCIONES
        //Consultar Inventario Producto
        $scope.ConsultarInventario = function (inventario) {            
            $scope.InventarioProducto = [];
            let filtrarEntrada = Enumerable.From($scope.Productos)
                .Where(function (x) { return x.id_Producto === inventario })
                .ToArray();
            $scope.InventarioProducto = filtrarEntrada[0].inventario;
            $scope.$broadcast('productChanged');
        }

        //Foco Monto
        $scope.FocoMonto = function () {
            $scope.$broadcast('selectChanged');
        }

        //Asignar Remover Elementos Lista Servicios
        $scope.AsignarRemover = function (ServiciosSeleccionados) {

            if (ServiciosSeleccionados.length > 0)
                $scope.ServiciosAsignados = ServiciosSeleccionados;
            else
                $scope.ServiciosAsignados.splice($scope.ServiciosAsignados.indexOf(ServiciosSeleccionados), 1);

        }

        // Validar Datos
        $scope.ValidarDatos = function () {

            $scope.Empleado.Id_Barrio = $scope.BarrioSeleccionado
            $scope.Empleado.Id_TipoPago = $scope.TipoPagoSeleccionado;
            $scope.Empleado.Estado = $scope.EstadoSeleccionado;
            $scope.Empleado.Estado_Civil = $scope.EstadoCivilSeleccionado;

            if ($scope.Empleado.Cedula === '') {
                toastr.info('Identificación del empleado es requerida', '', $scope.toastrOptions);
                $('#txtCedula').focus();
                return false;
            }

            if ($scope.Empleado.Nombres === '') {
                toastr.info('Nombre del empleado es requerido', '', $scope.toastrOptions);
                $('#txtNombre').focus();
                return false;
            }

            if ($scope.Empleado.Apellidos === '') {
                toastr.info('Apellido del empleado es requerido', '', $scope.toastrOptions);
                $('#txtApellido').focus();
                return false;
            }

            if ($scope.Empleado.Direccion === '') {
                toastr.info('Dirreción del empleado es requerida', '', $scope.toastrOptions);
                $('#txtDireccion').focus();
                return false;
            }

            if ($scope.Empleado.Telefono_Fijo === '') {
                toastr.info('Número fijo del empleado es requerido', '', $scope.toastrOptions);
                $('#txtFijo').focus();
                return false;
            }

            if ($scope.Empleado.Telefono_Movil === '') {
                toastr.info('Celular del empleado es requerido', '', $scope.toastrOptions);
                $('#txtMovil').focus();
                return false;
            }

            if ($scope.Empleado.Numero_Hijos === '') {
                toastr.info('Número de hijos del empleado es requerido', '', $scope.toastrOptions);
                $('#txtHijos').focus();
                return false;
            }

            if ($scope.Empleado.Numero_Hijos < 0) {
                toastr.info('Número de hijos no puede ser menor que cero', '', $scope.toastrOptions);
                $('#txtHijos').focus();
                return false;
            }

            if (new Date($scope.Empleado.Fecha_Nacimiento) > $filter('date')(new Date(), 'MM/dd/yyyy')) {
                toastr.info('La fecha de nacimiento debe ser menor que la fecha actual', '', $scope.toastrOptions);
                $('#dpFechaNacimiento').focus();
                return false;
            }

            if ($scope.Empleado.Id_Barrio === -1) {
                toastr.info('Debe seleccionar un barrio', '', $scope.toastrOptions);
                $('#slBarrio').focus();
                return false;
            }

            if ($scope.Empleado.Id_TipoPago === '00000000-000-000-000000000000') {
                toastr.info('Debe seleccionar un tipo de pago', '', $scope.toastrOptions);
                $('#slTipoPago').focus();
                return false;
            }

            let filtrarCriterio = Enumerable.From($scope.TipoPagos)
                .Where(function (x) { return x.id_TipoPago === $scope.Empleado.Id_TipoPago })
                .ToArray();

            if (filtrarCriterio.length > 0) {

                if (filtrarCriterio[0].criterio === 'PAGO_PORCENTUAL') {

                    if ($scope.Empleado.Monto === '') {
                        toastr.info('Monto del empleado es requerido', '', $scope.toastrOptions);
                        $('#txtMonto').focus();
                        return false;
                    }

                    if ($scope.Empleado.Monto > 1) {
                        toastr.info('El monto no puede ser mayor a "1" si el tipo de pago es "POR SERVICIOS"', '', $scope.toastrOptions);
                        $('#txtMonto').focus();
                        return false;
                    }

                }

            }

            if ($scope.Empleado.Monto === '') {
                toastr.info('Monto del empleado es requerido', '', $scope.toastrOptions);
                $('#txtMonto').focus();
                return false;
            }

            return true;

        }

        // Filtros Barrios
        $scope.FiltrarBarrios = function (id_Municipio) {
            $scope.ConsultarBarrios(id_Municipio);
        }

        //Show Comfirm Desasignar Servicios
        $scope.showConfirmServicio = function (ev, data) {

            let confirm = $mdDialog.confirm()
                .title('Desasignar Servicio')
                .textContent('¿Seguro que deseas desasignar el servicio ' + data.servicio + ' ?')
                .ariaLabel('Desasignar Servicio')
                .targetEvent(ev, data)
                .ok('Sí')
                .cancel('No')
                .multiple(true);

            $mdDialog.show(confirm).then(function () {

                $scope.DesasignarEmpleadoServicio(data);

            }, function () {
                return;
            });

        };

        //Modal Asignar Servicio
        $scope.ModalAsignarServicios = function () {
            $scope.AccionEmpleado = 'Asignar Servicios';            
            $mdDialog.show({
                contentElement: '#dlgAsignarServicios',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true,
            })
                .then(function () {
                }, function () {
                    $scope.ServiciosSeleccionados = [];
                    $scope.ServiciosAsignados = [];

                });
        }

        $scope.AsignarServicios = function (data) {

            $scope.IdEmpleado = data.id_Empleado;
            $scope.NombreEmpleado = data.nombres + ' ' + data.apellidos;
            $scope.ConsultarEmpleadoServicio();
            $scope.ModalAsignarServicios();

        }

        //Show Comfirm Eliminar Insumo
        $scope.showConfirmInsumo = function (ev, data) {

            let confirm = $mdDialog.confirm()
                .title('Eliminar Insumo')
                .textContent('¿Seguro que deseas eliminar el insumo ' + data.nombre_Producto + ' ?')
                .ariaLabel('Eliminar Insumo')
                .targetEvent(ev, data)
                .ok('Sí')
                .cancel('No')
                .multiple(true);

            $mdDialog.show(confirm).then(function () {

                $scope.EliminarEmpleadoInsumo(data);

            }, function () {
                return;
            });

        };

        // Modal Asignar Insumos
        $scope.ModalAsignarInsumos = function () {

            $scope.AccionEmpleado = 'Asignar Insumos';

            $mdDialog.show({
                contentElement: '#dlgAsignarInsumos',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true
            })
                .then(function () {
                }, function () {
                        $scope.ProductoSeleccionado = -1;
                        $scope.CantidadInsumo = '';
                        $scope.InventarioProducto = [];
                });
        }

        $scope.AsignarInsumos = function (data) {
            $scope.IdEmpleado = data.id_Empleado;
            $scope.NombreEmpleado = data.nombres + ' ' + data.apellidos;
            $scope.ConsultarEmpleadoInsumos();
            $scope.ModalAsignarInsumos();
        }

        //SelectedRow
        function OnRowClicked(event) {

            $scope.LimpiarDatos();

            $scope.Accion = 'BUSQUEDA_EMPLEADO';

            if (event.node.data !== undefined && event.node.data !== null) {

                $scope.Empleado.Id_Empleado = event.node.data.id_Empleado;
                $scope.Empleado.Cedula = event.node.data.cedula;
                $scope.Empleado.Nombres = event.node.data.nombres;
                $scope.Empleado.Apellidos = event.node.data.apellidos;
                $scope.Empleado.Telefono_Fijo = event.node.data.telefono_Fijo;
                $scope.Empleado.Telefono_Movil = event.node.data.telefono_Movil;
                $scope.Empleado.Monto = event.node.data.monto;
                $scope.Empleado.Numero_Hijos = event.node.data.numero_Hijos;
                $scope.Empleado.Direccion = event.node.data.direccion;
                $scope.Empleado.Id_Municipio = event.node.data.id_Municipio;
                $scope.Empleado.Id_Barrio = event.node.data.id_Barrio;
                $scope.Empleado.Fecha_Nacimiento = $filter('date')(new Date(event.node.data.fecha_Nacimiento), 'MM/dd/yyyy');
                $scope.Empleado.Id_TipoPago = event.node.data.id_TipoPago;
                $scope.TipoPagoSeleccionado = event.node.data.id_TipoPago;
                $scope.Empleado.Estado = event.node.data.estado;

                $scope.EstadoCivilSeleccionado = event.node.data.estado_Civil;
                $scope.MunicipioSeleccionado = $scope.Empleado.Id_Municipio;
                $scope.BarrioSeleccionado = $scope.Empleado.Id_Barrio;
                $scope.EstadoSeleccionado = $scope.Empleado.Estado;
                $scope.ConsultarBarrios($scope.MunicipioSeleccionado);

                $scope.CedulaReadOnly = true;
                $('#txtNombre').focus();

            }

        }

        //Change Row Color
        function ChangeRowColor(params) {
            if (params.data.estado === 'INACTIVO') {
                return { 'background-color': '#ecf0e0', 'color': '#999999', 'font-weight': '300' };
            }
        }

        //API GRID EMPLEADOS OPTIONS
        $scope.EmpleadosGridOptionsColumns = [

            {
                headerName: "", field: "Checked", suppressFilter: true, width: 30, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
            },
            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 25, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='AsignarServicios(data)' data-toggle='tooltip' title='Asignar Servicios' class='material-icons' style='font-size:20px;margin-top:-1px;color:#646769;'>settings</i>";
                },
            },
            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 25, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='AsignarInsumos(data)' data-toggle='tooltip' title='Asignar Insumos' class='material-icons' style='font-size:20px;margin-top:-1px;color:#646769;'>add_to_photos</i>";
                },
            },
            {
                headerName: "Cédula", field: 'cedula', width: 110, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
            },
            {
                headerName: "Nombres(s)", field: 'nombres', width: 140, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Apellido(s)", field: 'apellidos', width: 155, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Celular", field: 'telefono_Movil', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#212121', 'background': 'RGBA(210,216,230,0.75)', 'font-weight': 'bold', 'border-bottom': '1px dashed #212121', 'border-right': '1px dashed #212121', 'border-left': '1px dashed #212121' },
            },
            {
                headerName: "Dirección", field: 'direccion', width: 240, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Barrio", field: 'barrio', width: 175, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Registro", field: 'fecha_Registro', hide: true, width: 120, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, cellRenderer: (data) => {
                    return data.value ? $filter('date')(new Date(data.value), 'MM/dd/yyyy') : '';
                },
            }

        ];

        $scope.EmpleadosGridOptions = {

            defaultColDef: {
                resizable: true
            },
            columnDefs: $scope.EmpleadosGridOptionsColumns,
            rowData: [],
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            angularCompileRows: true,
            onGridReady: function (params) {
            },
            fullWidthCellRenderer: true,
            animateRows: true,
            suppressRowClickSelection: true,
            rowSelection: 'multiple',
            onRowClicked: OnRowClicked,
            getRowStyle: ChangeRowColor

        }


        //API GRID ASIGNAR SERVICIOS OPTIONS
        $scope.EmpleadoServicioGridOptionsColumns = [

            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 20, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='showConfirmServicio($event, data)' data-toggle='tooltip' title='Desasignar Servicio' class='material-icons' style='font-size:20px;margin-top:-1px;color:#646769;'>delete_sweep</i>";
                },
            },
            {
                headerName: "Servicio", field: 'servicio', width: 110, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
            },
            {
                headerName: "Tipo", field: 'tipoServicio', width: 140, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }, suppressSizeToFit: true
            }
        ];

        $scope.EmpleadoServicioGridOptions = {

            defaultColDef: {
                resizable: true
            },
            columnDefs: $scope.EmpleadoServicioGridOptionsColumns,
            rowData: [],
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            angularCompileRows: true,
            onGridReady: function (params) {
            },
            fullWidthCellRenderer: true,
            animateRows: true,
            suppressRowClickSelection: true,
            rowSelection: 'multiple'
        }

        //API GRID ASIGNAR INSUMOS OPTIONS
        $scope.EmpleadoInsumosGridOptionsColumns = [

            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 20, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='showConfirmInsumo($event,data)' data-toggle='tooltip' title='Eliminar Insumo' class='material-icons' style='font-size:20px;margin-top:-1px;color:#646769;'>delete_sweep</i>";
                },
            },
            {
                headerName: "Producto", field: 'nombre_Producto', width: 110, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Cantidad", field: 'cantidad', width: 140, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, suppressSizeToFit: true
            },
            {
                headerName: "Fecha", field: 'fecha', width: 140, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }, cellRenderer: (data) => {
                    return data.value ? $filter('date')(new Date(data.value), 'MM/dd/yyyy HH:mm:ss') : '';
                }
            }
        ];

        $scope.EmpleadoInsumosGridOptions = {

            defaultColDef: {
                resizable: true
            },
            columnDefs: $scope.EmpleadoInsumosGridOptionsColumns,
            rowData: [],
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            angularCompileRows: true,
            onGridReady: function (params) {
            },
            fullWidthCellRenderer: true,
            animateRows: true,
            suppressRowClickSelection: true,
            rowSelection: 'multiple'
        }


        //Eventos
        $scope.Cancelar = function () {
            $mdDialog.cancel();
            $('#txtBuscarServicio').focus();
        };

        window.onresize = function () {

            $timeout(function () {
                $scope.EmpleadosGridOptions.api.sizeColumnsToFit();
            }, 200);

        }

        //INVOCACIÓN FUNCIONES
        $scope.ConsultarServicios();
        $scope.ConsultarTipoServicios();
        $scope.ConsultarEmpleados();
        $scope.ConsultarMunicipios();
        $scope.ConsultarTipoPagos();
        $scope.ConsultarProductos();
        $scope.ConsultarTipoTransacciones();
        $scope.Inicializacion();

    }

    function ProductosController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {

        // VARIABLES
        $scope.TipoTransacciones = [];
        $scope.ObjetoProducto = [];
        $scope.Productos = [];
        $scope.AccionProducto = 'Registrar Producto';
        $scope.TipoTransaccionSeleccionada = -1;
        $scope.TipoTransaccionReadOnly = true;
        $scope.ProductoTransacciones = [];
        $scope.DescripcionProductoTransacciones = '';

        // INICIALIZACIÓN
        $scope.Inicializacion = function () {

            $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();

            $('#txtBuscarProducto').focus();

        }

        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.IdUsuario = parseInt($rootScope.userData.userId);

        $scope.Producto =
        {
            Id_Producto: -1,
            Nombre: '',
            Descripcion: '',
            Precio: 0.00,
            Inventario: 0,
            Cantidad_Transaccion: 0,
            Fecha_Registro: $filter('date')(new Date(), 'MM-dd-yyyy'),
            Fecha_Modificacion: $filter('date')(new Date(), 'MM-dd-yyyy'),
            Id_Empresa: $scope.IdEmpresa,
            Id_Tipo_Transaccion: $scope.TipoTransaccionSeleccionada
        }

        // INVOCACIONES API
        $scope.ConsultarTipoTransacciones = function () {

            SPAService._consultarTipoTransacciones()
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {

                            $scope.TipoTransacciones = [];
                            $scope.TipoTransacciones = result.data;
                            $scope.TipoTransacciones.push({ id_TipoTransaccion: -1, nombre: '[Seleccione]', descripcion: '' });
                            $scope.TipoTransacciones = $filter('orderBy')($scope.TipoTransacciones, 'nombre', false);

                            let filtrarEntrada = Enumerable.From($scope.TipoTransacciones)
                                .Where(function (x) { return x.nombre === "ENTRADA" })
                                .ToArray();

                            if (filtrarEntrada.length > 0)
                                $scope.TipoTransaccionSeleccionada = filtrarEntrada[0].id_TipoTransaccion;


                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })

        }

        $scope.ConsultarProductos = function () {

            SPAService._consultarProductos($scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {

                            $scope.Productos = [];
                            $scope.Productos = result.data;
                            $scope.ProductosGridOptions.api.setRowData($scope.Productos);

                            $timeout(function () {
                                $scope.ProductosGridOptions.api.sizeColumnsToFit();
                            }, 200);

                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })

        }

        $scope.GuardarProducto = function () {

            if ($scope.ValidarDatos()) {

                $scope.ObjetoProducto = [];
                $scope.ObjetoProducto.push($scope.Producto);

                SPAService._guardarProducto(JSON.stringify($scope.ObjetoProducto))
                    .then(
                        function (result) {
                            if (result.data === true) {

                                toastr.success('Producto registrado/actualizado correctamente', '', $scope.toastrOptions);
                                $scope.ConsultarProductos();

                                if ($scope.AccionProducto === 'Editar Producto')
                                    $scope.Cancelar();

                                $scope.LimpiarDatos();

                            }
                        }, function (err) {
                            toastr.remove();
                            if (err.data !== null && err.status === 500)
                                toastr.error(err.data, '', $scope.toastrOptions);
                        })

            }
        }

        // Consultar Producto
        $scope.ConsultarProducto = function (data) {

            if (data.id_Producto !== undefined && data.id_Producto !== null) {

                $scope.Producto.Id_Producto = data.id_Producto;
                $scope.Producto.Nombre = data.nombre;
                $scope.Producto.Descripcion = data.descripcion;
                $scope.Producto.Precio = data.precio;
                $scope.Producto.Inventario = data.inventario;
                $scope.Producto.Id_Tipo_Transaccion = $scope.TipoTransaccionSeleccionada;

                $scope.ModalEditarProducto();
                $scope.NombreProductoReadOnly = true;

            }

        }

        $scope.ConsultarProductoNombre = function (e, nombre) {

            var row = $scope.ProductosGridOptions.api.getRowNode(nombre);
            if (row === undefined) return;

            if (row.data.nombre !== undefined && row.data.nombre !== null) {

                $scope.AccionProducto = 'Editar Producto';
                $scope.Producto.Id_Producto = row.data.id_Producto;
                $scope.Producto.Nombre = row.data.nombre;
                $scope.Producto.Descripcion = row.data.descripcion;
                $scope.Producto.Precio = row.data.precio;
                $scope.Producto.Inventario = row.data.inventario;
                $scope.Producto.Id_Tipo_Transaccion = $scope.TipoTransaccionSeleccionada;

                $scope.NombreProductoReadOnly = true;
                $scope.OcultarbtnNuevo = true;

            }

        }

        $scope.ConsultarProductoTransacciones = function (data) {

            $scope.ProductoTransacciones = [];
            $scope.DescripcionProductoTransacciones = '';

            SPAService._consultarProductoTransacciones(data.id_Producto, $scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {

                            $scope.ProductoTransacciones = result.data;
                            $scope.ProductoTransaccionesGridOptions.api.setRowData($scope.ProductoTransacciones);

                            $timeout(function () {
                                $scope.ProductoTransaccionesGridOptions.api.sizeColumnsToFit();
                            }, 200);

                            $scope.DescripcionProductoTransacciones = 'Transacciones del producto: ' + data.nombre;

                            $mdDialog.show({
                                contentElement: '#dlgProductoTransacciones',
                                parent: angular.element(document.body),
                                targetEvent: event,
                                clickOutsideToClose: true
                            })
                                .then(function () {
                                }, function () {
                                    $('#txtBuscarProducto').focus();
                                });


                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })

        }

        $scope.LimpiarDatos = function () {

            $scope.AccionProducto = 'Registrar Producto';

            $scope.Producto =
            {
                Id_Producto: -1,
                Nombre: '',
                Descripcion: '',
                Precio: 0.00,
                Inventario: 0,
                Cantidad_Transaccion: 0,
                Fecha_Registro: $filter('date')(new Date(), 'MM-dd-yyyy'),
                Fecha_Modificacion: $filter('date')(new Date(), 'MM-dd-yyyy'),
                Id_Empresa: $scope.IdEmpresa,
                Id_Tipo_Transaccion: $scope.TipoTransaccionSeleccionada

            }

            $scope.NombreProductoReadOnly = false;
            $('#txtNombreProducto').focus();

        }

        // Validaciones Productos
        $scope.ValidarDatos = function () {

            $scope.Producto.Id_Tipo_Transaccion = $scope.TipoTransaccionSeleccionada;

            if ($scope.Producto.Nombre === '') {
                toastr.info('Nombre del producto es requerido', '', $scope.toastrOptions);
                $('#txtNombreProducto').focus();
                return false;
            }

            if ($scope.Producto.Descripcion === '') {
                toastr.info('Descripción del producto es requerida', '', $scope.toastrOptions);
                $('#txtDescripcionProducto').focus();
                return false;
            }

            if ($scope.Producto.Precio === 0.00) {
                toastr.info('Precio del producto es requerido', '', $scope.toastrOptions);
                $('#txtValorProducto').focus();
                return false;
            }

            if ($scope.Producto.Id_Tipo_Transaccion === -1) {
                toastr.info('Tipo transacción es requerido', '', $scope.toastrOptions);
                $('#txtValorServicio').focus();
                return false;
            }

            return true;

        }

        $scope.ModalNuevoProducto = function () {

            $scope.AccionProducto = 'Registrar Producto';

            $mdDialog.show({
                contentElement: '#dlgNuevoProducto',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true
            })
                .then(function () {
                }, function () {
                    $('#txtBuscarProducto').focus();
                });

            $scope.LimpiarDatos();
            $scope.OcultarbtnNuevo = false;

        }

        $scope.ModalEditarProducto = function () {

            $scope.AccionProducto = 'Editar Producto';

            $mdDialog.show({
                contentElement: '#dlgNuevoProducto',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true
            })
                .then(function () {
                }, function () {
                    $('#txtBuscarProducto').focus();
                });

            $scope.NombreProductoReadOnly = true
            $scope.OcultarbtnNuevo = true;

        }

        // Agr-grid Options
        $scope.ProductosGridOptionsColumns = [

            {
                headerName: "", field: "Checked", suppressFilter: true, width: 25, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
            },
            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 25, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='ConsultarProducto(data)' data-toggle='tooltip' title='Editar producto' class='material-icons' style='font-size:20px;margin-top:-1px;color:#646769;'>create</i>";
                },
            },
            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 25, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='ConsultarProductoTransacciones(data)' data-toggle='tooltip' title='Transacciones' class='material-icons' style='font-size:20px;margin-top:-1px;color:#646769;'>list</i>";
                },
            },
            {
                headerName: "Nombre", field: 'nombre', width: 100, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Descripcion", field: 'descripcion', width: 200, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }, cellRenderer: function (params) {
                    return "<span  data-toggle='tooltip' data-placement='left' title='{{data.descripcion}}'>{{data.descripcion}}</span>"
                },
            },
            {
                headerName: "Precio", field: 'precio', width: 60, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#212121', 'background': 'RGBA(210,216,230,0.75)', 'font-weight': 'bold', 'border-bottom': '1px dashed #212121', 'border-right': '1px dashed #212121', 'border-left': '1px dashed #212121' }, valueFormatter: currencyFormatter
            },
            {
                headerName: "Inventario", field: 'inventario', width: 100, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
            }

        ];

        $scope.ProductosGridOptions = {

            defaultColDef: {
                resizable: true
            },
            columnDefs: $scope.ProductosGridOptionsColumns,
            rowData: [],
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            angularCompileRows: true,
            onGridReady: function (params) {
            },
            fullWidthCellRenderer: true,
            animateRows: true,
            suppressRowClickSelection: true,
            rowSelection: 'multiple',
            getRowStyle: ChangeRowColor

        }

        $scope.ProductoTransaccionesGridOptionsColumns = [

            {
                headerName: "Nombre", field: 'nombre_Producto', width: 120, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Tipo", field: 'nombre_Tipo_Transaccion', width: 80, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Cantidad", field: 'cantidad', width: 80, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, cellRenderer: (params) => {
                    if (params.data.nombre_Tipo_Transaccion !== "ENTRADA")
                        return (params.data.cantidad * - 1);
                    else
                        return params.data.cantidad;
                }
            },
            {
                headerName: "Fecha", field: 'fecha', width: 110, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, cellRenderer: (params) => {
                    return params.value ? $filter('date')(new Date(params.value), 'MM/dd/yyyy HH:mm:ss') : '';
                }
            },

        ];

        $scope.ProductoTransaccionesGridOptions = {

            defaultColDef: {
                resizable: true
            },
            columnDefs: $scope.ProductoTransaccionesGridOptionsColumns,
            rowData: [],
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            angularCompileRows: true,
            onGridReady: function (params) {
            },
            fullWidthCellRenderer: true,
            animateRows: true,
            suppressRowClickSelection: true,
            rowSelection: 'multiple'

        }

        function ChangeRowColor(params) {

            if (params.data.inventario === 0) {
                return { 'background-color': '#ecf0e0', 'color': '#999999', 'font-weight': '300' };
            }

        }

        $scope.ProductosGridOptions.getRowNodeId = function (data) {

            return data.nombre;

        };

        $scope.onFilterTextBoxChanged = function () {

            $scope.ProductosGridOptions.api.setQuickFilter($('#txtBuscarProducto').val());

        }

        // Formatos
        function currencyFormatter(params) {

            let valueGrid = params.value;
            return $filter('currency')(valueGrid, '$', 0);

        }

        // Eventos
        window.onresize = function () {

            $timeout(function () {
                $scope.ProductosGridOptions.api.sizeColumnsToFit();
            }, 200);

            $timeout(function () {
                $scope.ProductoTransaccionesGridOptions.api.sizeColumnsToFit();
            }, 200);

        }

        $scope.Cancelar = function () {

            $mdDialog.cancel();
            $('#txtBuscarProducto').focus();

        };

        // Invocación Funciones
        $scope.ConsultarTipoTransacciones();
        $scope.ConsultarProductos();
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