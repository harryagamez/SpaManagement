angular.module('app.controllers')
    .controller("TransaccionesController", TransaccionesController);

TransaccionesController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

function TransaccionesController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
    $scope.IdEmpresa = $rootScope.Id_Empresa;
    $scope.EmpresaPropiedades = $filter('filter')($rootScope.EmpresaPropiedades, { id_Empresa: $scope.IdEmpresa });
    $scope.FechaBusqueda = new Date();
    $scope.fActiveTab = 'Facturar Servicios';
    $scope.InventarioProducto = 0;
    $scope.PrecioProducto = 0;
    $scope.SubtotalTransaccion = 0;
    $scope.TipoClienteTransaccion = '';
    $scope.TotalTransaccion = 0;
    $scope.DescuentoTransaccion = 0;
    $scope.TotalProductos = 0;
    $scope.TotalServicios = 0;

    $scope.AcumuladoCajaMenor = 0;
    $scope.NominaTotalServicios = 0;
    $scope.NominaTotalPrestamos = 0;
    $scope.NominaTotalPagar = 0;

    $scope.fPropertiesSetted = false;
    $scope.fTDN = false;

    $scope.FechaNomina = new Date();
    $scope.Anio = $scope.FechaNomina.getFullYear();
    $scope.Mes = $scope.FechaNomina.getMonth();
    $scope.Quincena = [
        {
            Id_Quincena: 1,
            Descripcion: 'Primera Quincena'
        },
        {
            Id_Quincena: 2,
            Descripcion: 'Segunda Quincena'
        }
    ];

    $scope.Agenda = {
        Id_Agenda: -1,
        Id_Empresa: $scope.IdEmpresa,
        Id_Cliente: '',
        Id_Empleado: '',
        Id_Servicio: '',
        Fecha_Inicio: new Date(),
        Fecha_Fin: '',
        Estado: 'CONFIRMADA',
        Observaciones: '',
        Traer_Canceladas: false
    };

    $scope.ProductoGrid = {
        Id_Producto: -1,
        Precio: 0,
        Cantidad: 0,
        Total: 0
    }

    $scope.ClientePago = {
        Id_ClientePago: '00000000-0000-0000-0000-000000000000',
        Id_Cliente: -1,
        Fecha: new Date(),
        Subtotal: 0,
        Descuento: 0,
        Total: 0,
        Id_Empresa: $scope.IdEmpresa
    }

    $scope.ObjetoProductosGrid = [];
    $scope.ObjetoAgendasSeleccionadas = [];

    $scope.ProductoSeleccionado = -1;

    $scope.Inicializacion = function () {
        $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
    }

    $scope.ConfiguracionEmpresaActual = function () {
        try {
            if ($scope.EmpresaPropiedades.length > 0) {
                let tdn = $filter('filter')($scope.EmpresaPropiedades, { codigo: 'TDN' });
                $scope.TDN = '';
                if (tdn.length > 0) {
                    $scope.fPropertiesSetted = true;
                    $scope.TDN = tdn[0].valor_Propiedad;
                    $scope.fTDN = true;
                }
                else {
                    $scope.fPropertiesSetted = true;
                    $scope.fTDN = false;
                }
            } else {
                $scope.fPropertiesSetted = false;
                toastr.warning('La empresa actual, no tiene propiedades definidas', '', $scope.toastrOptions);
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ConsultarNominaEmpleados = function () {
        let idEmpresa = $scope.IdEmpresa;
        let fechaNomina = $filter('date')(angular.copy($scope.FechaNomina), 'yyyy-MM-dd');
        SPAService._consultarNominaEmpleados(idEmpresa, fechaNomina)
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.NominaEmpleados = [];
                        $scope.ObjetoNominaEmpleados = [];
                        $scope.NominaEmpleados = result.data;
                        $scope.ObjetoNominaEmpleados = result.data;
                        $scope.ObjetoNominaEmpleados = $filter('orderBy')($scope.ObjetoNominaEmpleados, 'id_Empleado', false);

                        $scope.NominaEmpleadosGridOptions.api.setRowData($scope.ObjetoNominaEmpleados);
                        $timeout(function () {
                            $scope.NominaEmpleadosGridOptions.api.sizeColumnsToFit();
                        }, 200);
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.RegistrarFacturacionServicios = function () {
        if ($scope.ValidarDatosPagos()) {
            SPAService._registrarFacturacionServicios($scope.AplicacionPagos)
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Transacción registrada correctamente', '', $scope.toastrOptions);
                            $scope.ConsultarProductos();
                            $scope.LimpiarDatos();
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
                        $scope.Clientes = $filter('orderBy')($scope.Clientes, 'id_Cliente', false);
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
                        $scope.ProductosMaster = [];
                        $scope.ProductosMaster = result.data;

                        $scope.Productos = angular.copy($scope.ProductosMaster);
                        $scope.Productos.push({ id_Producto: -1, nombre: '[Seleccione]' });
                        $scope.Productos = $filter('orderBy')($scope.Productos, 'id_Producto', false);
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

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
                            .Where(function (x) { return x.nombre === "VENTA" })
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

    $scope.ConsultarNominaEmpleadoServicios = function (data) {
        let idEmpresa = data.id_Empresa;
        let idEmpleado = data.id_Empleado;
        let fechaNomina = $filter('date')(angular.copy($scope.FechaNomina), 'yyyy-MM-dd');
        let nombreApellidoEmpleado = data.nombres + ' ' + data.apellidos;

        SPAService._consultarNominaEmpleadoServicios(idEmpresa, idEmpleado, fechaNomina)
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.EmpleadoServicios = [];
                        $scope.EmpleadoServicios = result.data;
                        $scope.EmpleadoServicios = $filter('orderBy')($scope.EmpleadoServicios, 'id_Agenda', false);
                        $scope.NominaEmpleadoServiciosGridOptions.api.setRowData($scope.EmpleadoServicios);
                        $scope.AccionNominaEmpleadoServicios = 'Servicios realizados por ' + nombreApellidoEmpleado;
                        $scope.ModalNominaServicios();

                        $timeout(function () {
                            $scope.NominaEmpleadoServiciosGridOptions.api.sizeColumnsToFit();
                        }, 200);
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarEmpleadoPrestamos = function (data) {
        let idEmpresa = data.id_Empresa;
        let idEmpleado = data.id_Empleado;
        let nombreApellidoEmpleado = data.nombres + ' ' + data.apellidos;

        SPAService._consultarEmpleadoPrestamos(idEmpresa, idEmpleado)
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        if (result.data.length > 0) {
                            $scope.EmpleadoPrestamos = [];
                            $scope.EmpleadoPrestamos = result.data;
                            $scope.EmpleadoPrestamos = $filter('orderBy')($scope.EmpleadoPrestamos, 'fecha', false);
                            $scope.EmpleadoPrestamosGridOptions.api.setRowData($scope.EmpleadoPrestamos);
                            $scope.AccionEmpleadoPrestamos = 'Prestamos asignados a ' + nombreApellidoEmpleado;
                            $scope.ModalEmpleadoPrestamos();
                            $timeout(function () {
                                $scope.EmpleadoPrestamosGridOptions.api.sizeColumnsToFit();
                            }, 200);
                        } else {
                            toastr.info('El empleado seleccionado no tiene prestamos asignados', '', $scope.toastrOptions);
                        }
                        
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarServiciosAgenda = function () {
        if ($scope.ValidarDatosConsulta()) {
            SPAService._consultarAgenda($scope.Agenda)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.Agendas = [];
                            $scope.ObjetoAgendas = [];
                            $scope.Agendas = result.data;
                            $scope.ObjetoAgendas = angular.copy($scope.Agendas);
                            $scope.ServiciosAgendaGridOptions.api.setRowData($scope.ObjetoAgendas);
                            $timeout(function () {
                                $scope.ServiciosAgendaGridOptions.api.sizeColumnsToFit();
                            }, 200);
                        }

                        if ($scope.Agendas.length === 0) {
                            toastr.info('La busqueda no arrojó resultados', '', $scope.toastrOptions);
                            return;
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    $scope.ConsultarCajaMenor = function () {
        SPAService._consultarCajaMenor($scope.IdEmpresa)
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.Caja_Menor = [];
                        $scope.Caja_Menor = result.data;

                        $scope.AcumuladoCajaMenor = $scope.Caja_Menor.acumulado;
                    }
                    else {
                        $scope.AcumuladoCajaMenor = 0;
                        toastr.info('Debe configurar la caja menor', '', $scope.toastrOptions);
                    } 
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ServiciosAgendaGridOptionsColumns = [
        {
            headerName: "", field: "Checked", suppressFilter: true, width: 30, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
        },
        {
            headerName: "Servicio", field: 'nombre_Servicio', width: 200, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Valor", field: 'valor_Servicio', width: 80, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
        },
        {
            headerName: "Cliente:", field: 'nombreApellido_Cliente', width: 140, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Atendido Por:", field: 'nombreApellido_Empleado', width: 140, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Hora Inicio", field: 'fechaInicio', width: 90, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
        },
        {
            headerName: "Hora Fin", field: 'fechaFin', width: 90, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
        },
        {
            headerName: "Observaciones", field: 'observaciones', width: 200, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        }
    ];

    $scope.ServiciosAgendaGridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: $scope.ServiciosAgendaGridOptionsColumns,
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

    $scope.ProductosTransaccionGridOptionsColumns = [
        {
            headerName: "", field: "", suppressMenu: true, visible: true, width: 30, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
            cellRenderer: function () {
                return "<i data-ng-click='showConfirmEliminarProducto($event,data)' id='gridTooltip' data-toggle='tooltip' title='Retornar Producto' class='material-icons' style='font-size:20px;margin-top:-1px;color:lightslategrey;'>delete_sweep</i>";
            },
        },
        {
            headerName: "Producto", field: 'nombre', width: 280, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Precio", field: 'Precio', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
        },
        {
            headerName: "Cantidad", field: 'Cantidad', width: 100, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
        },
        {
            headerName: "Total", field: 'Total', width: 140, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
        }
    ];

    $scope.ProductosTransaccionGridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: $scope.ProductosTransaccionGridOptionsColumns,
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
        rowSelection: 'single'
    }

    $scope.NominaEmpleadosGridOptionsColumns = [

        {
            headerName: "", field: "Checked", suppressFilter: true, width: 30, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" },
        },
        {
            headerName: "", field: "", colId: 'Consultar Servicios', suppressMenu: true, visible: true,  width: 50, cellStyle: { 'display':'flex', 'justify-content': 'center', 'cursor': 'pointer' },
            cellRenderer: function (params) {
                let tipoNomina = params.data.tipo_Nomina;
                if (tipoNomina === 'POR_SERVICIOS')
                    return "<i data-ng-click='ConsultarNominaEmpleadoServicios(data)' data-toggle='tooltip' title='Consultar Servicios' class='material-icons' style='font-size:20px; margin-left:5px; margin-top:-1px; color:lightslategrey;'>assignment</i>";
                else
                    return
            },
        },
        {
            headerName: "", field: "", colId: 'Consultar Prestamos', suppressMenu: true, visible: true, width: 50, cellStyle: { 'display': 'flex', 'justify-content': 'center', 'cursor': 'pointer' },
            cellRenderer: function () {
                return "<i data-ng-click='ConsultarEmpleadoPrestamos(data)' data-toggle='tooltip' title='Consultar Prestamos' class='material-icons' style='font-size:20px; margin-left:2px; margin-top:-1px; color:lightslategrey;'>monetization_on</i>";
            },
        },
        {
            headerName: "Nombres(s)", field: 'nombres', width: 220, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Apellido(s)", field: 'apellidos', width: 220, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Servicios", field: 'servicios', width: 180, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
        },
        {
            headerName: "Salario / % ", field: 'salario', width: 180, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: decimalFormatter
        },
        {
            headerName: "Subtotal", field: 'total_Aplicado', width: 180, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#212121', 'background': 'RGBA(210,216,230,0.75)', 'font-weight': 'bold', 'border-bottom': '1px dashed #212121', 'border-right': '1px dashed #212121', 'border-left': '1px dashed #212121' }, valueFormatter: currencyFormatter
        },
        {
            headerName: "Préstamos", field: 'prestamos', width: 180, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
        },
        {
            headerName: "Total a Pagar", field: 'total_Pagar', width: 180, cellStyle: function (params) {
                if (params.value < 0) {
                    return { 'color': 'red', 'text-align': 'right', 'cursor': 'pointer', 'font-weight': '600' };
                } else {
                    return { 'color': 'green', 'text-align': 'right', 'cursor': 'pointer', 'font-weight': '600' };
                }
            }, valueFormatter: currencyFormatter
        }
    ];

    $scope.NominaEmpleadosGridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: $scope.NominaEmpleadosGridOptionsColumns,
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
        suppressRowClickSelection: true
    }

    $scope.NominaEmpleadoServiciosGridOptionsColumns = [
        {
            headerName: "Servicio", field: 'nombre_Servicio', width: 350, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Valor", field: 'valor_Servicio', width: 140, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#212121', 'background': 'RGBA(210,216,230,0.75)', 'font-weight': 'bold', 'border-bottom': '1px dashed #212121', 'border-right': '1px dashed #212121', 'border-left': '1px dashed #212121' }, valueFormatter: currencyFormatter
        },
        {
            headerName: "Fecha", field: 'fecha_Inicio', width: 150, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, valueFormatter: dateFormatter
        },
        {
            headerName: "Hora Inicio", field: 'fecha_Inicio', width: 150, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, valueFormatter: hourFormatter
        },
        {
            headerName: "Hora Fin", field: 'fecha_Fin', width: 150, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, valueFormatter: hourFormatter
        }
    ];

    $scope.NominaEmpleadoServiciosGridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: $scope.NominaEmpleadoServiciosGridOptionsColumns,
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
        suppressRowClickSelection: true
    }

    $scope.EmpleadoPrestamosGridOptionsColumns = [
        {
            headerName: "Descripción", field: 'descripcion', width: 300, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Valor", field: 'valor', width: 100, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#212121', 'background': 'RGBA(210,216,230,0.75)', 'font-weight': 'bold', 'border-bottom': '1px dashed #212121', 'border-right': '1px dashed #212121', 'border-left': '1px dashed #212121' }, valueFormatter: currencyFormatter
        },
        {
            headerName: "Fecha", field: 'fecha', width: 100, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, valueFormatter: dateFormatter
        }
    ];

    $scope.EmpleadoPrestamosGridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: $scope.EmpleadoPrestamosGridOptionsColumns,
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
        suppressRowClickSelection: true
    }

    $scope.ValidarDatosConsulta = function () {
        try {
            if ($scope.FechaBusqueda === '' || $scope.FechaBusqueda === null || $scope.FechaBusqueda === undefined) {
                toastr.warning('Formato de fecha inválido. Debe seleccionar una fecha', '', $scope.toastrOptions);
                $('#dpFechaBusqueda').focus();
                return false;
            }
            $scope.Agenda.Fecha_Inicio = angular.copy($scope.FechaBusqueda);
            $scope.Agenda.Fecha_Inicio = new Date($scope.Agenda.Fecha_Inicio + 'Z');
            $scope.Agenda.Fecha_Fin = angular.copy($scope.FechaBusqueda);
            $scope.Agenda.Fecha_Fin = new Date($scope.Agenda.Fecha_Fin + 'Z');

            $scope.Agenda.Id_Empleado = -1;
            $scope.Agenda.Id_Servicio = -1;
            $scope.Agenda.Estado = 'CONFIRMADA';

            if ($scope.ClienteSeleccionado === '' || $scope.ClienteSeleccionado === null || $scope.ClienteSeleccionado === undefined) {
                toastr.info('Debe seleccionar un cliente', '', $scope.toastrOptions);
                $timeout(function () {
                    angular.element(document.getElementById('acClientes')).find('input').focus();
                }, 200);
                return false;
            }

            $scope.Agenda.Id_Cliente = $scope.ClienteSeleccionado.id_Cliente;

            return true;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarDatosPagos = function () {
        if ($scope.ClienteSeleccionado === null || $scope.ClienteSeleccionado === undefined) {
            toastr.warning('Debe seleccionar un cliente.', '', $scope.toastrOptions);
            $timeout(function () {
                angular.element(document.getElementById('acClientes')).find('input').focus();
            }, 200);
            return false;
        }

        if ($scope.ObjetoAgendasSeleccionadas === undefined || $scope.ObjetoAgendasSeleccionadas.length === 0 || $scope.ObjetoAgendasSeleccionadas === null) {
            toastr.warning('Debe seleccionar al menos un servicio a procesar', '', $scope.toastrOptions);
            return false;
        }

        if ($scope.DescuentoTransaccion > $scope.SubtotalTransaccion) {
            toastr.warning('El descuento no puede ser mayor al subtotal de la transacción', '', $scope.toastrOptions);
            $('#txtDescuento').focus();
            return false;
        }

        $scope.Servicios = [];

        $scope.Servicios = $scope.ObjetoAgendasSeleccionadas.map(function (e) {
            return { Id_Agenda: e.id_Agenda, Estado: 'FACTURADA', Id_Empresa: $scope.IdEmpresa }
        });

        $scope.Transacciones = [];

        $scope.Transacciones = $scope.ObjetoProductosGrid.map(function (e) {
            return { Id_Transaccion: -1, Fecha: new Date($scope.FechaBusqueda + 'Z'), Id_Producto: e.Id_Producto, Cantidad: e.Cantidad, Id_TipoTransaccion: $scope.TipoTransaccionSeleccionada, Id_EmpleadoCliente: $scope.ClienteSeleccionado.id_Cliente, Id_Empresa: $scope.IdEmpresa }
        });

        $scope.ClientePago.Id_Cliente = $scope.ClienteSeleccionado.id_Cliente;
        $scope.ClientePago.Fecha = new Date($scope.FechaBusqueda + 'Z');
        $scope.ClientePago.SubTotal = $scope.SubtotalTransaccion;

        if ($scope.DescuentoTransaccion === '' || $scope.DescuentoTransaccion === null || $scope.DescuentoTransaccion === undefined)
            $scope.ClientePago.Descuento = 0;
        else
            $scope.ClientePago.Descuento = parseFloat($scope.DescuentoTransaccion);

        $scope.ClientePago.Total = $scope.TotalTransaccion;

        $scope.AplicacionPagos = {
            Agendas: $scope.Servicios,
            Transacciones: $scope.Transacciones,
            Cliente_Pago: $scope.ClientePago
        }

        return true;
    }

    $scope.showConfirmDescuento = function (ev, data) {
        try {
            if ($scope.DescuentoTransaccion > 0) {
                let confirm = $mdDialog.confirm()
                    .title('Confirmar Descuento')
                    .textContent('¿Desea aplicar el descuento?')
                    .ariaLabel('Confirmar Descuento')
                    .targetEvent(ev, data)
                    .ok('Sí')
                    .cancel('No')
                    .multiple(true);

                $mdDialog.show(confirm).then(function () {
                    $scope.RegistrarFacturacionServicios();
                }, function () {
                    $('#txtDescuento').focus();
                });
            } else {
                $scope.RegistrarFacturacionServicios();
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.showConfirmEliminarProducto = function (ev, data) {
        try {
            let confirm = $mdDialog.confirm()
                .title('Venta de Productos')
                .textContent('¿Desea retornar el producto?')
                .ariaLabel('Retornar Producto')
                .targetEvent(ev, data)
                .ok('Sí')
                .cancel('No')
                .multiple(true);
            $mdDialog.show(confirm).then(function () {
                $scope.EliminarProductoGrilla(ev, data);
            }, function () {
            });
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.LimpiarProductos = function () {
        $scope.ProductoGrid = {
            Id_Producto: -1,
            Precio: 0,
            Cantidad: 0,
            Total: 0
        }
        $scope.ProductoSeleccionado = -1;
        $scope.InventarioProducto = 0;
        $scope.PrecioProducto = 0;
        $scope.CantidadInsumo = '';
    }

    $scope.LimpiarDatos = function () {
        $scope.ClienteSeleccionado = null;
        $scope.FechaBusqueda = new Date(new Date().setHours(0, 0, 0, 0));
        $scope.fActiveTab = 'Facturar Servicios';
        $scope.InventarioProducto = 0;
        $scope.PrecioProducto = 0;
        $scope.CantidadInsumo = 0;
        $scope.SubtotalTransaccion = 0;
        $scope.TipoClienteTransaccion = '';
        $scope.TotalTransaccion = 0;
        $scope.DescuentoTransaccion = 0;
        $scope.TotalProductos = 0;
        $scope.TotalServicios = 0;

        $scope.Agenda = {
            Id_Agenda: -1,
            Id_Empresa: $scope.IdEmpresa,
            Id_Cliente: '',
            Id_Empleado: '',
            Id_Servicio: '',
            Fecha_Inicio: new Date(),
            Fecha_Fin: '',
            Estado: 'CONFIRMADA',
            Observaciones: '',
            Traer_Canceladas: false
        };

        $scope.ProductoGrid = {
            Id_Producto: -1,
            Precio: 0,
            Cantidad: 0,
            Total: 0
        }

        $scope.ClientePago = {
            Id_ClientePago: '00000000-0000-0000-0000-000000000000',
            Id_Cliente: -1,
            Subtotal: 0,
            Descuento: 0,
            Total: 0,
            Id_Empresa: $scope.IdEmpresa
        }

        $scope.ProductoSeleccionado = -1;

        $scope.ObjetoProductosGrid = [];
        $scope.ObjetoAgendasSeleccionadas = [];
        $scope.ProductosTransaccionGridOptions.api.setRowData($scope.ObjetoProductosGrid);
        $timeout(function () {
            $scope.ProductosTransaccionGridOptions.api.sizeColumnsToFit();
        }, 200);

        $scope.ObjetoAgendas = [];
        $scope.ServiciosAgendaGridOptions.api.setRowData($scope.ObjetoAgendas);
        $timeout(function () {
            $scope.ServiciosAgendaGridOptions.api.sizeColumnsToFit();
        }, 200);

        $timeout(function () {
            angular.element(document.getElementById('acClientes')).find('input').focus();
        }, 200);
    }

    $scope.AgregarProductoGrilla = function () {
        try {
            if ($scope.ProductoSeleccionado === -1) {
                toastr.info('Debe seleccionar un producto', '', $scope.toastrOptions);
                $('#slProductos').focus();
                return;
            }

            if ($scope.CantidadInsumo === '' || $scope.CantidadInsumo === null || $scope.CantidadInsumo === undefined || parseInt($scope.CantidadInsumo) === 0) {
                toastr.info('Debe ingresar la cantidad del producto', '', $scope.toastrOptions);
                $('#txtCantidadInsumo').focus();
                return;
            }

            if ($scope.InventarioProducto < $scope.CantidadInsumo) {
                toastr.info('La cantidad del producto excede en número a la disponible en el inventario', '', $scope.toastrOptions);
                $('#txtCantidadInsumo').focus();
                return;
            }

            let idProducto = $scope.ProductoSeleccionado;
            let cantidad = parseInt($scope.CantidadInsumo);
            let precioProducto = $scope.PrecioProducto;
            let total = cantidad * precioProducto;
            let sumaProductosGrilla = 0;

            let tempProducto = $scope.Productos.filter(function (e) {
                return e.id_Producto === idProducto;
            });
            let nombreProducto = tempProducto[0].nombre;

            $scope.ProductoGrid.Id_Producto = idProducto;
            $scope.ProductoGrid.nombre = nombreProducto;
            $scope.ProductoGrid.Cantidad = cantidad;
            $scope.ProductoGrid.Precio = precioProducto;
            $scope.ProductoGrid.Total = total;

            for (let i = 0; i < $scope.Productos.length; i++) {
                if ($scope.Productos[i].id_Producto === idProducto) {
                    $scope.Productos[i].inventario -= cantidad;
                }
            }

            let tempObjetoProductosGrid = $scope.ObjetoProductosGrid.filter(function (e) {
                return e.Id_Producto === idProducto;
            });

            if (tempObjetoProductosGrid.length > 0) {
                for (let i = 0; i < $scope.ObjetoProductosGrid.length; i++) {
                    if ($scope.ObjetoProductosGrid[i].Id_Producto === idProducto) {
                        $scope.ObjetoProductosGrid[i].Cantidad = parseFloat($scope.ObjetoProductosGrid[i].Cantidad) + parseFloat(cantidad);
                        $scope.ObjetoProductosGrid[i].Total += total;
                    }
                }
            } else {
                $scope.ObjetoProductosGrid.push($scope.ProductoGrid);
            }

            $scope.ProductosTransaccionGridOptions.api.setRowData($scope.ObjetoProductosGrid);
            $timeout(function () {
                $scope.ProductosTransaccionGridOptions.api.sizeColumnsToFit();
            }, 200);

            $scope.TotalProductos = $filter('decimalParseAmount')($filter("mathOperation")($scope.ObjetoProductosGrid, { property: "Total", operation: "+" }), '2', $scope);

            $scope.SubtotalTransaccion = parseFloat($scope.TotalServicios) + parseFloat($scope.TotalProductos);
            $scope.TotalTransaccion = angular.copy($scope.SubtotalTransaccion);

            $scope.LimpiarProductos();
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.EliminarProductoGrilla = function (e, data) {
        try {
            let sumaProductosGrilla = 0;
            let idProducto = data.Id_Producto;
            let cantidad = parseInt(data.Cantidad);
            let total = data.Total;

            if (data !== undefined && data !== null) {
                $scope.ObjetoProductosGrid = $scope.ObjetoProductosGrid.filter(function (e) {
                    return e.Id_Producto !== idProducto;
                });

                for (let i = 0; i < $scope.Productos.length; i++) {
                    if ($scope.Productos[i].id_Producto === idProducto) {
                        $scope.Productos[i].inventario = parseInt($scope.Productos[i].inventario) + parseInt(cantidad);
                    }
                }

                $scope.TotalProductos = $filter('decimalParseAmount')($filter("mathOperation")($scope.ObjetoProductosGrid, { property: "Total", operation: "+" }), '2', $scope);

                $scope.SubtotalTransaccion = parseFloat($scope.TotalServicios) + parseFloat($scope.TotalProductos);
                $scope.TotalTransaccion = angular.copy($scope.SubtotalTransaccion);

                $scope.ProductosTransaccionGridOptions.api.setRowData($scope.ObjetoProductosGrid);

                $timeout(function () {
                    $scope.ProductosTransaccionGridOptions.api.sizeColumnsToFit();
                }, 200);

                $scope.LimpiarProductos();
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.BuscarCliente = function (nombre) {
        try {
            let busqueda = '';
            busqueda = $filter('filter')($scope.Clientes, { 'nombres': nombre });
            return busqueda;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ConsultarInventario = function (inventario) {
        try {
            $scope.InventarioProducto = 0;
            $scope.PrecioProducto = 0;
            if ($scope.ProductoSeleccionado === -1) {
                $scope.InventarioProducto = 0;
                $scope.PrecioProducto = 0;
                return;
            }
            let filtrarEntrada = Enumerable.From($scope.Productos)
                .Where(function (x) { return x.id_Producto === inventario })
                .ToArray();
            $scope.InventarioProducto = filtrarEntrada[0].inventario;
            $scope.PrecioProducto = filtrarEntrada[0].precio;
            $scope.$broadcast('productChanged');
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.SetPerfilCliente = function () {
        try {
            if ($scope.ClienteSeleccionado !== null && $scope.ClienteSeleccionado !== undefined) {
                let tempCliente = [];
                let tipoCliente = '';
                tempCliente = $scope.Clientes.filter(function (e) {
                    return e.id_Cliente === $scope.ClienteSeleccionado.id_Cliente;
                });

                tipoCliente = tempCliente[0].tipo_Cliente;
                $scope.TipoClienteTransaccion = tipoCliente;
            }
            else
                $scope.TipoClienteTransaccion = '';
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalNominaServicios = function () {
        try {
            $mdDialog.show({
                contentElement: '#dlgNominaEmpleadoServicios',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true,
            })
                .then(function () {
                }, function () {                    
                });
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalEmpleadoPrestamos = function () {
        try {
            $mdDialog.show({
                contentElement: '#dlgEmpleadoPrestamos',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true,
            })
                .then(function () {
                }, function () {                    
                });
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    function OnRowSelected(event) {
        try {
            let total = 0;

            let checked = event.node.selected;
            $scope.ObjetoAgendasSeleccionadas = [];
            $scope.ObjetoAgendasSeleccionadas = $scope.ServiciosAgendaGridOptions.api.getSelectedRows();

            if ($scope.ObjetoAgendasSeleccionadas.length > 0) {
                $scope.TotalServicios = $filter('decimalParseAmount')($filter("mathOperation")($scope.ObjetoAgendasSeleccionadas, { property: "valor_Servicio", operation: "+" }), '2', $scope);
            } else {
                $scope.TotalServicios = 0;
            }

            $scope.$apply(function () {
                $scope.SubtotalTransaccion = parseFloat($scope.TotalServicios) + parseFloat($scope.TotalProductos);
                $scope.TotalTransaccion = angular.copy($scope.SubtotalTransaccion);
            });
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ResetearGrids = function () {
        $scope.Agendas = [];
        $scope.ServiciosAgendaGridOptions.api.setRowData($scope.Agendas);

        $scope.ObjetoNominaEmpleados = [];
        $scope.NominaEmpleadosGridOptions.api.setRowData($scope.ObjetoNominaEmpleados);
    }

    function currencyFormatter(params) {
        let valueGrid = params.value;
        return $filter('currency')(valueGrid, '$', 0);
    }

    function decimalFormatter(params) {
        if (params.value <= 1) {
            let valueGrid = params.value;
            return $filter('currency')(valueGrid, '', 2);
        }
        else {
            let valueGrid = params.value;
            return $filter('currency')(valueGrid, '$', 0);
        }
    }

    function dateFormatter(params) {
        let valueGrid = params.value;
        return $filter('date')(valueGrid, 'dd-MM-yyyy');
    }

    function hourFormatter(params) {
        let valueGrid = params.value;
        return $filter('date')(valueGrid, 'h:mm a');
    }

    $scope.$watch("DescuentoTransaccion", function (oldValue, newValue) {
        if (oldValue !== newValue) {
            $scope.TotalTransaccion = $scope.SubtotalTransaccion - $scope.DescuentoTransaccion;
        }
    });

    $scope.Cancelar = function () {
        $mdDialog.cancel();
    };

    window.onresize = function () {
        $timeout(function () {
            $scope.ServiciosAgendaGridOptions.api.sizeColumnsToFit();
            $scope.ProductosTransaccionGridOptions.api.sizeColumnsToFit();
            $scope.NominaEmpleadosGridOptions.api.sizeColumnsToFit();
        }, 300);
    }

    $scope.$on("CompanyChange", function () {
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.LimpiarDatos();
        $scope.ConfiguracionEmpresaActual();
        $scope.ConsultarClientes();
        $scope.ConsultarProductos();
        $scope.ConsultarTipoTransacciones();
        $scope.ConsultarCajaMenor();
        $scope.Inicializacion();
        $scope.ResetearGrids();
    });

    $timeout(function () {
        window.onresize();
        $scope.ConfiguracionEmpresaActual();
        $scope.ConsultarClientes();
        $scope.ConsultarProductos();
        $scope.ConsultarTipoTransacciones();
        $scope.ConsultarCajaMenor();
        $scope.Inicializacion();
        angular.element(document.getElementById('acClientes')).find('input').focus();
    }, 200);
}