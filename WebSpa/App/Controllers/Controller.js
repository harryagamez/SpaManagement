(function () {
    agGrid.initialiseAgGridWithAngular1(angular);

    angular.module('app.controllers', [])
        .controller("LoginController", LoginController)
        .controller("HomeController", HomeController)
        .controller("ClientesController", ClientesController)
        .controller("ServiciosController", ServiciosController)
        .controller("EmpleadosController", EmpleadosController)
        .controller("ProductosController", ProductosController)
        .controller("GastosController", GastosController)
        .controller("GestionController", GestionController)
        .controller("AgendaController", AgendaController)

    LoginController.$inject = ['$scope', '$state', '$location', '$mdDialog', '$rootScope', '$timeout', 'AuthService'];
    HomeController.$inject = ['$scope', '$state', '$rootScope', '$element', '$location', 'localStorageService', 'AuthService', 'SPAService'];
    ClientesController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];
    ServiciosController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];
    EmpleadosController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];
    ProductosController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];
    GastosController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];
    GestionController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];
    AgendaController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

    function LoginController($scope, $state, $location, $mdDialog, $rootScope, $timeout, authService) {
        // Variables
        $scope.ValidarDatos = ValidarDatos;
        $scope.Login = Login;
        $scope.ValidarIntegracion = false;
        $scope.DatosUsuario = { Usuario: '', Clave: '', CodigoIntegracion: '' };

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

    function HomeController($scope, $state, $rootScope, $element, $location, localStorageService, authService, SPAService) {
        $scope.UserAvatar = '../../Images/default-perfil.png';

        if ($rootScope.Empresas !== undefined) {
            if ($rootScope.Empresas.length === 0) {
                $scope.Empresas = [];
                $scope.MultipleEmpresa = false;
                $scope.EmpresaSeleccionada = '00000000-0000-0000-0000-000000000000';
            } else {
                $scope.Empresas = [];
                $scope.Empresas = $rootScope.Empresas;

                if ($scope.Empresas.length > 1) {
                    $scope.EmpresaSeleccionada = $rootScope.Empresas[0].id_Empresa;
                    $rootScope.Id_Empresa = $scope.EmpresaSeleccionada;
                    $scope.MultipleEmpresa = true;
                } else if ($scope.Empresas.length === 1 && $rootScope.Id_Empresa === '00000000-0000-0000-0000-000000000000') {
                    $scope.EmpresaSeleccionada = $rootScope.Empresas[0].id_Empresa;
                    $rootScope.Nombre_Empresa = $rootScope.Empresas[0].nombre;
                    $rootScope.Id_Empresa = $scope.EmpresaSeleccionada;
                    $scope.MultipleEmpresa = false
                } else $scope.MultipleEmpresa = false;
            }
        }

        $scope.Logout = function () {
            authService.logOut();
        }

        $scope.UsuarioSistema = $rootScope.userData.userName;
        $scope.NombreEmpresa = $rootScope.Nombre_Empresa;
        $scope.UserId = $rootScope.userData.userId;
        $scope.$on('successfull.menuload', function () {
            if ($scope.Menu.length == 0)
                $scope.Menu = $rootScope.Menu;
        });

        $scope.$on('successfull.useravatarload', function () {
            if ($rootScope.UserAvatar !== null && $rootScope.UserAvatar !== undefined)
                $scope.UserAvatar = $rootScope.UserAvatar;
        });

        //$scope.$on('successfull.empresapropiedadesload', function () {
        //    $rootScope.EmpresaPropiedades = $rootScope.sEmpresaPropiedades;
        //});

        if ($rootScope.UserAvatar !== null && $rootScope.UserAvatar !== undefined)
            $scope.UserAvatar = $rootScope.UserAvatar;

        $scope.$on('successfull.companiesLoaded', function () {
            $scope.Empresas = [];
            if ($scope.Empresas.length == 0)
                $scope.Empresas = $rootScope.Empresas;

            if ($scope.Empresas.length > 1) {
                $scope.EmpresaSeleccionada = $scope.Empresas[0].id_Empresa;
                $rootScope.Id_Empresa = $scope.EmpresaSeleccionada;
                $scope.MultipleEmpresa = true;
            } else if ($scope.Empresas.length === 1 && $rootScope.Id_Empresa === '00000000-0000-0000-0000-000000000000') {
                $scope.EmpresaSeleccionada = $rootScope.Empresas[0].id_Empresa;
                $rootScope.Nombre_Empresa = $rootScope.Empresas[0].nombre;
                $rootScope.Id_Empresa = $scope.EmpresaSeleccionada;
                $scope.MultipleEmpresa = false
            } else $scope.MultipleEmpresa = false;

            $scope.NombreEmpresa = $rootScope.Nombre_Empresa;
        });

        $scope.FiltrarEmpresa = function (id_empresa) {
            $rootScope.Id_Empresa = id_empresa;
            $rootScope.$broadcast("CompanyChange");
        }

        $scope.$on('$viewContentLoaded', function () {
            $location.replace();
        });

        $scope.$on("$destroy", function () {
            $scope.Menu = [];
            $scope.Empresas = [];
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
        $scope.PermitirFiltrar = true;

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
            Fecha_Nacimiento: $filter('date')(new Date(), 'dd-MM-yyyy'),
            Id_Tipo: -1,
            Estado: $scope.EstadoSeleccionado,
            Id_Empresa: $scope.IdEmpresa,
            Id_Usuario_Creacion: $scope.IdUsuario
        }

        $scope.Barrios.push({ id_Barrio: -1, nombre: '[Seleccione]', id_Municipio: -1, codigo: "-1", id_Object: -1 });

        $scope.Inicializacion = function () {
            $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
            window.onresize();

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
                                $('#txtCedula').focus();
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
                                $scope.PermitirFiltrar = false;
                            }
                            else
                                $scope.PermitirFiltrar = false;
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
                            } else $scope.MunicipioSeleccionado = -1;

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

            if ($filter('date')(new Date($scope.Cliente.Fecha_Nacimiento), 'MM/dd/yyyy') > $filter('date')(new Date(), 'MM/dd/yyyy')) {
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
            $scope.PermitirFiltrar = true;
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

        //Filtrar por nombre
        $scope.onFilterTextBoxChanged = function () {
            if ($scope.PermitirFiltrar === true) {
                $scope.ClientesGridOptions.api.setQuickFilter($('#txtNombres').val());
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
                $scope.PermitirFiltrar = false;
            }
        }

        $scope.$on("CompanyChange", function () {
            $scope.IdEmpresa = $rootScope.Id_Empresa;
            $scope.LimpiarDatos();
            $scope.ConsultarClientes();
            $scope.Inicializacion();
        });

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
        $rootScope.ImagenesxAdjuntar = 0;

        // INICIALIZACIÓN
        $scope.Inicializacion = function () {
            $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
            window.onresize();

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
            Imagenes_Servicio: []
        }

        // INVOCACIONES API

        //Guardar Servicio
        $scope.GuardarServicio = function () {
            if ($scope.ValidarDatos()) {
                $scope.Servicio.Imagenes_Servicio = $scope.Servicio.Imagenes_Servicio.concat($scope.TEMPServicio);

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

        //Consultar Tipo Servicios
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

        //Consultar Servicios
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
            $rootScope.ServicioImagenesAdjuntas = data.imagenes_Servicio;

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
                $scope.Servicio.Imagenes_Servicio = data.imagenes_Servicio;
                $scope.TipoServicioSeleccionado = data.id_TipoServicio;
                $scope.ModalEditarServicio();
                $scope.NombreServicioReadOnly = true;

                $scope.EstadoSeleccionado = $scope.Servicio.Estado;
            }
        }

        // Visualizar Imagen
        $scope.VisualizarImagen = function (data) {
            $rootScope.ServicioNombre = data.nombre;
            $rootScope.ServicioListaImagenes = [];
            $rootScope.ServicioListaImagenes = data.imagenes_Servicio;

            if ($rootScope.ServicioListaImagenes.length > 0)
                $scope.ModalSliderServicio();
            else
                $scope.showAlertSinImagenesAdjuntas();
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
            $scope.ImagenServicioBase64 = '';
            $rootScope.ImagenesAdjuntas = 0;
            $rootScope.InformacionImagen = '';
            $rootScope.ImagenesxAdjuntar = 0;
            $scope.TEMPServicio = [];

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
                Imagenes_Servicio: []
            }

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
            $rootScope.ImagenesAdjuntas = 0;
            $rootScope.ImagenesxAdjuntar = 0;
            $scope.Servicio.Imagenes_Servicio.length = 0;
            $mdDialog.show({
                contentElement: '#dlgNuevoServicio',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true
            })
                .then(function () {
                }, function () {
                    $('#txtBuscarServicio').focus();
                    $scope.LimpiarDatos();
                });

            $scope.LimpiarDatos();
            $scope.NombreServicioReadOnly = false;
            $scope.OcultarbtnNuevo = false;
        }

        // Modal Editar Servicio
        $scope.ModalEditarServicio = function () {
            $scope.AccionServicio = 'Editar Servicio';
            $rootScope.ImagenesAdjuntas = $scope.Servicio.Imagenes_Servicio.length;
            $rootScope.ImagenesxAdjuntar = 0;
            $mdDialog.show({
                contentElement: '#dlgNuevoServicio',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true
            })
                .then(function () {
                }, function () {
                    $scope.Servicio.Imagenes_Servicio = $scope.Servicio.Imagenes_Servicio.filter(function (item) {
                        return item.Id_Servicio !== -1;
                    }); //removemos las imágenes x adjuntar seleccionadas en caso de cancelar el modal
                    $('#txtBuscarServicio').focus();
                    $scope.LimpiarDatos();
                });

            $scope.NombreServicioReadOnly = true
            $scope.OcultarbtnNuevo = true;
        }

        //Modal Servicio Imagenes Slider
        $scope.ModalSliderServicio = function () {
            $mdDialog.show({
                controller: SliderController,
                templateUrl: 'Views/Templates/_slider.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen
            })
                .then(function () {
                }, function () {
                });
        };

        //Show Custom Imágenes Adjuntas
        $scope.showCustomImagenesAdjuntas = function (ev) {
            $mdDialog.show({
                controller: ImgAttachedController,
                templateUrl: 'Views/Templates/_imgattached.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen,
                multiple: true
            })
                .then(function () {
                }, function () {
                });
        };

        //Show Alert Sin Imágenes Adjuntas
        $scope.showAlertSinImagenesAdjuntas = function (ev) {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Imágenes Adjuntas')
                    .textContent('El servicio ' + $rootScope.ServicioNombre + ' no tiene imagenes adjuntas.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Aceptar')
                    .targetEvent(ev)
                    .multiple(true)
            );
        };

        //Show Comfirm Reemplazar Imágenes Servicios
        $scope.showReemplazarImagenesServicio = function (ev, data) {
            if ($rootScope.ImagenesAdjuntas >= 5) {
                toastr.info('El servicio ya tiene 5 imágenes adjuntas. Si desea subir más, debe borrar alguna imagen existente', '', $scope.toastrOptions);
                return;
            }

            if ($rootScope.ImagenesAdjuntas > 0 && $rootScope.ImagenesAdjuntas <= 5) {
                let confirm = $mdDialog.confirm()
                    .title('Sobreescribir Imágenes')
                    .textContent('Ya existen ' + $scope.Servicio.Imagenes_Servicio.length + ' imágenes adjuntas. ¿Desea agregar más?')
                    .ariaLabel('Sobreescribir Imágenes')
                    .targetEvent(ev, data)
                    .ok('Sí')
                    .cancel('No')
                    .multiple(true);

                $mdDialog.show(confirm).then(function () {
                    $scope.ProcesarImagen();
                }, function () {
                    return;
                });
            }
            else
                $scope.ProcesarImagen();
        };

        // Agr-grid Options
        $scope.ServiciosGridOptionsColumns = [

            {
                headerName: "", field: "Checked", suppressFilter: true, width: 25, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
            },
            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 25, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='ConsultarServicio(data)' data-toggle='tooltip' title='Editar servicio' class='material-icons' style='font-size:25px;margin-top:-1px;color:#f17325;'>create</i>";
                },
            },
            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 25, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='VisualizarImagen(data)' data-toggle='tooltip' title='Ver imagen' class='material-icons' style='font-size:25px;margin-top:-1px;color:#f17325;'>image</i>";
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
            $rootScope.InformacionImagen = '';

            if ($scope.Servicio.Imagenes_Servicio == null) { $scope.Servicio.Imagenes_Servicio = []; }

            let mayorDosMB = false;
            let files = event.target.files;

            if (files.length > 5) {
                toastr.info('Solo puede seleccionar un máximo de 5 imágenes', '', $scope.toastrOptions);
                files = [];
                return;
            }

            if (files.length + $scope.Servicio.Imagenes_Servicio.length > 5) {
                toastr.info('El servicio solo puede tener un máximo de 5 imágenes. Ya tiene ' + $scope.Servicio.Imagenes_Servicio.length + ' imágenes adjuntas', '', $scope.toastrOptions);
                files = [];
                return;
            }

            for (i = 0; i < files.length; i++) {
                let fileSize = (files[i].size / 1024 / 1024)
                if (fileSize > 2)
                    mayorDosMB = true;
            }

            if (mayorDosMB) {
                toastr.info('El tamaño de las imágenes debe ser de máximo 2MB', '', $scope.toastrOptions);
                files = [];
                return;
            }

            for (i = 0; i < files.length; i++) {
                let fileSize = (files[i].size / 1024 / 1024);
                $rootScope.InformacionImagen += 'Nombre: ' + files[i].name + ' - Tamaño: ' + fileSize.toFixed(3) + ' MB';
                $rootScope.ImagenesxAdjuntar = files.length;
                $scope.getBase64(files[i]);
            }
        }

        $scope.ProcesarImagen = function () {
            $('#ImagenServicio').trigger('click');
        }

        $scope.getBase64 = function (file) {
            $scope.TEMPServicio = [];
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                $scope.ImagenServicioBase64 = reader.result;
                $scope.TEMPServicio.push({
                    Id_Servicio: -1, Imagen_Base64: $scope.ImagenServicioBase64, TuvoCambios: true
                });
                $("#ImagenServicio").val('');
                $('#txtNombreServicio').focus();
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
                $("#ImagenServicio").val('');
            };
        }

        $scope.$on("CompanyChange", function () {
            $scope.IdEmpresa = $rootScope.Id_Empresa;
            $scope.LimpiarDatos();
            $scope.ConsultarServicios();
            $scope.Inicializacion();
        });

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
        $scope.InventarioProducto = 0;
        $scope.PermitirFiltrar = true;

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
            window.onresize();

            $('#txtCedula').focus();
        }

        // INVOCACIONES API
        //Asignar Insumos Empleado
        $scope.AsignarEmpleadoInsumo = function () {
            if ($scope.ProductoSeleccionado != -1) {
                if ($scope.CantidadInsumo > 0) {
                    if ($scope.CantidadInsumo <= $scope.InventarioProducto) {
                        $scope.InsumoAsignado = [];
                        $scope.Insumo =
                        {
                            Id_Transaccion: -1,
                            Id_Producto: $scope.ProductoSeleccionado,
                            Cantidad: $scope.CantidadInsumo,
                            Id_EmpleadoCliente: $scope.IdEmpleado,
                            Id_TipoTransaccion: $scope.TipoTransaccionSeleccionada,
                            Id_Empresa: $scope.IdEmpresa
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
                                        $scope.InventarioProducto = 0;
                                        $scope.ConsultarEmpleadoInsumos();
                                        $scope.ConsultarProductos();
                                    }
                                }, function (err) {
                                    toastr.remove();
                                    if (err.data !== null && err.status === 500)
                                        toastr.error(err.data, '', $scope.toastrOptions);
                                })
                    } else toastr.info('El cantidad del insumo a asignar no puede ser mayor a la cantidad existente en inventario', '', $scope.toastrOptions);
                } else toastr.info('La cantidad del insumo a asignar debe ser mayor a 0', '', $scope.toastrOptions);
            } else toastr.info('Debe seleccionar al menos 1 producto', '', $scope.toastrOptions);
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
            let Cantidad = data.cantidad;
            let IdProducto = data.id_Producto;

            SPAService._eliminarEmpleadoInsumo(IdTransaccion, Cantidad, IdProducto)
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Insumo ' + data.nombre_Producto + ' eliminado correctamente', '', $scope.toastrOptions);
                            $scope.InsumoAsignado = [];
                            $scope.ProductoSeleccionado = -1;
                            $scope.CantidadInsumo = '';
                            $scope.InventarioProducto = 0;
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
                                $scope.PermitirFiltrar = true;
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
                            $scope.PermitirFiltrar = true;
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
                                $scope.PermitirFiltrar = false;
                            }
                            else $scope.PermitirFiltrar = false;
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
                            } else $scope.MunicipioSeleccionado = -1;

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
                            $scope.Productos = $filter('orderBy')($scope.Productos, 'nombre', false);
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
            $scope.PermitirFiltrar = true;
        }

        // FUNCIONES
        //Consultar Inventario Producto
        $scope.ConsultarInventario = function (inventario) {
            $scope.InventarioProducto = 0;
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
                $('#txtNombres').focus();
                return false;
            }

            if ($scope.Empleado.Apellidos === '') {
                toastr.info('Apellido del empleado es requerido', '', $scope.toastrOptions);
                $('#txtApellido').focus();
                return false;
            }

            if ($scope.Empleado.Direccion === '') {
                toastr.info('Dirección del empleado es requerida', '', $scope.toastrOptions);
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

            if (parseInt($filter('date')(new Date($scope.Empleado.Fecha_Nacimiento), 'yyyyMMdd')) > parseInt($filter('date')(new Date(), 'yyyyMMdd'))) {
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
                    $scope.InventarioProducto = 0;
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

                $scope.PermitirFiltrar = false;
                $scope.CedulaReadOnly = true;
                $('#txtNombre').focus();
            }
        }

        //Filtrar por nombre
        $scope.onFilterTextBoxChanged = function () {
            if ($scope.PermitirFiltrar === true) {
                $scope.EmpleadosGridOptions.api.setQuickFilter($('#txtNombres').val());
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
                headerName: "", field: "", colId: 'AsignarServicios', suppressMenu: true, visible: true, width: 25, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='AsignarServicios(data)' data-toggle='tooltip' title='Asignar Servicios' class='material-icons' style='font-size:25px;margin-top:-1px;color:#f17325;'>settings</i>";
                },
            },
            {
                headerName: "", field: "", colId: 'AsignarInsumos', suppressMenu: true, visible: true, width: 25, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='AsignarInsumos(data)' data-toggle='tooltip' title='Asignar Insumos' class='material-icons' style='font-size:25px;margin-top:-1px;color:#f17325;'>add_to_photos</i>";
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
            getRowStyle: ChangeRowColor,
            suppressRowClickSelection: true
        }

        //API GRID ASIGNAR SERVICIOS OPTIONS
        $scope.EmpleadoServicioGridOptionsColumns = [

            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 20, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='showConfirmServicio($event, data)' data-toggle='tooltip' title='Desasignar Servicio' class='material-icons' style='font-size:25px;margin-top:-1px;color:#f17325;'>delete_sweep</i>";
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
                    return "<i data-ng-click='showConfirmInsumo($event,data)' data-toggle='tooltip' title='Eliminar Insumo' class='material-icons' style='font-size:25px;margin-top:-1px;color:#f17325;'>delete_sweep</i>";
                },
            },
            {
                headerName: "Producto", field: 'nombre_Producto', width: 160, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Cantidad", field: 'cantidad', width: 100, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
            },
            {
                headerName: "Fecha", field: 'fecha', width: 120, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, cellRenderer: (data) => {
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

            $timeout(function () {
                $scope.EmpleadoInsumosGridOptions.api.sizeColumnsToFit();
            }, 200);

            $timeout(function () {
                $scope.EmpleadoServicioGridOptions.api.sizeColumnsToFit();
            }, 200);
        }

        $scope.$on("CompanyChange", function () {
            $scope.IdEmpresa = $rootScope.Id_Empresa;
            $scope.LimpiarDatos();
            $scope.ConsultarServicios();
            $scope.ConsultarEmpleados();
            $scope.ConsultarProductos();
            $scope.Inicializacion();
        });

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
            window.onresize();

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
                            $scope.Productos = $filter('orderBy')($scope.Productos, 'nombre', false);

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

                            $scope.DescripcionProductoTransacciones = 'Producto: ' + data.nombre;

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
                headerName: "", field: "Checked", suppressFilter: true, width: 20, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
            },
            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 20, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='ConsultarProducto(data)' data-toggle='tooltip' title='Editar producto' class='material-icons' style='font-size:25px;margin-top:-1px;color:#f17325;'>create</i>";
                },
            },
            {
                headerName: "", field: "", suppressMenu: true, visible: true, width: 20, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
                cellRenderer: function () {
                    return "<i data-ng-click='ConsultarProductoTransacciones(data)' data-toggle='tooltip' title='Transacciones' class='material-icons' style='font-size:25px;margin-top:-1px;color:#f17325;'>list</i>";
                },
            },
            {
                headerName: "Nombre", field: 'nombre', width: 140, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Descripcion", field: 'descripcion', width: 170, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }, cellRenderer: function (params) {
                    return "<span  data-toggle='tooltip' data-placement='left' title='{{data.descripcion}}'>{{data.descripcion}}</span>"
                },
            },
            {
                headerName: "Precio", field: 'precio', width: 50, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#212121', 'background': 'RGBA(210,216,230,0.75)', 'font-weight': 'bold', 'border-bottom': '1px dashed #212121', 'border-right': '1px dashed #212121', 'border-left': '1px dashed #212121' }, valueFormatter: currencyFormatter
            },
            {
                headerName: "Inventario", field: 'inventario', width: 80, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
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
                headerName: "Nombre", field: 'nombre_Producto', width: 150, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Tipo", field: 'nombre_Tipo_Transaccion', width: 50, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Cantidad", field: 'cantidad', width: 60, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, cellRenderer: (params) => {
                    if (params.data.nombre_Tipo_Transaccion !== "ENTRADA")
                        return (params.data.cantidad * - 1);
                    else
                        return params.data.cantidad;
                }
            },
            {
                headerName: "Fecha", field: 'fecha', width: 90, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, cellRenderer: (params) => {
                    return params.value ? $filter('date')(new Date(params.value), 'MM/dd/yyyy HH:mm:ss') : '';
                }
            }

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

        $scope.$on("CompanyChange", function () {
            $scope.IdEmpresa = $rootScope.Id_Empresa;
            $scope.LimpiarDatos();
            $scope.ConsultarProductos();
            $scope.Inicializacion();
        });

        // Invocación Funciones
        $scope.ConsultarTipoTransacciones();
        $scope.ConsultarProductos();
        $scope.Inicializacion();
    }

    function GastosController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
        // VARIABLES
        $scope.ObjetoGasto = [];
        $scope.ObjetoBorrarGasto = [];
        $scope.Gastos = [];
        $scope.AccionGasto = 'Registrar Gasto';
        $scope.TipoGastoSeleccionado = -1;
        $scope.TipoCajaSeleccionada = -1;
        $scope.DistribucionActual = -1;
        $scope.EmpleadoSeleccionado = -1;
        $scope.CambiarDistribucionCajaMenor = false;
        $scope.Acumulado = 0;
        $scope.Filtros = { Desde: new Date(), Hasta: new Date() }

        $scope.TipoGastos =
            [
                { id_TipoGasto: -1, Nombre: "[Seleccione]" },
                { id_TipoGasto: 1, Nombre: "SERVICIOS" },
                { id_TipoGasto: 2, Nombre: "PRESTAMOS" },
                { id_TipoGasto: 3, Nombre: "COMPRAS" },
                { id_TipoGasto: 4, Nombre: "VARIOS" },
                { id_TipoGasto: 5, Nombre: "NOMINA" }
            ];
        $scope.TipoGastos = $filter('orderBy')($scope.TipoGastos, 'Nombre', false);

        $scope.TipoCaja =
            [
                { id_TipoCaja: -1, Nombre: "[Seleccione]" },
                { id_TipoCaja: 1, Nombre: "DIARIA" },
                { id_TipoCaja: 2, Nombre: "MENSUAL" }
            ];
        $scope.TipoCaja = $filter('orderBy')($scope.TipoCaja, 'Nombre', false);

        // INICIALIZACIÓN
        $scope.Inicializacion = function () {
            $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
            window.onresize();
            $scope.Filtros = { Desde: new Date(), Hasta: new Date() }
            $scope.TipoGastoSeleccionado = -1;
            $scope.LimpiarDatosCajaMenor();
            $scope.ConsultarCajaMenor();
        }

        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.IdUsuario = parseInt($rootScope.userData.userId);

        $scope.BusquedaGasto = {
            Fecha_Desde: new Date(),
            Fecha_Hasta: new Date(),
            Tipo_Gasto: null
        };

        $scope.CajaMenor = {
            Saldo_Inicial: 0,
            Acumulado: $scope.Acumulado,
            Distribucion: $scope.TipoCajaSeleccionada
        };

        $scope.Gasto = {
            Id_Registro: -1,
            Descripcion: '',
            Id_Empleado: -1,
            Tipo_Gasto: '',
            Fecha: new Date(),
            Valor: 0,
            Estado: null
        }

        //Registrar Nuevo Gasto
        $scope.GuardarNuevoGasto = function () {
            if ($scope.ValidarNuevoGasto()) {
                $scope.ObjetoGasto = [];
                $scope.ObjetoGasto.push($scope.Gasto);

                SPAService._guardarGasto(JSON.stringify($scope.ObjetoGasto))
                    .then(
                        function (result) {
                            if (result.data === true) {
                                $scope.ConsultarCajaMenor();
                                toastr.success('Gasto registrado correctamente', '', $scope.toastrOptions);
                                $scope.TipoGastoSeleccionado = -1;
                                $scope.ConsultarGastos();

                                if ($scope.AccionGasto == 'Registrar Gasto') {
                                    $scope.Cancelar();
                                }
                                $scope.LimpiarDatosGastos();
                            }
                        }, function (err) {
                            toastr.remove();
                            if (err.data !== null && err.status === 500)
                                toastr.error(err.data, '', $scope.toastrOptions);
                        })
            }
        }

        //Eliminar Gastos
        $scope.EliminarGastos = function () {
            if ($scope.ObjetoBorrarGasto.length > 0) {
                SPAService._eliminarGastos(JSON.stringify($scope.ObjetoBorrarGasto))
                    .then(
                        function (result) {
                            if (result.data === true) {
                                $scope.ConsultarCajaMenor();
                                toastr.success('Gasto(s) eliminado(s) correctamente', '', $scope.toastrOptions);
                                $scope.TipoGastoSeleccionado = -1;
                                $scope.ObjetoBorrarGasto = [];
                                $scope.ConsultarGastos();
                            }
                        }, function (err) {
                            toastr.remove();
                            if (err.data !== null && err.status === 500)
                                toastr.error(err.data, '', $scope.toastrOptions);
                        })
            }
            else {
                toastr.info('Debe seleccionar al menos un registro de gastos', '', $scope.toastrOptions);
            }
        }

        //Guardar Caja Menor
        $scope.GuardarCajaMenor = function () {
            if ($scope.ValidarCajaMenor()) {
                $scope.ObjetoCajaMenor = [];
                $scope.ObjetoCajaMenor.push($scope.CajaMenor);

                if (!$scope.CambiarDistribucionCajaMenor) {
                    SPAService._guardarCajaMenor(JSON.stringify($scope.ObjetoCajaMenor))
                        .then(
                            function (result) {
                                if (result.data === true) {
                                    $scope.LimpiarDatosCajaMenor();
                                    $scope.ConsultarCajaMenor();
                                    toastr.success('Caja menor guardada correctamente', '', $scope.toastrOptions);

                                    if ($scope.AccionGasto == 'Caja Menor') {
                                        $scope.Cancelar();
                                    }
                                }
                            }, function (err) {
                                toastr.remove();
                                if (err.data !== null && err.status === 500)
                                    toastr.error(err.data, '', $scope.toastrOptions);
                            })
                }
                else {
                    SPAService._reemplazarCajaMenor(JSON.stringify($scope.ObjetoCajaMenor))
                        .then(
                            function (result) {
                                if (result.data === true) {
                                    toastr.success('Distribución de caja menor reemplazada correctamente', '', $scope.toastrOptions);
                                    if ($scope.AccionGasto == 'Caja Menor')
                                        $scope.Cancelar();

                                    $scope.LimpiarDatosCajaMenor();
                                    $scope.ConsultarCajaMenor();
                                }
                            }, function (err) {
                                toastr.remove();
                                if (err.data !== null && err.status === 500)
                                    toastr.error(err.data, '', $scope.toastrOptions);
                            })
                }
            }
        }

        //Consultar Caja Menor
        $scope.ConsultarCajaMenor = function () {
            SPAService._consultarCajaMenor($scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.Caja_Menor = [];
                            $scope.Caja_Menor = result.data;

                            if ($scope.Caja_Menor.dia !== null) {
                                $scope.TipoCajaSeleccionada = 1;
                                $scope.DistribucionActual = $scope.TipoCajaSeleccionada;
                                $scope.Acumulado = $scope.Caja_Menor.acumulado;
                            }
                            else {
                                $scope.TipoCajaSeleccionada = 2;
                                $scope.DistribucionActual = $scope.TipoCajaSeleccionada;
                                $scope.Acumulado = $scope.Caja_Menor.acumulado;
                            }
                        }
                        else toastr.info('Debe configurar la caja menor', '', $scope.toastrOptions);
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        //Consultar Gastos
        $scope.ConsultarGastos = function () {
            $scope.BusquedaGasto.Tipo_Gasto = null;

            if ($scope.ValidarDatos()) {
                if ($scope.TipoGastoSeleccionado !== -1) {
                    let filtrarTipoGasto = Enumerable.From($scope.TipoGastos)
                        .Where(function (x) { return x.id_TipoGasto === $scope.TipoGastoSeleccionado })
                        .ToArray();

                    if (filtrarTipoGasto.length > 0)
                        $scope.BusquedaGasto.Tipo_Gasto = filtrarTipoGasto[0].Nombre;
                }

                $scope.BusquedaGasto.Fecha_Desde = new Date($scope.Filtros.Desde + 'Z');
                $scope.BusquedaGasto.Fecha_Hasta = new Date($scope.Filtros.Hasta + 'Z');
                $scope.BusquedaGasto.Id_Empresa = $scope.IdEmpresa;

                SPAService._consultarGastos(JSON.stringify($scope.BusquedaGasto))
                    .then(
                        function (result) {
                            if (result.data !== undefined && result.data !== null) {
                                $scope.Gastos = [];
                                $scope.GastosGridOptions.api.setRowData($scope.Gastos);

                                $scope.Gastos = result.data;

                                if ($scope.Gastos.length > 0) {
                                    $scope.GastosGridOptions.api.setRowData($scope.Gastos);

                                    $timeout(function () {
                                        $scope.GastosGridOptions.api.sizeColumnsToFit();
                                    }, 200);
                                } else toastr.info('La busqueda no arrojó resultados', '', $scope.toastrOptions);
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
                            $scope.Empleados.push({ id_Empleado: -1, nombres: '[Seleccione]' });
                            $scope.Empleados = $filter('orderBy')($scope.Empleados, 'nombres', false);
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        //Validar Datos
        $scope.ValidarDatos = function () {
            if ($scope.IdEmpresa === null || $scope.IdEmpresa === undefined) {
                toastr.info('Código de empresa inválido', '', $scope.toastrOptions);
                return false;
            }

            if ($scope.Filtros.Desde === null || $scope.Filtros.Desde === undefined) {
                toastr.info('Fecha [Desde] inválida', '', $scope.toastrOptions);
                return false;
            }

            if ($scope.Filtros.Hasta === null || $scope.Filtros.Hasta === undefined) {
                toastr.info('Fecha [Hasta] inválida', '', $scope.toastrOptions);
                return false;
            }

            let DateLimit = new Date($scope.Filtros.Hasta);
            DateLimit.setDate(DateLimit.getDate() - 15);

            if ($filter('date')($scope.Filtros.Desde, 'MM/dd/yyyy') < $filter('date')(DateLimit, 'MM/dd/yyyy')) {
                if ($scope.TipoGastoSeleccionado === -1) {
                    toastr.info('Debe seleccionar un tipo de gasto', '', $scope.toastrOptions);
                    return false;
                }
            }

            return true;
        }

        //Validar Caja Menor
        $scope.ValidarCajaMenor = function () {
            $scope.CajaMenor.Acumulado = $scope.Acumulado;
            $scope.CajaMenor.Id_Empresa = $scope.IdEmpresa;

            if ($scope.Caja_Menor !== null && $scope.Caja_Menor !== undefined) {
                $scope.CajaMenor.Id_Registro = $scope.Caja_Menor.id_Registro;
            }

            if ($scope.IdEmpresa === null || $scope.IdEmpresa === undefined) {
                toastr.info('Código de empresa inválido', '', $scope.toastrOptions);
                return false;
            }

            if ($scope.TipoCajaSeleccionada === -1) {
                toastr.info('Debe seleccionar una distribución DIARIA o MENSUAL', '', $scope.toastrOptions);
                return false;
            }
            else if ($scope.TipoCajaSeleccionada === 1) {
                $scope.CajaMenor.Distribucion = 'DIARIA';
            }
            else if ($scope.TipoCajaSeleccionada === 2) {
                $scope.CajaMenor.Distribucion = 'MENSUAL';
            }

            if ($scope.CajaMenor.Saldo_Inicial === 0 || $scope.CajaMenor.Saldo_Inicial == '') {
                toastr.info('Debe debe ingresar un saldo inicial', '', $scope.toastrOptions);
                $('#txtSaldoInicial').focus();
                return false;
            }

            return true;
        }

        //Validar Nuevo Gasto
        $scope.ValidarNuevoGasto = function () {
            $scope.Gasto.Id_Empresa = $scope.IdEmpresa;
            $scope.Gasto.Fecha = new Date($scope.Gasto.Fecha + 'Z');
            if ($scope.TipoGastoSeleccionado === -1) {
                toastr.info('Debe seleccionar un tipo de gasto', '', $scope.toastrOptions);
                return false;
            }

            if ($scope.TipoGastoSeleccionado === 2 && $scope.EmpleadoSeleccionado === -1) {
                toastr.info('Para el tipo de gasto PRESTAMOS debe seleccionar un empleado', '', $scope.toastrOptions);
                return false;
            }

            if ($scope.TipoGastoSeleccionado !== -1 && $scope.TipoGastoSeleccionado !== 2) {
                $scope.Gasto.Id_Empleado = null;
                $scope.Gasto.Estado = null;
            }
            else {
                $scope.Gasto.Id_Empleado = $scope.EmpleadoSeleccionado;
                $scope.Gasto.Estado = 'ASIGNADO';
            }

            if ($scope.Gasto.Descripcion == '') {
                toastr.info('Debe ingresar un descripción', '', $scope.toastrOptions);
                $('#txtDescripcion').focus();
                return false;
            }

            if (parseInt($filter('date')($scope.Gasto.Fecha, 'yyyyMMdd')) > parseInt($filter('date')(new Date(), 'yyyyMMdd'))) {
                toastr.info('La fecha del gasto no puede ser mayor a la fecha actual', '', $scope.toastrOptions);
                return false;
            }

            if ($scope.Gasto.Valor === 0) {
                toastr.info('El valor del gasto no puede cero', '', $scope.toastrOptions);
                $('#txtValorGasto').focus();
                return false;
            }

            if ($scope.Gasto.Valor > $scope.Acumulado) {
                toastr.info('Solo dispone de un acumulado de ' + $filter('currency')($scope.Acumulado, '$', 2), '', $scope.toastrOptions);
                $('#txtValorGasto').focus();
                return false;
            }

            let filtrarTipoGasto = Enumerable.From($scope.TipoGastos)
                .Where(function (x) { return x.id_TipoGasto === $scope.TipoGastoSeleccionado })
                .ToArray();

            if (filtrarTipoGasto.length > 0)
                $scope.Gasto.Tipo_Gasto = filtrarTipoGasto[0].Nombre;

            return true;
        }

        //API GRID GASTOS OPTIONS
        $scope.GastosGridOptionsColumns = [

            {
                headerName: "", field: "Checked", suppressFilter: true, width: 30, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
            },
            {
                headerName: "Tipo", field: 'tipo_Gasto', width: 90, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Descripcion", field: 'descripcion', width: 260, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }, cellRenderer: function (params) {
                    return "<span  data-toggle='tooltip' data-placement='left' title='{{data.descripcion}}'>{{data.descripcion}}</span>"
                },
            },
            {
                headerName: "Valor", field: 'valor', width: 80, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#212121', 'background': 'RGBA(210,216,230,0.75)', 'font-weight': 'bold', 'border-bottom': '1px dashed #212121', 'border-right': '1px dashed #212121', 'border-left': '1px dashed #212121' }, valueFormatter: currencyFormatter
            },
            {
                headerName: "Registro", field: 'fecha_Registro', width: 120, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, cellRenderer: (data) => {
                    return data.value ? $filter('date')(new Date(data.value), 'dd/MM/yyyy HH:mm:ss') : '';
                },
            },
            {
                headerName: "Estado", field: 'estado', width: 80, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            },
            {
                headerName: "Empleado", field: 'nombre_Empleado', width: 200, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
            }

        ];

        $scope.GastosGridOptions = {
            defaultColDef: {
                resizable: true
            },
            columnDefs: $scope.GastosGridOptionsColumns,
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
            onRowSelected: OnRowSelected
        }

        //Funciones

        //Cambiar Distribución Caja Menor
        $scope.CambiarDistribucion = function () {
            if ($scope.TipoCajaSeleccionada === -1) {
                toastr.info('Debe seleccionar una distribución DIARIA o MENSUAL', '', $scope.toastrOptions);
                $scope.TipoCajaSeleccionada = $scope.DistribucionActual;
                return;
            }

            if ($scope.DistribucionActual !== -1) {
                $scope.showConfirmCambiarDistribucion();
            }
        }

        //Limpiar Datos
        $scope.LimpiarDatosCajaMenor = function () {
            $scope.DistribucionActual = -1;
            $scope.TipoCajaSeleccionada = -1;
            $scope.Acumulado = 0;
            $scope.CambiarDistribucionCajaMenor = false;

            $scope.CajaMenor = {
                Saldo_Inicial: 0,
                Acumulado: $scope.Acumulado,
                Distribucion: $scope.TipoCajaSeleccionada,
                Id_Empresa: $scope.IdEmpresa
            }
        }

        $scope.LimpiarDatosGastos = function () {
            $scope.TipoGastoSeleccionado = -1;
            $scope.EmpleadoSeleccionado = -1;

            $scope.Gasto = {
                Id_Registro: -1,
                Descripcion: '',
                Id_Empleado: -1,
                Tipo_Gasto: '',
                Fecha: new Date(),
                Valor: 0,
                Estado: null,
                Id_Empresa: $scope.IdEmpresa
            }
        }

        //Modal Caja Menor
        $scope.ModalCajaMenor = function () {
            $scope.AccionGasto = 'Caja Menor';

            $mdDialog.show({
                contentElement: '#dlgCajaMenor',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true,
            })
                .then(function () {
                }, function () {
                    $scope.CajaMenor.Saldo_Inicial = 0;
                    $scope.TipoCajaSeleccionada = $scope.DistribucionActual;
                });
        }

        //Modal Nuevo Gasto
        $scope.ModalNuevoGasto = function () {
            $scope.ConsultarEmpleados();
            $scope.AccionGasto = 'Registrar Gasto';

            $mdDialog.show({
                contentElement: '#dlgNuevoGasto',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true,
            })
                .then(function () {
                }, function () {
                    $scope.LimpiarDatosGastos();
                });
        }

        //Show Comfirm Cambiar Distribucion
        $scope.showConfirmCambiarDistribucion = function (ev, data) {
            let confirm = $mdDialog.confirm()
                .title('Distribución Caja Menor')
                .textContent('¿Ya existe una distribución de caja menor asignada. Desea cambiarla?')
                .ariaLabel('Cambiar Distribución')
                .targetEvent(ev, data)
                .ok('Sí')
                .cancel('No')
                .multiple(true);

            $mdDialog.show(confirm).then(function () {
                $scope.CambiarDistribucionCajaMenor = true;
            }, function () {
                $scope.TipoCajaSeleccionada = $scope.DistribucionActual;
                return;
            });
        };

        //Show Comfirm Eliminar Gastos
        $scope.showConfirmEliminarGastos = function (ev) {
            if ($scope.ObjetoBorrarGasto.length > 0) {
                let confirm = $mdDialog.confirm()
                    .title('Eliminar Gastos')
                    .textContent('¿Seguro que deseas eliminar los gastos seleccionados?')
                    .ariaLabel('Eliminar Gastos')
                    .targetEvent(ev)
                    .ok('Sí')
                    .cancel('No')
                    .multiple(true);

                $mdDialog.show(confirm).then(function () {
                    $scope.EliminarGastos();
                }, function () {
                    return;
                });
            }
            else
                toastr.info('Debe seleccionar al menos un registro de gastos', '', $scope.toastrOptions);
        };

        //OnRowSelected
        function OnRowSelected(event) {
            $scope.ObjetoBorrarGasto = [];
            $scope.ObjetoBorrarGasto = $scope.GastosGridOptions.api.getSelectedRows();
        }

        // Eventos
        window.onresize = function () {
            $timeout(function () {
                $scope.GastosGridOptions.api.sizeColumnsToFit();
            }, 200);
        }

        $scope.Cancelar = function () {
            $mdDialog.cancel();
        };

        $scope.ValidarFechaDesde = function () {
            if ($scope.Filtros.Desde == undefined) {
                $scope.Filtros.Desde = new Date();
            }

            if ($filter('date')(new Date($scope.Filtros.Desde), 'yyyy-MM-dd') > $filter('date')(new Date($scope.Filtros.Hasta), 'yyyy-MM-dd')) {
                $scope.Filtros.Desde = angular.copy($scope.Filtros.Hasta);
            }
        }

        $scope.ValidarFechaHasta = function () {
            if ($scope.Filtros.Hasta == undefined) {
                $scope.Filtros.Hasta = new Date();
            }

            if ($filter("date")(new Date($scope.Filtros.Hasta), 'yyyy-MM-dd') < $filter("date")(new Date($scope.Filtros.Desde), 'yyyy-MM-dd')) {
                $scope.Filtros.Hasta = angular.copy($scope.Filtros.Desde);
            }
        }

        // Formatos
        function currencyFormatter(params) {
            let valueGrid = params.value;
            return $filter('currency')(valueGrid, '$', 0);
        }

        $scope.$on("CompanyChange", function () {
            $scope.IdEmpresa = $rootScope.Id_Empresa;
            $scope.Inicializacion();
        });

        $scope.Inicializacion();
    }

    function GestionController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
        //Variables
        $scope.TipoPerfilSeleccionado = -1;
        $scope.NombreReadOnly = false;
        $scope.Confirmacion = '';
        $scope.EditarUsuario = false;
        $scope.ImagenUsuario = '../Images/default-perfil.png';
        $scope.PasswordHasChanged = false;
        $scope.PasswordBackup = '';
        $scope.TipoPerfil =
            [
                { id_TipoPerfil: -1, Nombre: "[Seleccione]" },
                { id_TipoPerfil: 1, Nombre: "Administrador" },
                { id_TipoPerfil: 2, Nombre: "Invitado" }
            ];
        $scope.TipoPerfil = $filter('orderBy')($scope.TipoPerfil, 'Nombre', false);

        //Inicialización
        $scope.Inicializacion = function () {
            $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
            window.onresize();

            $('#txtUsuario').focus();
        }

        $scope.Menu = $rootScope.Menu;
        $scope.Menu = $scope.Menu.map(function (e) {
            return { Id_Usuario: -1, Id_Menu: e.id_Menu, Descripcion: e.descripcion, Estado: true }
        });

        $scope.Usuario = {
            Id_Usuario: -1,
            Nombre: '',
            Contrasenia: '',
            Perfil: '',
            Id_Empresa: $scope.IdEmpresa,
            Mail: '',
            Logo_Base64: null,
            Menu_Usuario: $scope.Menu,
            PasswordHasChanged: $scope.PasswordHasChanged
        }

        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.IdUsuario = parseInt($rootScope.userData.userId);
        $scope.PerfilUsuario = $rootScope.userData.userRole;

        //API
        //Consultar Usuarios
        $scope.ConsultarUsuarios = function () {
            SPAService._consultarUsuarios($scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.Usuarios = [];
                            $scope.Usuarios = result.data;
                            $scope.UsuariosGridOptions.api.setRowData($scope.Usuarios);

                            $timeout(function () {
                                $scope.UsuariosGridOptions.api.sizeColumnsToFit();
                            }, 200);
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        //Consultar Usuario
        $scope.ConsultarUsuario = function (e, Nombre) {
            if (Nombre !== null && Nombre !== '' && $scope.EditarUsuario === false) {
                SPAService._consultarUsuario(Nombre)
                    .then(
                        function (result) {
                            if (result.data === true) {
                                toastr.info('Ya existe ese nombre de usuario. Debe ingresar uno diferente', '', $scope.toastrOptions);
                                $('#txtUsuario').focus();
                            }
                        }, function (err) {
                            toastr.remove();
                            if (err.data !== null && err.status === 500)
                                toastr.error(err.data, '', $scope.toastrOptions);
                        })
            }
        }

        //Guardar Usuario
        $scope.GuardarUsuario = function () {
            if ($scope.ValidarUsuario()) {
                SPAService._guardarUsuario(JSON.stringify($scope.Usuario))
                    .then(
                        function (result) {
                            if (result.data === true) {
                                toastr.success('Usuario registrado/actualizado correctamente', '', $scope.toastrOptions);
                                $scope.ConsultarUsuarios();
                                $scope.LimpiarDatos();
                            }
                        }, function (err) {
                            toastr.remove();
                            if (err.data !== null && err.status === 500)
                                toastr.error(err.data, '', $scope.toastrOptions);
                        })
            }
        }

        //GRID
        //API GRID USUARIOS OPTIONS
        $scope.UsuariosGridOptionsColumns = [

            {
                headerName: "Nombre", field: 'nombre', width: 160, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }, suppressSizeToFit: true
            },
            {
                headerName: "Empresa", field: 'nombre_Empresa', width: 100, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
            },
            {
                headerName: "Mail", field: 'mail', width: 90, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
            },
            {
                headerName: "Fecha Registro", field: 'fecha_Registro', width: 150, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, suppressSizeToFit: true, cellRenderer: (data) => {
                    return data.value ? $filter('date')(new Date(data.value), 'MM/dd/yyyy') : '';
                }
            },
            {
                headerName: "Perfil", field: 'perfil', width: 160, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, suppressSizeToFit: true
            }

        ];

        $scope.UsuariosGridOptions = {
            defaultColDef: {
                resizable: true
            },
            columnDefs: $scope.UsuariosGridOptionsColumns,
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
            onRowClicked: OnRowClicked
        }

        //Funciones
        //Validar Usuario
        $scope.ValidarUsuario = function () {
            let mail_expression = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,5}$/;
            $scope.Usuario.Id_Empresa = $scope.IdEmpresa;
            if ($scope.ImagenUsuario !== '../Images/default-perfil.png')
                $scope.Usuario.Logo_Base64 = $scope.ImagenUsuario;
            else
                $scope.Usuario.Logo_Base64 = null;

            if ($scope.PerfilUsuario !== 'Administrador' && $scope.PerfilUsuario !== '[MANAGER]') {
                toastr.info('Solo los Administradores pueden registrar/actualizar usuarios', '', $scope.toastrOptions);
                $scope.LimpiarDatos();
                return false;
            }

            if ($scope.Usuario.Nombre === '') {
                toastr.info('Debe ingresar un nombre de usuario', '', $scope.toastrOptions);
                $('#txtUsuario').focus();
                return false;
            }

            if ($scope.Usuario.Contrasenia === '') {
                toastr.info('Debe ingresar una contraseña', '', $scope.toastrOptions);
                $('#txtContrasenia').focus();
                return false;
            }

            if ($scope.Confirmacion === '') {
                toastr.info('Debe confirmar la contraseña', '', $scope.toastrOptions);
                $('#txtConfirmacion').focus();
                return false;
            }

            if ($scope.Usuario.Contrasenia !== $scope.Confirmacion) {
                toastr.info('La confirmación de la contraseña no coincide con la contraseña', '', $scope.toastrOptions);
                $('#txtConfirmacion').focus();
                return false;
            }

            if (($scope.Usuario.Contrasenia !== $scope.PasswordBackup && $scope.Usuario.Id_Usuario !== -1) || ($scope.Usuario.Id_Usuario === -1)) {
                $scope.PasswordHasChanged = true;
                $scope.Usuario.PasswordHasChanged = $scope.PasswordHasChanged;
            }

            if ($scope.Usuario.Mail === '') {
                toastr.info('Debe ingresar una dirección de correo electrónico', '', $scope.toastrOptions);
                $('#txtMail').focus();
                return false;
            }

            if (!mail_expression.test($scope.Usuario.Mail)) {
                toastr.info('La dirección de correo electrónico no es válida.', '', $scope.toastrOptions);
                $('#txtMail').focus();
                return false;
            }

            if ($scope.TipoPerfilSeleccionado === -1) {
                toastr.info('Debe seleccionar un perfil', '', $scope.toastrOptions);
                $('#slTipoPerfil').focus();
                return false;
            }

            let filtrarTipoPerfil = Enumerable.From($scope.TipoPerfil)
                .Where(function (x) { return x.id_TipoPerfil === $scope.TipoPerfilSeleccionado })
                .ToArray();

            if (filtrarTipoPerfil.length > 0)
                $scope.Usuario.Perfil = filtrarTipoPerfil[0].Nombre;

            let menuUnchecked = 0;
            for (let i = 0; i < $scope.Usuario.Menu_Usuario.length; i++) {
                if ($scope.Usuario.Menu_Usuario[i].Estado === false)
                    menuUnchecked += 1;
            }

            if (menuUnchecked === $scope.Usuario.Menu_Usuario.length) {
                toastr.info('Debe asignar almenos un elemento del menú', '', $scope.toastrOptions);
                $scope.ModalMenu();
                return false;
            }

            return true;
        }

        //Limpiar Datos
        $scope.LimpiarDatos = function () {
            $scope.EditarUsuario = false;
            $scope.ImagenUsuario = '../Images/default-perfil.png';
            $scope.Menu = $rootScope.Menu;
            $scope.PasswordHasChanged = false;
            $scope.PasswordBackup = '';
            $scope.Menu = $scope.Menu.map(function (e) {
                return { Id_Menu_Usuario: '', Id_Usuario: -1, Id_Menu: e.id_Menu, Descripcion: e.descripcion, Estado: true }
            });
            $('#txtUsuario').focus();
            $scope.TipoPerfilSeleccionado = -1;
            $scope.Confirmacion = '';
            $scope.NombreReadOnly = false;
            $scope.Usuario = {
                Id_Usuario: -1,
                Nombre: '',
                Contrasenia: '',
                Mail: '',
                Perfil: '',
                Id_Empresa: $scope.IdEmpresa,
                Logo_Base64: null,
                Menu_Usuario: $scope.Menu,
                PasswordHasChanged: $scope.PasswordHasChanged
            }
        }

        //On Row Clicked
        function OnRowClicked(event) {
            $scope.LimpiarDatos();
            if (event.node.data !== undefined && event.node.data !== null) {
                $scope.EditarUsuario = true;
                $scope.Usuario.Id_Usuario = event.node.data.id_Usuario;
                $scope.Usuario.Nombre = event.node.data.nombre;
                $scope.Usuario.Contrasenia = event.node.data.contrasenia;
                $scope.Usuario.Mail = event.node.data.mail;
                $scope.Usuario.Id_Empresa = event.node.data.id_Empresa;
                $scope.PasswordBackup = angular.copy(event.node.data.contrasenia);

                if (event.node.data.logo_Base64 !== null)
                    $scope.ImagenUsuario = event.node.data.logo_Base64;
                else
                    $scope.ImagenUsuario = '../Images/default-perfil.png';

                $scope.Usuario.Logo_Base64 = $scope.ImagenUsuario;
                $scope.Menu = event.node.data.menu_Usuario;
                $scope.Menu = $scope.Menu.map(function (e) {
                    return { Id_Menu_Usuario: e.id_Menu_Usuario, Id_Usuario: e.id_Usuario, Id_Menu: e.id_Menu, Estado: e.estado, Descripcion: e.descripcion }
                });

                $scope.Usuario.Menu_Usuario = $scope.Menu;
                $scope.Confirmacion = $scope.Usuario.Contrasenia;

                let filtrarTipoPerfil = Enumerable.From($scope.TipoPerfil)
                    .Where(function (x) { return x.Nombre === event.node.data.perfil })
                    .ToArray();

                if (filtrarTipoPerfil.length > 0)
                    $scope.TipoPerfilSeleccionado = filtrarTipoPerfil[0].id_TipoPerfil;

                $scope.NombreReadOnly = true;
                $('#txtContrasenia').focus();
            }
        }

        //Modal Menu
        $scope.ModalMenu = function () {
            $scope.AccionGasto = 'MENU';

            $mdDialog.show({
                contentElement: '#dlgMenu',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true,
            })
                .then(function () {
                }, function () {
                });
        }

        //Seleccionar Imagen
        $scope.SeleccionarImagen = function (event) {
            let mayorDosMB = false;
            let files = event.target.files[0];

            let fileSize = (files.size / 1024 / 1024)
            if (fileSize > 2)
                mayorDosMB = true;

            if (mayorDosMB) {
                toastr.info('El tamaño de las imágenes debe ser de máximo 2MB', '', $scope.toastrOptions);
                files = '';
                return;
            }

            $scope.getBase64(files);
        }

        //Eventos
        $scope.ProcesarImagen = function () {
            $('#ImagenUsuario').trigger('click');
        }

        $scope.getBase64 = function (file) {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                $scope.$apply(function () {
                    $scope.ImagenUsuario = reader.result;
                });
                $("#ImagenServicio").val('');
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
                $("#ImagenServicio").val('');
            };
        }

        window.onresize = function () {
            $timeout(function () {
                $scope.UsuariosGridOptions.api.sizeColumnsToFit();
            }, 200);
        }

        $scope.Cancelar = function () {
            $mdDialog.cancel();
        };

        $scope.$on("CompanyChange", function () {
            $scope.IdEmpresa = $rootScope.Id_Empresa;
            $scope.LimpiarDatos();
            $scope.ConsultarUsuarios();
            $scope.Inicializacion();
        });

        $scope.Inicializacion();
        $scope.ConsultarUsuarios();
    }

    function AgendaController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
        //Variables
        $scope.Estado =
            [
                { id_Estado: -1, Nombre: "[Seleccione]" },
                { id_Estado: 1, Nombre: "PROGRAMADA" },
                { id_Estado: 2, Nombre: "FACTURADA" },
                { id_Estado: 4, Nombre: "LIQUIDADA" },
                { id_Estado: 5, Nombre: "CANCELADA" },
            ];
        $scope.Estado = $filter('orderBy')($scope.Estado, 'Nombre', false);

        $scope.doc_classes_colors = ["#96bdc4", "#c2dbdf", "#fdd4c1", "#eaabbc", "#F1CBB5"];
        $scope.PorHoras = ["06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 M",
            "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
            "08:00 PM", "09:00 PM", "10:00 PM"];

        //Inicialización
        $scope.IdEmpresa = $rootScope.Id_Empresa;        
        $scope.EmpresaPropiedades = $filter('filter')($rootScope.EmpresaPropiedades, { id_Empresa: $scope.IdEmpresa});
        $scope.IdUsuario = parseInt($rootScope.userData.userId);
        $scope.EstadoSeleccionado = -1;
        $scope.ServicioSeleccionado = -1;
        $scope.ClienteSeleccionado = '';
        $scope.EmpleadoSeleccionado = '';
        $scope.Filtros = { Desde: new Date(new Date().setHours(0, 0, 0, 0)), Hasta: new Date(new Date().setHours(0, 0, 0, 0)) };
        $scope.FechaActual = new Date();
        $scope.HoraActual = new Date($scope.FechaActual.getFullYear(), $scope.FechaActual.getMonth(), $scope.FechaActual.getDate(), $scope.FechaActual.getHours(), $scope.FechaActual.getMinutes());

        //Variables de Configuración
        $scope.fDisableHoraFin = false;

        $scope.Agenda = {
            Cliente: '',
            Empleado: '',
            Servicio: '',
            FechaInicio: '',
            FechaFin: '',
            Observaciones: ''
        };

        //Api
        //GuardarNuevaCita
        $scope.GuardarNuevaCita = function () {
            if ($scope.ValidarNuevaCita()) {
            }
        }

        //Consultar Clientes
        $scope.ConsultarClientes = function () {
            SPAService._consultarClientes($scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.Clientes = [];
                            $scope.Clientes = result.data;
                            $scope.Clientes = $filter('orderBy')($scope.Clientes, 'id_Cliente', false);
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        // Consultar Empleados
        $scope.ConsultarEmpleados = function () {
            SPAService._consultarEmpleados($scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.Empleados = [];
                            $scope.Empleados = result.data;
                            $scope.Empleados = $filter('orderBy')($scope.Empleados, 'id_Empleado', false);
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
                            $scope.Servicios.push({ id_Servicio: -1, nombre: '[Seleccione]' });
                            $scope.Servicios = $filter('orderBy')($scope.Servicios, 'id_Servicio', false);
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        //Funciones
        //Validar Datos
        $scope.ValidarNuevaCita = function () {
            if ($scope.EmpleadoSeleccionado === '') {
                toastr.info('Debe seleccionar un empleado', '', $scope.toastrOptions);
                $('#acEmpleados').focus();
                return false;
            }

            $scope.Agenda.Empleado = $scope.EmpleadoSeleccionado.id_Empleado;

            if ($scope.ClienteSeleccionado === '') {
                toastr.info('Debe seleccionar un cliente', '', $scope.toastrOptions);
                $('#acClientes').focus();
                return false;
            }

            $scope.Agenda.Cliente = $scope.ClienteSeleccionado.id_Cliente;

            if ($scope.ServicioSeleccionado === -1) {
                toastr.info('Debe seleccionar un servicio', '', $scope.toastrOptions);
                $('#slServicios').focus();
                return false;
            }

            $scope.Agenda.Servicio = $scope.ServicioSeleccionado;

            if ($scope.Agenda.Fecha === '') {
                toastr.info('Debe seleccionar una fecha', '', $scope.toastrOptions);
                $('#dpFecha').focus();
                return false;
            }

            if ($scope.HoraInicio === '') {
                toastr.info('Debe seleccionar una hora de inicio', '', $scope.toastrOptions);
                $('#timeInicio').focus();
                return false;
            }

            if ($scope.HoraFin === '') {
                toastr.info('Debe seleccionar una hora fin', '', $scope.toastrOptions);
                $('#timeFin').focus();
                return false;
            }

            if ($scope.Agenda.Observaciones === '') {
                toastr.info('El campo "Observaciones" no puede estar vacío', '', $scope.toastrOptions);
                $('#txtObservaciones').focus();
                return false;
            }

            return true;
        }

        //Encontrar Cliente
        $scope.EncontrarCliente = function (nombre) {
            let busqueda = '';
            busqueda = $filter('filter')($scope.Clientes, { 'nombres': nombre });
            return busqueda;
        }

        //Encontrar Empleado
        $scope.EncontrarEmpleado = function (nombre) {
            let busqueda = '';
            busqueda = $filter('filter')($scope.Empleados, { 'nombres': nombre });
            return busqueda;
        }

        //Modales Agendar Cita
        //Modal Agendar Cita General
        $scope.ModalAgendaGeneral = function () {
            $scope.AccionAgenda = 'Agendar Cita';

            $scope.FechaHoraAgendaGeneral();

            $mdDialog.show({
                contentElement: '#dlgAgendaGeneral',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true,
            })
                .then(function () {
                }, function () {
                });
        }

        //Modal Agendar Cita Detallada
        $scope.ModalAgendaDetallada = function (horas, empleado, minutos) {
            $scope.AccionAgenda = 'Agendar Cita';
            $scope.EmpleadoSeleccionado = empleado.nombres;

            $scope.FechaHoraAgendaDetallada(horas, minutos);

            $mdDialog.show({
                contentElement: '#dlgAgendaDetallada',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true,
            })
                .then(function () {
                }, function () {
                });
        }

        //Fecha y Hora Agenda General
        $scope.FechaHoraAgendaGeneral = function () {
            let papts = $filter('filter')($scope.EmpresaPropiedades, { codigo: 'PAPTS' });
            if (papts[0].valor_Propiedad.toUpperCase() === 'SI' || papts[0].valor_Propiedad.toUpperCase() === 'SÍ')
                $scope.fDisableHoraFin = true;
            else
                $scope.fDisableHoraFin = false;

            $scope.FechaInicio = angular.copy($scope.FechaActual);
            $scope.HoraInicio = new Date($scope.FechaInicio.getFullYear(), $scope.FechaInicio.getMonth(), $scope.FechaInicio.getDate(), $scope.FechaInicio.getHours(), $scope.FechaInicio.getMinutes());
            $scope.HoraFin = angular.copy($scope.HoraInicio);
        }

        //Fecha y Hora Agenda Detallada
        $scope.FechaHoraAgendaDetallada = function (horas, minutos) {
            let setHora = 0;
            let setMinutos = 0;

            if (horas.indexOf('PM') !== -1) {
                horas = horas.replace('PM', '');
                setHora = parseInt(horas) + 12;
                if (minutos === 'enpunto')
                    setMinutos = '0';
                else
                    setMinutos = '30';
            } else {
                if (horas === '12:00 M')
                    horas = horas.replace('M', '');
                else
                    horas = horas.replace('AM', '');

                setHora = parseInt(horas);

                if (minutos === 'enpunto')
                    setMinutos = 0;
                else
                    setMinutos = 30;
            }

            $scope.FechaInicio = angular.copy($scope.FechaActual);
            $scope.FechaInicio = new Date(($scope.FechaInicio).setHours(setHora, setMinutos, 0, 0));
            $scope.FechaFin = angular.copy($scope.FechaInicio);
            $scope.HoraInicio = new Date($scope.FechaInicio.getFullYear(), $scope.FechaInicio.getMonth(), $scope.FechaInicio.getDate(), $scope.FechaInicio.getHours(), $scope.FechaInicio.getMinutes());
            $scope.HoraFin = angular.copy($scope.HoraInicio);
        }

        //Eventos
        $scope.Cancelar = function () {
            $mdDialog.cancel();
        };

        $scope.$on("CompanyChange", function () {
            $scope.IdEmpresa = $rootScope.Id_Empresa;
            $scope.EmpresaPropiedades = $filter('filter')($rootScope.EmpresaPropiedades, { id_Empresa: $scope.IdEmpresa });
            $scope.ConsultarServicios();
            $scope.ConsultarEmpleados();
            $scope.ConsultarClientes();
        });

        $scope.ConsultarServicios();
        $scope.ConsultarEmpleados();
        $scope.ConsultarClientes();
    }

    function SliderController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
        //  Inicialización de Objetos
        $scope.ServicioNombre = $rootScope.ServicioNombre;

        $scope.SliderServicios = $rootScope.ServicioListaImagenes;

        $scope.SliderClass = 'container' + $scope.SliderServicios.length;

        // Eventos
        $scope.Cancelar = function () {
            $mdDialog.cancel();
            $('#txtBuscarServicio').focus();
        };
    }

    function ImgAttachedController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
        //INICIALIZACIÓN
        $scope.ServicioImagenesAdjuntas = $rootScope.ServicioImagenesAdjuntas;
        $scope.ImagenesAdjuntas = $rootScope.ImagenesAdjuntas;
        $scope.ImagenesxAdjuntar = $rootScope.ImagenesxAdjuntar;
        $scope.InformacionImagen = $rootScope.InformacionImagen;

        //API

        //  Eliminar Imagen Adjunta Servicio
        $scope.EliminarImagenAdjunta = function (data) {
            let IdImagenAdjunta = data.id_Servicio_Imagen;

            SPAService._eliminarImagenAdjunta(IdImagenAdjunta)
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Imagen eliminada correctamente', '', $scope.toastrOptions);

                            let index = $scope.ServicioImagenesAdjuntas.indexOf(data);
                            $scope.ServicioImagenesAdjuntas.splice(index, 1);
                            $rootScope.ImagenesAdjuntas = $scope.ServicioImagenesAdjuntas.length;
                            $scope.ImagenesAdjuntas = $rootScope.ImagenesAdjuntas;
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }

        //FUNCIONES

        //Modal Show Confirm Borrar Servicio Imagen
        $scope.showConfirmBorrarServicioImagen = function (ev, data) {
            let confirm = $mdDialog.confirm()
                .title('Eliminar Imagen')
                .textContent('¿Desea Eliminar la imagen adjunta?')
                .ariaLabel('Eliminar Imagen')
                .targetEvent(ev, data)
                .ok('Sí')
                .cancel('No')
                .multiple(true);

            $mdDialog.show(confirm).then(function () {
                $scope.EliminarImagenAdjunta(data);
            }, function () {
                return;
            });
        }

        //EVENTOS
        $scope.Cancelar = function () {
            $mdDialog.cancel();
            $('#txtBuscarServicio').focus();
        };
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