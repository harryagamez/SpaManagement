﻿angular.module('app.controllers')
    .controller("MovimientosCajaMenorController", MovimientosCajaMenorController);

MovimientosCajaMenorController.$inject = ['$scope', '$rootScope', '$filter', '$timeout', 'SPAService'];

function MovimientosCajaMenorController($scope, $rootScope, $filter, $timeout, SPAService) {
    $rootScope.header = 'Reportes - Movimientos Caja Menor';
    $scope.IdEmpresa = $rootScope.Id_Empresa;

    $scope.FechaDesde = new Date();
    $scope.FechaHasta = new Date();

    $scope.SaldoInicial = 0;
    $scope.SaldoAcumulado = 0;

    $scope.Inicializacion = function () {
        $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
    }

    $scope.ConsultarMovimientosCajaMenor = function () {
        if ($scope.ValidarDatosBusqueda()) {

            let fechaDesde = $filter('date')($scope.FechaDesde, 'yyyy-MM-dd');
            let fechaHasta = $filter('date')($scope.FechaHasta, 'yyyy-MM-dd');
            
            SPAService._consultarMovimientosCajaMenor($scope.IdEmpresa, fechaDesde, fechaHasta)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null && result.data.length > 0) {
                            $scope.MovimientosCajaMenor = [];
                            $scope.MovimientosCajaMenor = result.data;
                            $scope.MovimientosCajaMenor = $filter('orderBy')($scope.MovimientosCajaMenor, 'fecha', true); 
                            $scope.MovimientosCajaMenorGridOptions.api.setRowData($scope.MovimientosCajaMenor);

                            $timeout(function () {
                                $scope.MovimientosCajaMenorGridOptions.api.sizeColumnsToFit();
                            }, 200);                           

                        } else {                            
                            $scope.ResetearGrids();                           
                            toastr.info('La busqueda no arrojó resultados', '', $scope.toastrOptions);
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
                        if ($scope.Caja_Menor.dia !== null) {
                            $scope.SaldoInicial = $scope.Caja_Menor.saldo_Inicial;
                            $scope.SaldoAcumulado = $scope.Caja_Menor.acumulado;
                        }
                        else {
                            $scope.SaldoInicial = $scope.Caja_Menor.saldo_Inicial;
                            $scope.SaldoAcumulado = $scope.Caja_Menor.acumulado;
                        }
                    }
                    else {
                        $scope.SaldoInicial = 0;
                        $scope.SaldoAcumulado = 0;
                        toastr.info('Debe configurar la caja menor', '', $scope.toastrOptions);
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.MovimientosCajaMenorGridOptionsColumns = [
        {
            headerName: "", field: "Checked", suppressFilter: true, width: 30, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
        },
        {
            headerName: "Caja",
            headerGroupComponent: 'customHeaderGroupComponent',
            children: [
                {
                    headerName: "Saldo Inicial", field: 'saldoInicial', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
                },
                {
                    headerName: "Acumulado", field: 'acumulado', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
                },
            ]
        },
        {
            headerName: "Movimientos Egresos - Ingresos",
            headerGroupComponent: 'customHeaderGroupComponent',
            children: [
                {
                    headerName: "Fecha", field: 'fecha', width: 120, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, valueFormatter: dateFormatter
                },
                {
                    headerName: "Compras", field: 'compras', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
                },
                {
                    headerName: "Nómina", field: 'nomina', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
                },
                {
                    headerName: "Préstamos", field: 'prestamos', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
                },
                {
                    headerName: "Servicios", field: 'servicios', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
                },
                {
                    headerName: "Varios", field: 'varios', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, valueFormatter: currencyFormatter
                },
                {
                    headerName: "Facturado", field: 'facturado', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color':'rgb(73, 153, 119)', 'font-weight':'bold' }, valueFormatter: currencyFormatter
                }
            ]
        }
    ];

    $scope.MovimientosCajaMenorGridOptions = {
        defaultColDef: {
            resizable: true
        },
        components: {
            customHeaderGroupComponent: CustomHeaderGroup,
        },
        columnDefs: $scope.MovimientosCajaMenorGridOptionsColumns,
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
        onRowSelected: OnRowSelectedMovimiento
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
                toastr.info('La búsqueda solo puede hacerse en un rango máximo de 5 días', '', $scope.toastrOptions); 
                $timeout(function () {
                    angular.element(document.getElementById('dpFechaHasta')).find('input').focus();
                }, 200);
                return false;
        }       

        return true;
    }

    $scope.ResetearGrids = function () {
        $scope.MovimientosCajaMenor = [];
        $scope.MovimientosCajaMenorGridOptions.api.setRowData($scope.MovimientosCajaMenor);
        $timeout(function () {
            $scope.MovimientosCajaMenorGridOptions.api.sizeColumnsToFit();
        }, 200);
    }

    $scope.ResetearData = function () {
        $scope.FechaDesde = new Date();
        $scope.FechaHasta = new Date();

        $scope.SaldoInicial = 0;
        $scope.SaldoAcumulado = 0;
    }

    function OnRowSelectedMovimiento(event) {
        try {

            $scope.ObjetoMovimientoCajaSeleccionados = [];
            $scope.ObjetoMovimientoCajaSeleccionados = $scope.MovimientosCajaMenorGridOptions.api.getSelectedRows();

        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ExportarArchivo = function () {
        try {            
            if ($scope.MovimientosCajaMenor !== null && $scope.MovimientosCajaMenor !== undefined && $scope.MovimientosCajaMenor.length > 0) {

                let movimientosCajaMenor = [];

                if ($scope.ObjetoMovimientoCajaSeleccionados !== undefined && $scope.ObjetoMovimientoCajaSeleccionados !== null && $scope.ObjetoMovimientoCajaSeleccionados.length > 0)
                    movimientosCajaMenor = $scope.ObjetoMovimientoCajaSeleccionados;
                else
                    movimientosCajaMenor = $scope.MovimientosCajaMenor;

                let mystyle = {
                    sheetid: 'MovimientosCaja',
                    headers: true                    
                };

                alasql('SELECT saldoInicial AS SALDO_INICIAL, acumulado AS ACUMULADO, fecha AS FECHA, compras AS COMPRAS, nomina AS NOMINA, prestamos AS PRESTAMOS, servicios AS SERVICIOS, varios AS VARIOS, facturado AS FACTURADO INTO XLSX("MovimientosCaja.xlsx",?) FROM ?', [mystyle, movimientosCajaMenor]);
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

    function CustomHeaderGroup() { }

    CustomHeaderGroup.prototype.init = function (params) {
        this.params = params;
        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-header-group-cell-label';
        this.eGui.innerHTML =
            '' +
        '<div class="customHeaderLabel" style="margin-left: auto; margin-right: auto; font-weight: 800;">'
            +this.params.displayName +
            '</div>';

        this.onExpandButtonClickedListener = this.expandOrCollapse.bind(this);
        this.eExpandButton = this.eGui.querySelector('.customExpandButton');       

        this.onExpandChangedListener = this.syncExpandButtons.bind(this);
        this.params.columnGroup
            .getOriginalColumnGroup()
            .addEventListener('expandedChanged', this.onExpandChangedListener);

        this.syncExpandButtons();
    };

    CustomHeaderGroup.prototype.getGui = function () {
        return this.eGui;
    };

    CustomHeaderGroup.prototype.expandOrCollapse = function () {
        var currentState = this.params.columnGroup
            .getOriginalColumnGroup()
            .isExpanded();
        this.params.setExpanded(!currentState);
    };

    CustomHeaderGroup.prototype.syncExpandButtons = function () {
        function collapsed(toDeactivate) {            
        }

        function expanded(toActivate) {
            toActivate.className = toActivate.className.split(' ')[0] + ' expanded';
        }

        if (this.params.columnGroup.getOriginalColumnGroup().isExpanded()) {
            expanded(this.eExpandButton);
        } else {
            collapsed(this.eExpandButton);
        }
    };

    CustomHeaderGroup.prototype.destroy = function () {        
    };

    window.onresize = function () {
        $timeout(function () {
            $scope.MovimientosCajaMenorGridOptions.api.sizeColumnsToFit();
        }, 300);
    }

    $scope.$on("CompanyChange", function () {
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.ResetearGrids();
        $scope.ResetearData();
        $scope.Inicializacion();
        $scope.ConsultarCajaMenor();
    });

    $timeout(function () {
        window.onresize();
        $scope.ConsultarCajaMenor();
    }, 200);
}