﻿angular.module('app.controllers')
    .controller("EmpleadosController", EmpleadosController);

EmpleadosController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

function EmpleadosController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
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
    $scope.GridAccion = '';

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

    $scope.LimpiarDatos = function () {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ConsultarInventario = function (inventario) {
        try {
            $scope.InventarioProducto = 0;
            let filtrarEntrada = Enumerable.From($scope.Productos)
                .Where(function (x) { return x.id_Producto === inventario })
                .ToArray();
            $scope.InventarioProducto = filtrarEntrada[0].inventario;
            $scope.$broadcast('productChanged');
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.FocoMonto = function () {
        $scope.$broadcast('selectChanged');
    }

    $scope.AsignarRemover = function (ServiciosSeleccionados) {
        try {
            if (ServiciosSeleccionados.length > 0)
                $scope.ServiciosAsignados = ServiciosSeleccionados;
            else
                $scope.ServiciosAsignados.splice($scope.ServiciosAsignados.indexOf(ServiciosSeleccionados), 1);
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarDatos = function () {
        try {
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
                        toastr.info('El monto no puede ser mayor a 1 si el tipo de pago es [POR SERVICIOS]', '', $scope.toastrOptions);
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.FiltrarBarrios = function (id_Municipio) {
        try {
            $scope.ConsultarBarrios(id_Municipio);
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.showConfirmServicio = function (ev, data) {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalAsignarServicios = function () {
        try {
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
                    $scope.GridAccion = '';
                });
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.AsignarServicios = function (data) {
        try {
            $scope.GridAccion = 'LLAMAR_MODALES';
            $scope.IdEmpleado = data.id_Empleado;
            $scope.NombreEmpleado = data.nombres + ' ' + data.apellidos;
            $scope.ConsultarEmpleadoServicio();
            $scope.ModalAsignarServicios();
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            $scope.GridAccion = '';
            return;
        }
    }

    $scope.showConfirmInsumo = function (ev, data) {
        try {
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalAsignarInsumos = function () {
        try {
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
                    $scope.GridAccion = '';
                });
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.AsignarInsumos = function (data) {
        try {
            $scope.GridAccion = 'LLAMAR_MODALES';
            $scope.IdEmpleado = data.id_Empleado;
            $scope.NombreEmpleado = data.nombres + ' ' + data.apellidos;
            $scope.ConsultarEmpleadoInsumos();
            $scope.ModalAsignarInsumos();
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            $scope.GridAccion = '';
            return;
        }
    }

    function OnRowClicked(event) {
        try {
            if ($scope.GridAccion === 'LLAMAR_MODALES') return;
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
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.onFilterTextBoxChanged = function () {
        try {
            if ($scope.PermitirFiltrar === true) {
                $scope.EmpleadosGridOptions.api.setQuickFilter($('#txtNombres').val());
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    function ChangeRowColor(params) {
        if (params.data.estado === 'INACTIVO') {
            return { 'background-color': '#ecf0e0', 'color': '#999999', 'font-weight': '300' };
        }
    }

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
            headerName: "Cédula", field: 'cedula', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
        },
        {
            headerName: "Nombres(s)", field: 'nombres', width: 140, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Apellido(s)", field: 'apellidos', width: 155, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Celular", field: 'telefono_Movil', width: 110, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#212121', 'background': 'RGBA(210,216,230,0.75)', 'font-weight': 'bold', 'border-bottom': '1px dashed #212121', 'border-right': '1px dashed #212121', 'border-left': '1px dashed #212121' },
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

    $scope.ConsultarServicios();
    $scope.ConsultarTipoServicios();
    $scope.ConsultarEmpleados();
    $scope.ConsultarMunicipios();
    $scope.ConsultarTipoPagos();
    $scope.ConsultarProductos();
    $scope.ConsultarTipoTransacciones();
    $scope.Inicializacion();
}