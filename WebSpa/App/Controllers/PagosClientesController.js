angular.module('app.controllers')
    .controller("PagosClientesController", PagosClientesController);

PagosClientesController.$inject = ['$scope', '$rootScope', '$filter', '$timeout', 'SPAService'];

function PagosClientesController($scope, $rootScope, $filter, $timeout, SPAService) {
    $rootScope.header = 'Reportes - Pagos por Cliente';
    $scope.IdEmpresa = $rootScope.Id_Empresa;

    $scope.FechaDesde = new Date();
    $scope.FechaHasta = new Date();

    $scope.PagosSubtotal = 0;
    $scope.PagosDescuento = 0;
    $scope.PagosTotal = 0;

    $scope.PagosTotalServicios = 0;
    $scope.PagosTotalPromocion = 0;
    $scope.PagosTotalServiciosNoPromocion = 0;
    $scope.PagosTotalProductos = 0;
    $scope.PagosDescuento = 0;
    $scope.PagosTotalPagado = 0;

    $scope.BusquedaPago = {
        Id_Cliente: -1,
        Fecha_Desde: null,
        Fecha_Hasta: null,
        Id_Empresa: $scope.IdEmpresa
    }

    $scope.Inicializacion = function () {
        $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
    }

    $scope.ConsultarPagosCliente = function () {
        if ($scope.ValidarDatosBusqueda()) {
            SPAService._consultarPagosCliente($scope.BusquedaPago)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null && result.data.length > 0) {
                            $scope.Pagos = [];
                            $scope.Pagos = result.data;
                            $scope.Pagos = $filter('orderBy')($scope.Pagos, 'id_Pago', false);
                            $scope.LimpiarDatos();

                            $scope.PagosClienteGridOptions.api.setRowData($scope.Pagos);

                            $timeout(function () {
                                $scope.PagosClienteGridOptions.api.sizeColumnsToFit();
                            }, 200);
                            $timeout(function () {
                                angular.element(document.getElementById('acClientes')).find('input').focus();
                            }, 200);

                            $scope.PagosTotalServicios = $filter('decimalParseAmount')($filter("mathOperation")($scope.Pagos, { property: "total_Servicios", operation: "+" }), '2', $scope);
                            $scope.PagosTotalPromocion = $filter('decimalParseAmount')($filter("mathOperation")($scope.Pagos, { property: "total_Promocion", operation: "+" }), '2', $scope);
                            $scope.PagosTotalServiciosNoPromocion = $filter('decimalParseAmount')($filter("mathOperation")($scope.Pagos, { property: "total_Servicios_NoPromocion", operation: "+" }), '2', $scope);
                            $scope.PagosTotalProductos = $filter('decimalParseAmount')($filter("mathOperation")($scope.Pagos, { property: "total_Productos", operation: "+" }), '2', $scope);
                            $scope.PagosDescuento = $filter('decimalParseAmount')($filter("mathOperation")($scope.Pagos, { property: "descuento", operation: "+" }), '2', $scope);
                            $scope.PagosTotalPagado = $filter('decimalParseAmount')($filter("mathOperation")($scope.Pagos, { property: "total_Pagado", operation: "+" }), '2', $scope);

                        } else {

                            $scope.LimpiarDatos();
                            $scope.ResetearGrids();

                            $timeout(function () {
                                angular.element(document.getElementById('acClientes')).find('input').focus();
                            }, 200);

                            $scope.PagosSubtotal = 0;
                            $scope.PagosDescuento = 0;
                            $scope.PagosTotal = 0;
                            toastr.info('La busqueda no arrojó resultados', '', $scope.toastrOptions);
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

    $scope.ValidarDatosBusqueda = function () {
        try {
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
     
            $scope.BusquedaPago.Fecha_Desde = $filter('date')($scope.FechaDesde, 'yyyy-MM-dd');
            $scope.BusquedaPago.Fecha_Hasta = $filter('date')($scope.FechaHasta, 'yyyy-MM-dd');

            if ($scope.ClienteSeleccionado === '' || $scope.ClienteSeleccionado === null || $scope.ClienteSeleccionado === undefined)
                $scope.BusquedaPago.Id_Cliente = -1;
            else
                $scope.BusquedaPago.Id_Cliente = $scope.ClienteSeleccionado.id_Cliente;

            return true;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.PagosClienteGridOptionsColumns = [
        {
            headerName: "", field: "Checked", suppressFilter: true, width: 30, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
        },
        {
            headerName: "Cliente", field: 'nombreApellido_Cliente', width: 220, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Fecha", field: 'fecha', width: 100, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, valueFormatter: dateFormatter
        },
        {
            headerName: "Servicios", field: 'total_Servicios', width: 110, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#445a9e', 'font-weight': 'bold' }, valueFormatter: currencyFormatter,
            cellRenderer: function (params) {
                return "<span  data-toggle='tooltip' data-placement='left' title='Este valor representa, el valor real del servicio que tomó el cliente. Dicho valor se tiene en cuenta, cuando se debe aplicar una promoción establecida por porcentaje.'>{{data.total_Servicios}}</span>"
            }
        },
        {
            headerName: "Promo", field: 'total_Promocion', width: 100, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#445a9e', 'font-weight': 'bold' }, valueFormatter: currencyFormatter
        },
        {
            headerName: "Sin Promo", field: 'total_Servicios_NoPromocion', width: 110, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#445a9e', 'font-weight': 'bold' }, valueFormatter: currencyFormatter
        },
        {
            headerName: "Productos", field: 'total_Productos', width: 110, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#445a9e', 'font-weight': 'bold' }, valueFormatter: currencyFormatter
        },
        {
            headerName: "Descuento", field: 'descuento', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
        },
        {
            headerName: "Total Pagado", field: 'total_Pagado', width: 140, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#499977', 'font-weight': 'bold' }, valueFormatter: currencyFormatter
        }

    ];

    $scope.PagosClienteGridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: $scope.PagosClienteGridOptionsColumns,
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
        onRowSelected: OnRowSelectedPagos
    }

    $scope.ExportarArchivo = function () {
        try {
            if ($scope.Pagos !== null && $scope.Pagos !== undefined && $scope.Pagos.length > 0) {

                alasql.fn.datetime = function (dateStr) {
                    let date = $filter('date')(new Date(), 'dd-MM-yyyy');
                    return date.toLocaleString();
                };

                alasql.fn.currencyFormatter = function (currencyStr) {
                    let currency = $filter('currency')(currencyStr, '$', 0);
                    return currency.toLocaleString();
                }

                let pagos = [];
                if ($scope.ObjetoPagosSeleccionados !== undefined && $scope.ObjetoPagosSeleccionados !== null && $scope.ObjetoPagosSeleccionados.length > 0)
                    pagos = $scope.ObjetoPagosSeleccionados;
                else
                    pagos = $scope.Pagos;

                let mystyle = {
                    sheetid: 'ClientePagos',
                    headers: true,
                    columns: [
                        { columnid: 'nombreApellido_Cliente', title: 'CLIENTE', width: 300 },
                        { columnid: 'fecha', title: 'FECHA', width: 150 },
                        { columnid: 'totalServicios', title: 'TOTAL_SERVICIOS', width: 150 },
                        { columnid: 'totalPromociones', title: 'TOTAL_PROMOCIONES', width: 150 },
                        { columnid: 'totalServicionsSinPromo', title: 'TOTAL_SERVICIOS_SIN_PROMO', width: 150 },
                        { columnid: 'totalProductos', title: 'TOTAL_PRODUCTOS', width: 150 },
                        { columnid: 'totalDescuentos', title: 'TOTAL_DESCUENTOS', width: 150 },
                        { columnid: 'totalPagado', title: 'TOTAL_PAGADO', width: 150 },
                    ]
                };

                alasql('SELECT nombreApellido_Cliente AS CLIENTE, datetime(fecha) AS FECHA, total_Servicios AS TOTAL_SERVICIOS, total_Promocion AS TOTAL_PROMOCIONES, total_Servicios_NoPromocion AS TOTAL_SERVICIOS_SINPROMO, total_Productos AS TOTAL_PRODUCTOS, descuento AS TOTAL_DESCUENTOS, total_Pagado AS TOTAL_PAGADO INTO XLSX("PagosCliente.xlsx",?) FROM ?', [mystyle, pagos]);
            } else {
                toastr.info('No hay datos para exportar', '', $scope.toastrOptions);
            }

        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    function OnRowSelectedPagos(event) {
        try {
            $scope.ObjetoPagosSeleccionados = [];
            $scope.ObjetoPagosSeleccionados = $scope.PagosClienteGridOptions.api.getSelectedRows();

            if ($scope.ObjetoPagosSeleccionados.length > 0) {
                $scope.$apply(function () {
                    $scope.PagosSubtotal = $filter('decimalParseAmount')($filter("mathOperation")($scope.ObjetoPagosSeleccionados, { property: "subtotal", operation: "+" }), '2', $scope);
                    $scope.PagosDescuento = $filter('decimalParseAmount')($filter("mathOperation")($scope.ObjetoPagosSeleccionados, { property: "descuento", operation: "+" }), '2', $scope);
                    $scope.PagosTotal = $filter('decimalParseAmount')($filter("mathOperation")($scope.ObjetoPagosSeleccionados, { property: "total", operation: "+" }), '2', $scope);
                });
            } else {
                $scope.$apply(function () {
                    $scope.PagosSubtotal = $filter('decimalParseAmount')($filter("mathOperation")($scope.Pagos, { property: "subtotal", operation: "+" }), '2', $scope);
                    $scope.PagosDescuento = $filter('decimalParseAmount')($filter("mathOperation")($scope.Pagos, { property: "descuento", operation: "+" }), '2', $scope);
                    $scope.PagosTotal = $filter('decimalParseAmount')($filter("mathOperation")($scope.Pagos, { property: "total", operation: "+" }), '2', $scope);
                });
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

    $scope.LimpiarDatos = function () {
        try {
            $scope.BusquedaPago = {
                Id_Cliente: -1,
                Fecha_Desde: null,
                Fecha_Hasta: null,
                Id_Empresa: $scope.IdEmpresa
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ResetearGrids = function () {
        try {
            $scope.PagosCliente = [];
            $scope.PagosClienteGridOptions.api.setRowData($scope.PagosCliente);
            $timeout(function () {
                $scope.PagosClienteGridOptions.api.sizeColumnsToFit();
            }, 200);
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ResetearData = function () {
        try {
            $scope.Pagos = [];
            $scope.ObjetoPagosSeleccionados = [];

            $scope.AplicacionPago = {
                Id_Cliente: -1,
                Fecha_Desde: null,
                Fecha_Hasta: null,
                Id_Empresa: $scope.IdEmpresa
            }

            $scope.ClienteSeleccionado = null;
            $scope.FechaDesde = new Date();
            $scope.FechaHasta = new Date();

            $scope.PagosSubtotal = 0;
            $scope.PagosDescuento = 0;
            $scope.PagosTotal = 0;
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
        try {
            $timeout(function () {
                $scope.PagosClienteGridOptions.api.sizeColumnsToFit();
            }, 300);
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.$on("CompanyChange", function () {
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.ConsultarClientes();
        $scope.ResetearData();
        $scope.ResetearGrids();
        $scope.Inicializacion();
    });

    $timeout(function () {
        window.onresize();
        $scope.ConsultarClientes();
        $scope.Inicializacion();
        angular.element(document.getElementById('acClientes')).find('input').focus();
    }, 200);
}