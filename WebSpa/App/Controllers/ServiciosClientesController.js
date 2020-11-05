angular.module('app.controllers')
    .controller("ServiciosClientesController", ServiciosClientesController);

ServiciosClientesController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

function ServiciosClientesController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
    $rootScope.header = 'SPA Management - Servicios por Cliente';
    $scope.IdEmpresa = $rootScope.Id_Empresa;
    $scope.ServiciosCliente = [];

    $scope.Agenda = {
        Id_Cliente: -1,
        Id_Servicios: [],
        Fecha_Desde: null,
        Fecha_Hasta: null,
        Id_Empresa: $scope.IdEmpresa
    }
    
    $scope.FechaDesde =  new Date();
    $scope.FechaHasta =  new Date();

    $scope.Inicializacion = function () {
        $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
    }

    $scope.ConsultarServiciosCliente = function () {
        if ($scope.ValidarDatosBusqueda()) {            
            SPAService._consultarServiciosCliente($scope.Agenda)
                .then(
                    function (result) {                        
                        if (result.data !== undefined && result.data !== null && result.data.length > 0) {
                            $scope.Agendas = [];
                            $scope.Agendas = result.data;
                            $scope.Agendas = $filter('orderBy')($scope.Agendas, 'id_Agenda', false);
                            $scope.LimpiarDatos();

                            $scope.ServiciosClienteGridOptions.api.setRowData($scope.Agendas);

                            $timeout(function () {
                                $scope.ServiciosClienteGridOptions.api.sizeColumnsToFit();
                            }, 200);
                            $timeout(function () {
                                angular.element(document.getElementById('acClientes')).find('input').focus();
                            }, 200);

                        } else {
                            $scope.LimpiarDatos();
                            $scope.ResetearGrids();
                            $timeout(function () {
                                angular.element(document.getElementById('acClientes')).find('input').focus();
                            }, 200);
                            toastr.info('La busqueda no arrojó resultados', '', $scope.toastrOptions);                            
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    $scope.ConsultarServicios = function () {
        SPAService._consultarServiciosActivos($scope.IdEmpresa)
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

    $scope.ServiciosClienteGridOptionsColumns = [
        {
            headerName: "", field: "Checked", suppressFilter: true, width: 30, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
        },
        {
            headerName: "Servicio", field: 'nombre_Servicio', width: 200, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Valor", field: 'valor_Servicio', width: 80, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#445a9e', 'font-weight': 'bold' }, valueFormatter: currencyFormatter
        },
        {
            headerName: "Fecha", field: 'fecha_Inicio', width: 110, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, valueFormatter: dateFormatter
        },
        {
            headerName: "Hora Inicio", field: 'fechaInicio', width: 110, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' },
        },
        {
            headerName: "Hora Fin", field: 'fechaFin', width: 110, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' },
        },
        {
            headerName: "Empleado", field: 'nombreApellido_Empleado', width: 140, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        }

    ];

    $scope.ServiciosClienteGridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: $scope.ServiciosClienteGridOptionsColumns,
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
        onRowSelected: OnRowSelectedAgendas
    }

    $scope.LimpiarDatos = function () {
        $scope.Agenda = {
            Id_Cliente: -1,
            Id_Servicios: [],
            Fecha_Desde: null,
            Fecha_Hasta: null,
            Id_Empresa: $scope.IdEmpresa
        }
        
        $scope.ServiciosCliente = [];
    }

    $scope.ResetearData = function () {
        $scope.Agenda = {
            Id_Cliente: -1,
            Id_Servicios: [],
            Fecha_Desde: null,
            Fecha_Hasta: null,
            Id_Empresa: $scope.IdEmpresa
        }

        $scope.ServiciosCliente = [];
        $scope.ClienteSeleccionado = null;
        $scope.FechaDesde = new Date();
        $scope.FechaHasta = new Date();
        $scope.ServiciosSeleccionados = [];
        $scope.ObjetoAgendasSeleccionadas = [];
        $scope.Agendas = [];

    }

    $scope.ResetearGrids = function () {
        $scope.ServiciosCliente = [];
        $scope.ServiciosClienteGridOptions.api.setRowData($scope.ServiciosCliente);
        $timeout(function () {
            $scope.ServiciosClienteGridOptions.api.sizeColumnsToFit();
        }, 200);
    }    

    $scope.ValidarDatosBusqueda = function () {
        if ($scope.FechaDesde === null || $scope.FechaDesde === undefined || $scope.FechaDesde === '') {
            toastr.warning('Formato de fecha incorrecto. Debe seleccionar una fecha válida', '', $scope.toastrOptions);
            $timeout(function () {
                angular.element(document.getElementById('dpFechaDesde')).find('input').focus();
            }, 200);
            return false;
        }        

        if ($scope.FechaHasta === null || $scope.FechaHasta === undefined || $scope.FechaHasta === '') {
            toastr.warning('Formato de fecha incorrecto. Debe seleccionar una fecha válida', '', $scope.toastrOptions);
            $timeout(function () {
                angular.element(document.getElementById('dpFechaHasta')).find('input').focus();
            }, 200);
            return false;
        }

        let fechaDesde = parseInt($filter('date')(new Date($scope.FechaDesde), 'yyyyMMdd'));
        let fechaHasta = parseInt($filter('date')(new Date($scope.FechaHasta), 'yyyyMMdd'));
        
        if (fechaDesde > fechaHasta) {
            toastr.info('Rango de fecha inválido', '', $scope.toastrOptions);
            $timeout(function () {
                angular.element(document.getElementById('dpFechaDesde')).find('input').focus();
            }, 200);
            return false;
        }

        let _diasLimite = new Date($scope.FechaHasta);
        _diasLimite.setDate(_diasLimite.getDate() - 5);

        if ($filter('date')($scope.FechaDesde, 'yyyy/MM/dd') < $filter('date')(_diasLimite, 'yyyy/MM/dd')) {
            if ($scope.ClienteSeleccionado === '' || $scope.ClienteSeleccionado === null || $scope.ClienteSeleccionado === undefined) {
                toastr.info('Para un rango mayor a 5 días debe seleccionar un cliente', '', $scope.toastrOptions);
                $timeout(function () {
                    angular.element(document.getElementById('acClientes')).find('input').focus();
                }, 200);
                return false;
            }
        }

        $scope.Agenda.Fecha_Desde = $scope.FechaDesde;
        $scope.Agenda.Fecha_Hasta = $scope.FechaHasta;

        if ($scope.ClienteSeleccionado === '' || $scope.ClienteSeleccionado === null || $scope.ClienteSeleccionado === undefined)
            $scope.Agenda.Id_Cliente = -1;
        else
            $scope.Agenda.Id_Cliente = $scope.ClienteSeleccionado.id_Cliente;
        
        if ($scope.ServiciosCliente === undefined || $scope.ServiciosCliente === null || $scope.ServiciosCliente.length === 0) {
            $scope.Agenda.Id_Servicios = null;
        } else
            $scope.Agenda.Id_Servicios = $scope.ServiciosCliente;
        
        return true;
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

    $scope.AsignarRemover = function (ServiciosSeleccionados) {
        try {
            if (ServiciosSeleccionados.length > 0)
                $scope.ServiciosCliente = ServiciosSeleccionados;
            else
                $scope.ServiciosCliente.splice($scope.ServiciosCliente.indexOf(ServiciosSeleccionados), 1);
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    function OnRowSelectedAgendas(event) {
        try {

            $scope.ObjetoAgendasSeleccionadas = [];
            $scope.ObjetoAgendasSeleccionadas = $scope.ServiciosClienteGridOptions.api.getSelectedRows();            

        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ExportarArchivo = function () {
        try {
            if ($scope.Agendas !== null && $scope.Agendas !== undefined && $scope.Agendas.length > 0) {

                alasql.fn.datetime = function (dateStr) {                    
                    let date = $filter('date')(new Date(), 'dd-MM-yyyy');
                    return date.toLocaleString();
                };

                alasql.fn.currencyFormatter = function (currencyStr) {
                    let currency = $filter('currency')(currencyStr, '$', 0);
                    return currency.toLocaleString();
                }

                let agendas = [];
                
                if ($scope.ObjetoAgendasSeleccionadas !== undefined && $scope.ObjetoAgendasSeleccionadas !== null && $scope.ObjetoAgendasSeleccionadas.length > 0)
                    agendas = $scope.ObjetoAgendasSeleccionadas;
                else
                    agendas = $scope.Agendas;

                let mystyle = {
                    sheetid: 'Cliente Servicios',
                    headers: true,
                    columns: [
                        { columnid: 'nombre_Servicio', title: 'SERVICIO', width: 300 },
                        { columnid: 'valor_Servicio', title: 'VALOR', width: 150 },
                        { columnid: 'fecha_Inicio', title: 'FECHA', width: 150 },
                        { columnid: 'fechaInicio', title: 'HORA INICIO', width: 150 },
                        { columnid: 'fechaFin', title: 'HORA FIN', width: 150 },
                        { columnid: 'nombreApellido_Empleado', title: 'EMPLEADO', width: 150 }
                    ]
                };

                alasql('SELECT nombre_Servicio AS SERVICIO, valor_Servicio AS VALOR_SERVICIO, datetime(fecha_Inicio) AS FECHA, fechaInicio AS HORA_INICIO, fechaFin AS HORA_FIN, nombreApellido_Empleado AS EMPLEADO INTO XLSX("Servicios_cliente.xlsx",?) FROM ?', [mystyle, agendas]);
            } else {
                toastr.info('No hay datos para exportar', '', $scope.toastrOptions);
            }

        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
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

    window.onresize = function () {
        $timeout(function () {
            $scope.ServiciosClienteGridOptions.api.sizeColumnsToFit();            
        }, 300);
    }

    $scope.$on("CompanyChange", function () {
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.ConsultarClientes();
        $scope.ConsultarServicios();
        $scope.ResetearData();
        $scope.ResetearGrids();
        $scope.Inicializacion();        
    });

    $timeout(function () {
        window.onresize();        
        $scope.ConsultarClientes();
        $scope.ConsultarServicios();
        $scope.Inicializacion();
        angular.element(document.getElementById('acClientes')).find('input').focus();
    }, 200);
}