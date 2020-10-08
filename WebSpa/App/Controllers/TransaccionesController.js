angular.module('app.controllers')
    .controller("TransaccionesController", TransaccionesController);

TransaccionesController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

function TransaccionesController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {

    $scope.IdEmpresa = $rootScope.Id_Empresa;
    $scope.FechaBusqueda = new Date(new Date().setHours(0, 0, 0, 0));
    $scope.fActiveTab = 'Facturar Servicios';
    $scope.InventarioProducto = 0;
    $scope.PrecioProducto = 0;
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
    $scope.ObjetoProductosGrid = [];

    $scope.ProductoSeleccionado = -1;

    $scope.Inicializacion = function () {
        $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();        
    }

    $scope.RegistrarFacturacionServicios = function () {
        if ($scope.ValidarDatosPagos()) {
            SPAService._registrarFacturacionServicios($scope.ObjetoFacturacionServicios)
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
            headerName: "", field: "", suppressMenu: true, visible: true, width: 20, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
            cellRenderer: function () {
                return "<i data-ng-click='EliminarProductoGrilla($event,data)' id='gridTooltip' data-toggle='tooltip' title='Eliminar Producto' class='material-icons' style='font-size:20px;margin-top:-1px;color:lightslategrey;'>delete_sweep</i>";
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

        if ($scope.ObjetoAgendasSeleccionadas === undefined || $scope.ObjetoAgendasSeleccionadas.lenght === 0 || $scope.ObjetoAgendasSeleccionadas === null) {
            toastr.warning('Debe seleccionar al menos un servicio a procesar', '', $scope.toastrOptions);
            return false;
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
        $scope.ProductoSeleccionado = -1;

        $scope.ObjetoProductosGrid = [];
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
                        $scope.ObjetoProductosGrid[i].Cantidad = parseInt($scope.ObjetoProductosGrid[i].Cantidad) + parseInt(cantidad);
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

            //for (let i = 0; i < $scope.ObjetoProductosGrid.length; i++) {
            //    sumaProductosGrilla += $scope.ObjetoProductosGrid[i].Total;
            //}

            // Utilizar Filters ejemplo:
            $scope.TotalProductos = $filter('decimalParseAmount')($filter("mathOperation")($scope.ObjetoProductosGrid, { property: "Total", operation: "+" }), '2', $scope);
            //$scope.TotalProductos = sumaProductosGrilla;
            
            $scope.SubtotalTransaccion = $scope.TotalServicios + $scope.TotalProductos;
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

                //for (let i = 0; i < $scope.ObjetoProductosGrid.length; i++) {
                //    sumaProductosGrilla += $scope.ObjetoProductosGrid[i].Total;
                //}

                // Utilizar Filters ejemplo:
                $scope.TotalProductos = $filter('decimalParseAmount')($filter("mathOperation")($scope.ObjetoProductosGrid, { property: "Total", operation: "+" }), '2', $scope);
                //$scope.TotalProductos = sumaProductosGrilla;

                $scope.SubtotalTransaccion = $scope.TotalServicios + $scope.TotalProductos;
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

    function OnRowSelected(event) {
        let total = 0;
        let tempCliente = [];
        let tipoCliente = '';
        
        let checked = event.node.selected;       
        $scope.ObjetoAgendasSeleccionadas = [];
        $scope.ObjetoAgendasSeleccionadas = $scope.ServiciosAgendaGridOptions.api.getSelectedRows();
        
        if ($scope.ObjetoAgendasSeleccionadas.length > 0) {

            tempCliente = $scope.Clientes.filter(function (e) {
                return e.id_Cliente === $scope.ObjetoAgendasSeleccionadas[0].id_Cliente;
            });

            tipoCliente = tempCliente[0].tipo_Cliente;

            for (let i = 0; i < $scope.ObjetoAgendasSeleccionadas.length; i++) {
                total += $scope.ObjetoAgendasSeleccionadas[i].valor_Servicio;
            }

            $scope.TotalServicios = total;
        } else {
            $scope.TotalServicios = 0;
        }      

        $scope.$apply(function () {
            $scope.TipoClienteTransaccion = tipoCliente;
            $scope.SubtotalTransaccion = $scope.TotalServicios + $scope.TotalProductos; 
            $scope.TotalTransaccion = angular.copy($scope.SubtotalTransaccion);
        });        
    }

    $scope.ResetearGrids = function () {
        $scope.Agendas = [];
        $scope.ServiciosAgendaGridOptions.api.setRowData($scope.Agendas);
    }

    function currencyFormatter(params) {
        let valueGrid = params.value;
        return $filter('currency')(valueGrid, '$', 0);
    }

    $scope.$watch("DescuentoTransaccion", function (oldValue, newValue) {
        if (oldValue !== newValue) {
            $scope.TotalTransaccion = $scope.SubtotalTransaccion - $scope.DescuentoTransaccion;
        }        
    });

    window.onresize = function () {
        $timeout(function () {
            $scope.ServiciosAgendaGridOptions.api.sizeColumnsToFit();
            $scope.ProductosTransaccionGridOptions.api.sizeColumnsToFit();
        }, 300);
    }   

    $scope.$on("CompanyChange", function () {
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.LimpiarDatos();
        $scope.ConsultarClientes();
        $scope.ConsultarProductos();
        $scope.ConsultarTipoTransacciones();
        $scope.Inicializacion();
        $scope.ResetearGrids();
    });

    $timeout(function () {
        window.onresize();
        $scope.ConsultarClientes();
        $scope.ConsultarProductos();
        $scope.ConsultarTipoTransacciones();
        $scope.Inicializacion();
    }, 200);

    $timeout(function () {
        angular.element(document.getElementById('acClientes')).find('input').focus();
    }, 200);
}