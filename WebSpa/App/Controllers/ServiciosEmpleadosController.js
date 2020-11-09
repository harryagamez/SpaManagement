angular.module('app.controllers')
    .controller("ServiciosEmpleadosController", ServiciosEmpleadosController);

ServiciosEmpleadosController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

function ServiciosEmpleadosController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
    $rootScope.header = 'Reportes - Servicios por Empleado';
    $scope.IdEmpresa = $rootScope.Id_Empresa;

    $scope.ServiciosEmpleado = [];

    $scope.Agenda = {
        Id_Empleado: -1,
        Id_Servicios: [],
        Fecha_Desde: null,
        Fecha_Hasta: null,
        Id_Empresa: $scope.IdEmpresa
    }

    $scope.FechaDesde = new Date();
    $scope.FechaHasta = new Date();

    $scope.Inicializacion = function () {
        $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
    }

    $scope.ConsultarServiciosEmpleado = function () {
        if ($scope.ValidarDatosBusqueda()) {
            SPAService._consultarServiciosEmpleado($scope.Agenda)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null && result.data.length > 0) {
                            $scope.Agendas = [];
                            $scope.Agendas = result.data;
                            $scope.Agendas = $filter('orderBy')($scope.Agendas, 'id_Agenda', false);
                            $scope.LimpiarDatos();

                            $scope.ServiciosEmpleadoGridOptions.api.setRowData($scope.Agendas);

                            $timeout(function () {
                                $scope.ServiciosEmpleadoGridOptions.api.sizeColumnsToFit();
                            }, 200);
                            $timeout(function () {
                                angular.element(document.getElementById('acEmpleados')).find('input').focus();
                            }, 200);

                        } else {
                            $scope.LimpiarDatos();
                            $scope.ResetearGrids();
                            $timeout(function () {
                                angular.element(document.getElementById('acEmpleados')).find('input').focus();
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

    $scope.ServiciosEmpleadoGridOptionsColumns = [
        {
            headerName: "", field: "Checked", suppressFilter: true, width: 30, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
        },
        {
            headerName: "Empleado", field: 'nombreApellido_Empleado', width: 140, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Servicio", field: 'nombre_Servicio', width: 200, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Estado Cita", field: 'estado', width: 140, cellStyle: function (params) {
                if (params.value === 'PROGRAMADA') {
                    return { 'background-color': '#e9e1cc', 'text-align': 'left', 'cursor': 'pointer', 'font-weight': 'bold' };
                } else if (params.value === 'CONFIRMADA') {
                    return { 'background-color': '#9dc', 'text-align': 'left', 'cursor': 'pointer', 'font-weight': 'bold' };
                } else if (params.value === 'FACTURADA') {
                    return { 'background-color': '#ffd', 'text-align': 'left', 'cursor': 'pointer', 'font-weight': 'bold' };
                } else if (params.value === 'LIQUIDADA') {
                    return { 'background-color': '#499977', 'text-align': 'left', 'cursor': 'pointer', 'font-weight': 'bold' };
                } else if (params.value === 'CANCELADA') {
                    return { 'background-color': '#c2dbdf', 'text-align': 'left', 'cursor': 'pointer', 'font-weight': 'bold' };
                }
            },
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
            headerName: "Cliente", field: 'nombreApellido_Cliente', width: 140, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        }

    ];

    $scope.ServiciosEmpleadoGridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: $scope.ServiciosEmpleadoGridOptionsColumns,
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
            Id_Empleado: -1,
            Id_Servicios: [],
            Fecha_Desde: null,
            Fecha_Hasta: null,
            Id_Empresa: $scope.IdEmpresa
        }

        $scope.ServiciosEmpleado = [];
    }

    $scope.ResetearData = function () {
        $scope.Agenda = {
            Id_Empleado: -1,
            Id_Servicios: [],
            Fecha_Desde: null,
            Fecha_Hasta: null,
            Id_Empresa: $scope.IdEmpresa
        }

        $scope.ServiciosEmpleado = [];
        $scope.EmpleadoSeleccionado = null;
        $scope.FechaDesde = new Date();
        $scope.FechaHasta = new Date();
        $scope.ServiciosSeleccionados = [];
        $scope.ObjetoAgendasSeleccionadas = [];
        $scope.Agendas = [];

    }

    $scope.ResetearGrids = function () {
        $scope.ServiciosEmpleado = [];
        $scope.ServiciosEmpleadoGridOptions.api.setRowData($scope.ServiciosEmpleado);
        $timeout(function () {
            $scope.ServiciosEmpleadoGridOptions.api.sizeColumnsToFit();
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
            if ($scope.EmpleadoSeleccionado === '' || $scope.EmpleadoSeleccionado === null || $scope.EmpleadoSeleccionado === undefined) {
                toastr.info('Para un rango mayor a 5 días debe seleccionar un empleado', '', $scope.toastrOptions);
                $timeout(function () {
                    angular.element(document.getElementById('acEmpleados')).find('input').focus();
                }, 200);
                return false;
            }
        }

        $scope.Agenda.Fecha_Desde = $scope.FechaDesde;
        $scope.Agenda.Fecha_Hasta = $scope.FechaHasta;

        if ($scope.EmpleadoSeleccionado === '' || $scope.EmpleadoSeleccionado === null || $scope.EmpleadoSeleccionado === undefined)
            $scope.Agenda.Id_Empleado = -1;
        else
            $scope.Agenda.Id_Empleado = $scope.EmpleadoSeleccionado.id_Empleado;

        if ($scope.ServiciosEmpleado === undefined || $scope.ServiciosEmpleado === null || $scope.ServiciosEmpleado.length === 0) {
            $scope.Agenda.Id_Servicios = null;
        } else
            $scope.Agenda.Id_Servicios = $scope.ServiciosEmpleado;

        return true;
    }

    $scope.BuscarEmpleado = function (nombre) {
        try {
            let busqueda = '';
            busqueda = $filter('filter')($scope.Empleados, { 'nombres': nombre });
            return busqueda;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.AsignarRemover = function (ServiciosSeleccionados) {
        try {
            if (ServiciosSeleccionados.length > 0)
                $scope.ServiciosEmpleado = ServiciosSeleccionados;
            else
                $scope.ServiciosEmpleado.splice($scope.ServiciosEmpleado.indexOf(ServiciosSeleccionados), 1);
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    function OnRowSelectedAgendas(event) {
        try {

            $scope.ObjetoAgendasSeleccionadas = [];
            $scope.ObjetoAgendasSeleccionadas = $scope.ServiciosEmpleadoGridOptions.api.getSelectedRows();

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
                    
                };

                alasql('SELECT nombreApellido_Empleado AS EMPLEADO, nombre_Servicio AS SERVICIO, estado AS ESTADO_CITA, datetime(fecha_Inicio) AS FECHA, fechaInicio AS HORA_INICIO, fechaFin AS HORA_FIN, nombreApellido_Cliente AS CLIENTE INTO XLSX("Servicios_empleado.xlsx",?) FROM ?', [mystyle, agendas]);
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
            $scope.ServiciosEmpleadoGridOptions.api.sizeColumnsToFit();
        }, 300);
    }

    $scope.$on("CompanyChange", function () {
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.ConsultarEmpleados();
        $scope.ConsultarServicios();
        $scope.ResetearData();
        $scope.ResetearGrids();
        $scope.Inicializacion();
    });

    $timeout(function () {
        window.onresize();
        $scope.ConsultarEmpleados();
        $scope.ConsultarServicios();
        $scope.Inicializacion();
        angular.element(document.getElementById('acEmpleados')).find('input').focus();
    }, 200);


}