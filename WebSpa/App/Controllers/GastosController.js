angular.module('app.controllers')
    .controller("GastosController", GastosController);

GastosController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

function GastosController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
    $scope.ObjetoGasto = [];
    $scope.ObjetoBorrarGasto = [];
    $scope.Gastos = [];
    $scope.AccionGasto = 'Registrar Gasto';
    $scope.TipoGastoSeleccionado = -1;
    $scope.TipoGastoSeleccionadoModal = -1;
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

    $scope.Inicializacion = function () {
        $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
        window.onresize();
        $scope.Filtros = { Desde: new Date(), Hasta: new Date() }
        $scope.TipoGastoSeleccionado = -1;
        $scope.TipoGastoSeleccionadoModal = -1;
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
                            $scope.TipoGastoSeleccionadoModal = -1;
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

    $scope.ValidarDatos = function () {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarCajaMenor = function () {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarNuevoGasto = function () {
        try {
            $scope.Gasto.Id_Empresa = $scope.IdEmpresa;
            $scope.Gasto.Fecha = new Date($scope.Gasto.Fecha + 'Z');
            if ($scope.TipoGastoSeleccionadoModal === -1) {
                toastr.info('Debe seleccionar un tipo de gasto', '', $scope.toastrOptions);
                return false;
            }

            if ($scope.TipoGastoSeleccionadoModal === 2 && $scope.EmpleadoSeleccionado === -1) {
                toastr.info('Para el tipo de gasto prestamos debe seleccionar un empleado', '', $scope.toastrOptions);
                return false;
            }

            if ($scope.TipoGastoSeleccionadoModal !== -1 && $scope.TipoGastoSeleccionadoModal !== 2) {
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
                toastr.info('El valor del gasto no puede ser cero', '', $scope.toastrOptions);
                $('#txtValorGasto').focus();
                return false;
            }

            if ($scope.Gasto.Valor > $scope.Acumulado) {
                toastr.info('No puede registrar el gasto, el saldo en caja es: ' + $filter('currency')($scope.Acumulado, '$', 2), '', $scope.toastrOptions);
                $('#txtValorGasto').focus();
                return false;
            }

            let filtrarTipoGasto = Enumerable.From($scope.TipoGastos)
                .Where(function (x) { return x.id_TipoGasto === $scope.TipoGastoSeleccionadoModal })
                .ToArray();

            if (filtrarTipoGasto.length > 0)
                $scope.Gasto.Tipo_Gasto = filtrarTipoGasto[0].Nombre;

            return true;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

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
            headerName: "Valor", field: 'valor', width: 80, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'font-weight': '600', 'color':'#445a9e' }, valueFormatter: currencyFormatter
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

    $scope.CambiarDistribucion = function () {
        try {
            if ($scope.TipoCajaSeleccionada === -1) {
                toastr.info('Debe seleccionar una distribución DIARIA o MENSUAL', '', $scope.toastrOptions);
                $scope.TipoCajaSeleccionada = $scope.DistribucionActual;
                return;
            }

            if ($scope.DistribucionActual !== -1) {
                $scope.showConfirmCambiarDistribucion();
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.LimpiarDatosCajaMenor = function () {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.LimpiarDatosGastos = function () {
        try {
            $scope.TipoGastoSeleccionadoModal = -1;
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalCajaMenor = function () {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalNuevoGasto = function () {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.showConfirmCambiarDistribucion = function (ev, data) {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.showConfirmEliminarGastos = function (ev) {
        try {
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
            else toastr.info('Debe seleccionar un registro de gasto', '', $scope.toastrOptions);
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    function OnRowSelected(event) {
        $scope.ObjetoBorrarGasto = [];
        $scope.ObjetoBorrarGasto = $scope.GastosGridOptions.api.getSelectedRows();
    }

    window.onresize = function () {
        $timeout(function () {
            $scope.GastosGridOptions.api.sizeColumnsToFit();
        }, 200);
    }

    $scope.Cancelar = function () {
        $mdDialog.cancel();
    };

    $scope.ValidarFechaDesde = function () {
        try {
            if ($scope.Filtros.Desde == undefined) {
                $scope.Filtros.Desde = new Date();
            }

            if ($filter('date')(new Date($scope.Filtros.Desde), 'yyyy-MM-dd') > $filter('date')(new Date($scope.Filtros.Hasta), 'yyyy-MM-dd')) {
                $scope.Filtros.Desde = angular.copy($scope.Filtros.Hasta);
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarFechaHasta = function () {
        try {
            if ($scope.Filtros.Hasta == undefined) {
                $scope.Filtros.Hasta = new Date();
            }

            if ($filter("date")(new Date($scope.Filtros.Hasta), 'yyyy-MM-dd') < $filter("date")(new Date($scope.Filtros.Desde), 'yyyy-MM-dd')) {
                $scope.Filtros.Hasta = angular.copy($scope.Filtros.Desde);
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ResetearGrids = function () {
        $scope.Gastos = [];
        $scope.GastosGridOptions.api.setRowData($scope.Gastos);
    }

    function currencyFormatter(params) {
        let valueGrid = params.value;
        return $filter('currency')(valueGrid, '$', 0);
    }

    $scope.$on("CompanyChange", function () {
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.Inicializacion();
        $scope.ResetearGrids();
    });

    $scope.Inicializacion();
}