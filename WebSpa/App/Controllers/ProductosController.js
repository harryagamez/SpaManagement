angular.module('app.controllers')
    .controller("ProductosController", ProductosController);

ProductosController.$inject = ['$scope', '$rootScope', '$templateCache', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

function ProductosController($scope, $rootScope, $templateCache, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
    $scope.TipoTransacciones = [];
    $scope.ObjetoProducto = [];
    $scope.Productos = [];
    $scope.AccionProducto = 'Registrar Producto';
    $scope.TipoTransaccionSeleccionada = -1;
    $scope.TipoTransaccionReadOnly = true;
    $scope.ProductoTransacciones = [];
    $scope.DescripcionProductoTransacciones = '';

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

    $scope.ConsultarProducto = function (data) {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ConsultarProductoNombre = function (e, nombre) {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
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
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarDatos = function () {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalNuevoProducto = function () {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalEditarProducto = function () {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ProductosGridOptionsColumns = [

        {
            headerName: "", field: "Checked", suppressFilter: true, width: 20, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
        },
        {
            headerName: "", field: "", suppressMenu: true, visible: true, width: 20, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
            cellRenderer: function () {
                return "<i data-ng-click='ConsultarProducto(data)' data-toggle='tooltip' title='Editar producto' class='material-icons' style='font-size:25px;margin-top:-1px;color:lightslategrey;'>create</i>";
            },
        },
        {
            headerName: "", field: "", suppressMenu: true, visible: true, width: 20, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
            cellRenderer: function () {
                return "<i data-ng-click='ConsultarProductoTransacciones(data)' data-toggle='tooltip' title='Transacciones' class='material-icons' style='font-size:25px;margin-top:-1px;color:lightslategrey;'>list</i>";
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

    function currencyFormatter(params) {
        let valueGrid = params.value;
        return $filter('currency')(valueGrid, '$', 0);
    }

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
        $templateCache.removeAll();
    });

    $scope.ConsultarTipoTransacciones();
    $scope.ConsultarProductos();
    $scope.Inicializacion();
}