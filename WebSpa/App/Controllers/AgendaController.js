﻿angular.module('app.controllers')
    .controller("AgendaController", AgendaController);

AgendaController.$inject = ['$scope', '$rootScope', '$q', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

function AgendaController($scope, $rootScope, $q, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
    $scope.Estado =
        [
            { id_Estado: -1, Nombre: "[Seleccione]" },
            { id_Estado: 1, Nombre: "PROGRAMADA" },
            { id_Estado: 2, Nombre: "FACTURADA" },
            { id_Estado: 4, Nombre: "LIQUIDADA" },
            { id_Estado: 5, Nombre: "CANCELADA" },
            { id_Estado: 6, Nombre: "CONFIRMADA" }
        ];
    $scope.Estado = $filter('orderBy')($scope.Estado, 'Nombre', false);

    $scope.RangoHoras = [];

    $scope.IdEmpresa = $rootScope.Id_Empresa;
    $scope.EmpresaPropiedades = $filter('filter')($rootScope.EmpresaPropiedades, { id_Empresa: $scope.IdEmpresa });
    $scope.IdUsuario = parseInt($rootScope.userData.userId);
    $scope.EstadoSeleccionado = -1;
    $scope.ServicioSeleccionadoModal = -1;
    $scope.ServicioSeleccionado = -1;
    $scope.ClienteSeleccionadoModal = null;
    $scope.ClienteSeleccionado = null;
    $scope.EmpleadoSeleccionadoModal = null;
    $scope.EmpleadoSeleccionado = null;
    $scope.AgendaServicios = [];
    $scope.AgendaServicios.push({ id_Servicio: -1, nombre: '[Seleccione]' });
    $scope.FechaBusqueda = new Date(new Date().setHours(0, 0, 0, 0));
    $scope.FechaActual = new Date();
    $scope.HoraActual = new Date($scope.FechaActual.getFullYear(), $scope.FechaActual.getMonth(), $scope.FechaActual.getDate(), $scope.FechaActual.getHours(), $scope.FechaActual.getMinutes());
    $scope.fActiveTab = 'General';

    $scope.fPropertiesSetted = false;
    $scope.PAPTS = false;
    $scope.MNCD = null;

    $scope.fDisableCliente = false;
    $scope.fDisableFechaCita = false;
    $scope.fEditAgenda = false;
    $scope.fDisableHoraFin = false;
    $scope.fDisableGuardarAgenda = false;
    $scope.fDisableServiciosM = true;
    $scope.fDisableServicios = true;

    $scope.Agenda = {
        Id_Agenda: -1,
        Id_Empresa: $scope.IdEmpresa,
        Id_Cliente: '',
        Id_Empleado: '',
        Id_Servicio: '',
        Fecha_Inicio: new Date(),
        Fecha_Fin: '',
        Estado: 'PROGRAMADA',
        Observaciones: '',
        Traer_Canceladas: false
    };

    $scope.GuardarActualizarAgenda = function () {
        if ($scope.ValidarNuevaAgenda()) {
            SPAService._guardarActualizarAgenda($scope.Agenda)
                .then(
                    function (result) {
                        if (result.data === true) {
                            $scope.LimpiarDatos();
                            toastr.success('Agenda actualizada correctamente', '', $scope.toastrOptions);
                            $scope.ConsultarAgenda();
                            $scope.ConsultarNumeroCitasDia();
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    $scope.ConsultarAgenda = function () {
        if ($scope.ValidarDatosConsulta()) {
            SPAService._consultarAgenda($scope.Agenda)
                .then(
                    function (result) {                        
                        if (result.data !== undefined && result.data !== null) {
                            $scope.Agendas = [];
                            $scope.Agendas = result.data;
                            $scope.Agendas = $scope.Agendas.map(function (e) {
                                e.mensaje_Whatsapp = 'Hola ' + e.nombres_Cliente + ', le escribimos desde ' + e.nombre_Empresa + ' para confirmar su cita para el servicio de ' + e.nombre_Servicio + ' a las ' + e.fechaInicio;
                                return e;
                            });
                        }

                        if ($scope.Agendas.length === 0) {
                            toastr.info('La busqueda no arrojó resultados', '', $scope.toastrOptions);                            
                            return;
                        }                       
                        
                        $mdDialog.cancel();

                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    $scope.CancelarAgenda = function (data) {
        if (data !== null && data !== undefined) {
            SPAService._cancelarAgenda(data.id_Agenda, data.id_Empresa)
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Cita cancelada correctamente', '', $scope.toastrOptions);
                            $scope.ConsultarAgenda();
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    $scope.ConfirmarAgenda = function (data) {
        if (data !== null && data !== undefined) {
            SPAService._confirmarAgenda(data.id_Agenda, data.id_Empresa)
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Cita confirmada correctamente', '', $scope.toastrOptions);
                            $scope.ConsultarAgenda();
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

    $scope.ConsultarEmpleadosAutoComplete = function () {
        SPAService._consultarEmpleadosAutoComplete($scope.IdEmpresa)
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.Empleados = [];
                        $scope.Empleados = result.data;
                        $scope.Empleados = $filter('orderBy')($scope.Empleados, 'id_Empleado', false);

                        if ($scope.Empleados.length < 9) {
                            for (i = 0; i < 10 - $scope.Empleados.length; i++) {
                                $scope.BlankCells[i] = i + 1;
                            }
                        }
                        else
                            $scope.BlankCells[0] = 0;
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarServiciosActivos = function () {
        SPAService._consultarServiciosActivos($scope.IdEmpresa)
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.Servicios = [];
                        $scope.Servicios = result.data;
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarEmpleadoServicio = function (idEmpleado) {
        SPAService._consultarEmpleadoServicio(idEmpleado)
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null && result.data.length > 0) {
                        $scope.AgendaServicios = [];
                        let empleadoservicios = result.data;
                        $scope.AgendaServicios = $scope.Servicios.filter(o1 => empleadoservicios.some(o2 => o1.id_Servicio === o2.id_Servicio));
                        $scope.AgendaServicios.push({ id_Servicio: -1, nombre: '[Seleccione]' });
                        $scope.AgendaServicios = $filter('orderBy')($scope.AgendaServicios, 'id_Servicio', false);
                        $scope.fDisableServiciosM = false;
                        $scope.fDisableServicios = false;
                    }
                    else {
                        $scope.fDisableGuardarAgenda = true;
                        $scope.fDisableServiciosM = true;
                        $scope.fDisableServicios = true;
                        toastr.warning('La configuración actual de este empleado es por prestación de servicios y actualmente no tiene ningún servicio asignado', '', $scope.toastrOptions);
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarNumeroCitasDia = function () {
        if ($scope.MNCD !== '0' && $scope.MNCD !== null && $scope.MNCD !== undefined && $scope.MNCD !== '') {
            if (($scope.FechaInicio !== null && $scope.FechaInicio !== undefined && $scope.FechaInicio !== '')
                && ($scope.IdEmpresa !== null && $scope.IdEmpresa !== undefined)) {
                let fechaConsulta = $filter('date')(angular.copy($scope.FechaInicio), 'dd/MM/yyyy');
                SPAService._consultarNumeroCitasDia(fechaConsulta, $scope.IdEmpresa)
                    .then(
                        function (result) {
                            let numeroCitasDia = result.data;
                            $scope.NumCitasDisponibles = ($scope.MNCD - numeroCitasDia);
                            $scope.fDisableGuardarAgenda = false;
                            if ($scope.NumCitasDisponibles === 0) {
                                $scope.fDisableGuardarAgenda = true;
                            }
                        })
            }
        }
    }

    $scope.FiltrarServicios = function (empleado) {
        try {
            if (empleado !== null && empleado !== undefined && empleado !== '') {
                if (empleado.criterio === 'PAGO_PORCENTUAL') {
                    $scope.ConsultarEmpleadoServicio(empleado.id_Empleado);
                }
                else {
                    $scope.AgendaServicios = angular.copy($scope.Servicios);
                    $scope.AgendaServicios.push({ id_Servicio: -1, nombre: '[Seleccione]' });
                    $scope.AgendaServicios = $filter('orderBy')($scope.AgendaServicios, 'id_Servicio', false);
                    $scope.fDisableServiciosM = false;
                    $scope.fDisableServicios = false;
                }
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.OnChange = function (empleado) {
        try {
            $scope.AgendaServicios = [];
            $scope.AgendaServicios.push({ id_Servicio: -1, nombre: '[Seleccione]' });
            $scope.ServicioSeleccionadoModal = -1;
            $scope.ServicioSeleccionado = -1;
            $scope.fDisableServiciosM = true;
            $scope.fDisableServicios = true;
            $scope.fDisableGuardarAgenda = false;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ConfiguracionEmpresaActual = function () {
        try {
            if ($scope.EmpresaPropiedades.length > 0) {
                let papts = $filter('filter')($scope.EmpresaPropiedades, { codigo: 'PAPTS' });
                let mncd = $filter('filter')($scope.EmpresaPropiedades, { codigo: 'MNCD' });
                let rha = $filter('filter')($scope.EmpresaPropiedades, { codigo: 'RHA' });

                if (mncd.length > 0)
                    $scope.MNCD = mncd[0].valor_Propiedad;
                else
                    $scope.MNCD = 0;

                if (rha.length > 0)
                    $scope.RHA = rha[0].valor_Propiedad;
                else
                    $scope.RHA = '7 - 21';

                if (papts[0].valor_Propiedad.toUpperCase() === 'SI' || papts[0].valor_Propiedad.toUpperCase() === 'SÍ') {
                    $scope.fDisableHoraFin = true;
                    $scope.fPropertiesSetted = true;
                    $scope.PAPTS = true;
                }
                else {
                    $scope.fDisableHoraFin = false;
                    $scope.fPropertiesSetted = true;
                    $scope.PAPTS = false;
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

    $scope.EditarAgenda = function (agenda) {
        try {
            let fechafin = new Date(agenda.fecha_Fin);
            $scope.EmpleadoSeleccionadoModal = {
                id_Empleado: agenda.id_Empleado,
                nombres: agenda.nombres_Empleado
            };
            $scope.ClienteSeleccionadoModal = {
                id_Cliente: agenda.id_Cliente,
                nombres: agenda.nombres_Cliente
            };

            $scope.ServicioSeleccionadoModal = agenda.id_Servicio;
            $scope.FechaInicio = new Date(agenda.fecha_Inicio);
            $scope.HoraInicio = new Date($scope.FechaInicio.getFullYear(), $scope.FechaInicio.getMonth(), $scope.FechaInicio.getDate(), $scope.FechaInicio.getHours(), $scope.FechaInicio.getMinutes());
            $scope.HoraFin = new Date(fechafin.getFullYear(), fechafin.getMonth(), fechafin.getDate(), fechafin.getHours(), fechafin.getMinutes());

            $scope.Agenda.Observaciones = agenda.observaciones;
            $scope.Agenda.Id_Agenda = agenda.id_Agenda;
            $scope.Agenda.Estado = 'PROGRAMADA';
            $scope.fEditAgenda = true;
            $scope.fDisableCliente = true;
            $scope.fDisableFechaCita = true;
            $scope.ModalAgendaGeneral();
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.LimpiarDatos = function () {
        try {
            $scope.IdEmpresa = $rootScope.Id_Empresa;
            $scope.EmpresaPropiedades = $filter('filter')($rootScope.EmpresaPropiedades, { id_Empresa: $scope.IdEmpresa });
            $scope.IdUsuario = parseInt($rootScope.userData.userId);
            $scope.EstadoSeleccionado = -1;
            $scope.ServicioSeleccionadoModal = -1;
            $scope.ServicioSeleccionado = -1;
            $scope.ClienteSeleccionadoModal = null;
            $scope.ClienteSeleccionado = null;
            $scope.EmpleadoSeleccionadoModal = null;
            $scope.EmpleadoSeleccionado = null;
            $scope.AgendaServicios = [];
            $scope.AgendaServicios.push({ id_Servicio: -1, nombre: '[Seleccione]' });
            $scope.FechaBusqueda = new Date(new Date().setHours(0, 0, 0, 0));
            //$scope.FechaHoraAgendaGeneral();

            $scope.fEditAgenda = false;
            $scope.fDisableCliente = false;
            $scope.fDisableFechaCita = false;
            $scope.fDisableGuardarAgenda = false;
            $scope.fDisableServiciosM = true;
            $scope.fDisableServicios = true;
            $scope.fDisableHoraInicio = false;

            $scope.Agenda = {
                Id_Agenda: -1,
                Id_Empresa: $scope.IdEmpresa,
                Id_Cliente: '',
                Id_Empleado: '',
                Id_Servicio: '',
                Fecha_Inicio: new Date(),
                Fecha_Fin: '',
                Estado: 'PROGRAMADA',
                Observaciones: '',
                NombreApellido_Empleado: '',
                NombreApellido_Cliente: '',
                Traer_Canceladas: false
            };
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarEmpleadosClientesServicios = function () {
        try {
            let counter = 0;
            if ($scope.Empleados !== null && $scope.Empleados !== undefined) {
                if ($scope.Empleados.length === 0) {
                    counter += 1;
                    toastr.warning('La empresa seleccionada no tiene empleados configurados', '', $scope.toastrOptions);
                }
            } else {
                counter += 1;
                toastr.warning('La empresa seleccionada no tiene empleados configurados', '', $scope.toastrOptions);
            }

            if ($scope.Clientes !== null && $scope.Clientes !== undefined) {
                if ($scope.Clientes.length === 0) {
                    counter += 1;
                    toastr.warning('La empresa seleccionada no tiene clientes configurados', '', $scope.toastrOptions);
                }
            } else {
                counter += 1;
                toastr.warning('La empresa seleccionada no tiene clientes configurados', '', $scope.toastrOptions);
            }

            if ($scope.Servicios !== null && $scope.Servicios !== undefined) {
                if ($scope.Servicios.length === 0) {
                    counter += 1;
                    toastr.warning('La empresa seleccionada no tiene servicios configurados', '', $scope.toastrOptions);
                }
            } else {
                counter += 1;
                toastr.warning('La empresa seleccionada no tiene servicios configurados', '', $scope.toastrOptions);
            }

            if (counter === 0) return true;
            else return false;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarNuevaAgenda = function () {
        try {
            if (!$scope.fEditAgenda) {
                if ($scope.EmpleadoSeleccionadoModal === '' || $scope.EmpleadoSeleccionadoModal === null || $scope.EmpleadoSeleccionadoModal === undefined) {
                    toastr.info('Debe seleccionar un empleado', '', $scope.toastrOptions);
                    $('#acEmpleadosModal').focus();
                    return false;
                }

                $scope.Agenda.Id_Empleado = $scope.EmpleadoSeleccionadoModal.id_Empleado;
                $scope.Agenda.NombreApellido_Empleado = $scope.EmpleadoSeleccionadoModal.nombres + ' ' + $scope.EmpleadoSeleccionadoModal.apellidos;

                if ($scope.ClienteSeleccionadoModal === '' || $scope.ClienteSeleccionadoModal === null || $scope.ClienteSeleccionadoModal === undefined) {
                    toastr.info('Debe seleccionar un cliente', '', $scope.toastrOptions);
                    $('#acClientesModal').focus();
                    return false;
                }

                $scope.Agenda.Id_Cliente = $scope.ClienteSeleccionadoModal.id_Cliente;
                $scope.Agenda.NombreApellido_Cliente = $scope.ClienteSeleccionadoModal.nombres + ' ' + $scope.ClienteSeleccionadoModal.apellidos;
                $scope.Agenda.Mail_Cliente = $scope.ClienteSeleccionadoModal.mail;

                if ($scope.ServicioSeleccionadoModal === -1 || $scope.ServicioSeleccionadoModal === null) {
                    toastr.info('Debe seleccionar un servicio', '', $scope.toastrOptions);
                    $('#slServiciosModal').focus();
                    return false;
                }

                $scope.Agenda.Id_Servicio = $scope.ServicioSeleccionadoModal;
                let servicionombre = Enumerable.From(angular.copy($scope.Servicios))
                    .Where(function (x) { return x.id_Servicio = $scope.ServicioSeleccionadoModal })
                    .ToArray();

                $scope.Agenda.Nombre_Servicio = servicionombre[0].nombre;

                if ($scope.FechaInicio === undefined) {
                    toastr.warning('Formato de fecha inválido', '', $scope.toastrOptions);
                    $('#dpFecha').focus();
                    return false;
                }

                if ($scope.FechaInicio === '' || $scope.FechaInicio === null) {
                    toastr.info('Debe seleccionar una fecha', '', $scope.toastrOptions);
                    $('#dpFecha').focus();
                    return false;
                }

                if ($scope.HoraInicio === undefined) {
                    toastr.warning('Formato de hora inválido ', '', $scope.toastrOptions);
                    $('#timeInicio').focus();
                    return false;
                }

                if ($scope.HoraInicio === '' || $scope.HoraInicio === null) {
                    toastr.info('Debe seleccionar una hora de inicio', '', $scope.toastrOptions);
                    $('#timeInicio').focus();
                    return false;
                }

                if ($scope.HoraFin === undefined) {
                    toastr.warning('Formato de hora inválido ', '', $scope.toastrOptions);
                    $('#timeFin').focus();
                    return false;
                }

                if ($scope.HoraFin === '' || $scope.HoraFin === null) {
                    toastr.info('Debe seleccionar una hora fin', '', $scope.toastrOptions);
                    $('#timeFin').focus();
                    return false;
                }

                $scope.Agenda.Fecha_Inicio = angular.copy($scope.FechaInicio);
                $scope.Agenda.Fecha_Inicio.setHours($scope.HoraInicio.getHours(), $scope.HoraInicio.getMinutes(), 0, 0);
                $scope.Agenda.Fecha_Fin = angular.copy($scope.FechaInicio);
                $scope.Agenda.Fecha_Fin.setHours($scope.HoraFin.getHours(), $scope.HoraFin.getMinutes(), 0, 0);

                $scope.Agenda.Fecha_Inicio = new Date($scope.Agenda.Fecha_Inicio + 'Z');
                $scope.Agenda.Fecha_Fin = new Date($scope.Agenda.Fecha_Fin + 'Z');

                if ($scope.Agenda.Fecha_Inicio.getHours() === $scope.Agenda.Fecha_Fin.getHours() && $scope.Agenda.Fecha_Inicio.getMinutes() === $scope.Agenda.Fecha_Fin.getMinutes()) {
                    toastr.info('Debe especificar la duración de la cita seleccionando una hora fin', '', $scope.toastrOptions);
                    $('#timeFin').focus();
                    return false;
                }

                if ($scope.Agenda.Observaciones === '' || $scope.Agenda.Observaciones === null) {
                    toastr.info('El campo "Observaciones" no puede estar vacío', '', $scope.toastrOptions);
                    $('#txtObservaciones').focus();
                    return false;
                }

                $scope.Agenda.Estado = 'PROGRAMADA';
                let nombreempresa = Enumerable.From(angular.copy($rootScope.Empresas))
                    .Where(x => { return x.id_Empresa === $scope.IdEmpresa })
                    .ToArray();

                $scope.Agenda.Nombre_Empresa = nombreempresa[0].nombre;

                return true;
            } else if ($scope.fEditAgenda) {
                if ($scope.EmpleadoSeleccionadoModal === '' || $scope.EmpleadoSeleccionadoModal === null || $scope.EmpleadoSeleccionadoModal === undefined) {
                    toastr.info('Debe seleccionar un empleado', '', $scope.toastrOptions);
                    $('#acEmpleadosModal').focus();
                    return false;
                }

                $scope.Agenda.Id_Empleado = $scope.EmpleadoSeleccionadoModal.id_Empleado;

                if ($scope.ClienteSeleccionadoModal === '' || $scope.ClienteSeleccionadoModal === null || $scope.ClienteSeleccionadoModal === undefined) {
                    toastr.info('Debe seleccionar un cliente', '', $scope.toastrOptions);
                    $('#acClientesModal').focus();
                    return false;
                }

                $scope.Agenda.Id_Cliente = $scope.ClienteSeleccionadoModal.id_Cliente;

                if ($scope.ServicioSeleccionadoModal === -1 || $scope.ServicioSeleccionadoModal === null) {
                    toastr.info('Debe seleccionar un servicio', '', $scope.toastrOptions);
                    $('#slServiciosModal').focus();
                    return false;
                }

                $scope.Agenda.Id_Servicio = $scope.ServicioSeleccionadoModal;

                if ($scope.FechaInicio === undefined) {
                    toastr.warning('Formato de fecha inválido', '', $scope.toastrOptions);
                    $('#dpFecha').focus();
                    return false;
                }

                if ($scope.FechaInicio === '' || $scope.FechaInicio === null) {
                    toastr.info('Debe seleccionar una fecha', '', $scope.toastrOptions);
                    $('#dpFecha').focus();
                    return false;
                }

                if ($scope.HoraInicio === undefined) {
                    toastr.warning('Formato de hora inválido ', '', $scope.toastrOptions);
                    $('#timeInicio').focus();
                    return false;
                }

                if ($scope.HoraInicio === '' || $scope.HoraInicio === null) {
                    toastr.info('Debe seleccionar una hora de inicio', '', $scope.toastrOptions);
                    $('#timeInicio').focus();
                    return false;
                }

                if ($scope.HoraFin === undefined) {
                    toastr.warning('Formato de hora inválido ', '', $scope.toastrOptions);
                    $('#timeFin').focus();
                    return false;
                }

                if ($scope.HoraFin === '' || $scope.HoraFin === null) {
                    toastr.info('Debe seleccionar una hora fin', '', $scope.toastrOptions);
                    $('#timeFin').focus();
                    return false;
                }

                $scope.Agenda.Fecha_Inicio = angular.copy($scope.FechaInicio);
                $scope.Agenda.Fecha_Inicio.setHours($scope.HoraInicio.getHours(), $scope.HoraInicio.getMinutes(), 0, 0);
                $scope.Agenda.Fecha_Fin = angular.copy($scope.FechaInicio);
                $scope.Agenda.Fecha_Fin.setHours($scope.HoraFin.getHours(), $scope.HoraFin.getMinutes(), 0, 0);

                if ($scope.Agenda.Fecha_Inicio.getHours() === $scope.Agenda.Fecha_Fin.getHours() && $scope.Agenda.Fecha_Inicio.getMinutes() === $scope.Agenda.Fecha_Fin.getMinutes()) {
                    toastr.info('Debe especificar la duración de la cita seleccionando una hora fin', '', $scope.toastrOptions);
                    $('#timeFin').focus();
                    return false;
                }

                if ($scope.Agenda.Observaciones === '' || $scope.Agenda.Observaciones === null) {
                    toastr.info('El campo "Observaciones" no puede estar vacío', '', $scope.toastrOptions);
                    $('#txtObservaciones').focus();
                    return false;
                }

                $scope.Agenda.Estado = 'PROGRAMADA';

                $scope.Agenda.Fecha_Inicio = new Date($scope.Agenda.Fecha_Inicio + 'Z');
                $scope.Agenda.Fecha_Fin = new Date($scope.Agenda.Fecha_Fin + 'Z');
                return true;
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarDatosConsulta = function () {
        try {
            if ($scope.fActiveTab === 'General') {
                if ($scope.FechaBusqueda === '' || $scope.FechaBusqueda === null || $scope.FechaBusqueda === undefined) {
                    toastr.warning('Formato de fecha inválido. Debe seleccionar una fecha', '', $scope.toastrOptions);
                    $('#dpFechaBusqueda').focus();
                    return false;
                }
                $scope.Agenda.Fecha_Inicio = angular.copy($scope.FechaBusqueda);
                $scope.Agenda.Fecha_Inicio = new Date($scope.Agenda.Fecha_Inicio + 'Z');
                $scope.Agenda.Fecha_Fin = angular.copy($scope.FechaBusqueda);
                $scope.Agenda.Fecha_Fin = new Date($scope.Agenda.Fecha_Fin + 'Z');

                if ($scope.EmpleadoSeleccionado === '' || $scope.EmpleadoSeleccionado === null || $scope.EmpleadoSeleccionado === undefined)
                    $scope.Agenda.Id_Empleado = -1;
                else
                    $scope.Agenda.Id_Empleado = $scope.EmpleadoSeleccionado.id_Empleado;

                if ($scope.ClienteSeleccionado === '' || $scope.ClienteSeleccionado === null || $scope.ClienteSeleccionado === undefined)
                    $scope.Agenda.Id_Cliente = -1;
                else
                    $scope.Agenda.Id_Cliente = $scope.ClienteSeleccionado.id_Cliente;

                if ($scope.ServicioSeleccionado === -1 || $scope.ServicioSeleccionado === null || $scope.ServicioSeleccionado === undefined)
                    $scope.Agenda.Id_Servicio = -1;
                else
                    $scope.Agenda.Id_Servicio = $scope.ServicioSeleccionado;

                if ($scope.EstadoSeleccionado === -1 || $scope.EstadoSeleccionado === null || $scope.EstadoSeleccionado === undefined)
                    $scope.Agenda.Estado = null;
                else {
                    let estado = Enumerable.From($scope.Estado)
                        .Where(function (x) { return x.id_Estado === $scope.EstadoSeleccionado })
                        .ToArray();
                    $scope.Agenda.Estado = estado[0].Nombre;
                }
                return true;
            } else if ($scope.fActiveTab === 'Detallada') {
                if ($scope.FechaActual === '' || $scope.FechaActual === null || $scope.FechaActual === undefined) {
                    toastr.warning('Formato de fecha inválido. Debe seleccionar una fecha', '', $scope.toastrOptions);
                    $('#dpFechaActual').focus();
                    return false;
                }
                $scope.Agenda.Fecha_Inicio = angular.copy($scope.FechaActual);
                $scope.Agenda.Fecha_Inicio = new Date($scope.Agenda.Fecha_Inicio + 'Z');
                $scope.Agenda.Fecha_Fin = angular.copy($scope.FechaActual);
                $scope.Agenda.Fecha_Fin = new Date($scope.Agenda.Fecha_Fin + 'Z');

                $scope.Agenda.Id_Empleado = -1;
                $scope.Agenda.Id_Cliente = -1;
                $scope.Agenda.Id_Servicio = -1;
                $scope.Agenda.Estado = null;

                if (!$scope.MostrarCanceladasDetallada)
                    $scope.Agenda.Traer_Canceladas = false;
                else
                    $scope.Agenda.Traer_Canceladas = true;
                return true;
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

    $scope.ModalAgendaGeneral = function () {
        try {
            if ($scope.fPropertiesSetted) {
                if ($scope.ValidarEmpleadosClientesServicios()) {
                    if ($scope.fEditAgenda) {
                        $scope.AccionAgenda = 'Modificar cita';
                    }
                    else {
                        $scope.LimpiarDatos();
                        $scope.FechaHoraAgendaGeneral();
                        $scope.AccionAgenda = 'Agendar cita';
                    }

                    $scope.ConsultarNumeroCitasDia();

                    $mdDialog.show({
                        contentElement: '#dlgAgendaGeneral',
                        parent: angular.element(document.body),
                        targetEvent: event,
                        clickOutsideToClose: true,
                        multiple: true,
                    })
                        .then(function () {
                            $('#acEmpleados').focus();
                        }, function () {
                            $scope.LimpiarDatos();
                        });
                }
            }
            else
                toastr.warning('Para utilizar el módulo agenda, debe configurar las propiedades de la empresa', '', $scope.toastrOptions);
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalAgendaDetallada = function (horas, empleado, minutos) {
        try {
            if ($scope.fPropertiesSetted) {
                if ($scope.FechaActual === null || $scope.FechaActual === undefined || $scope.FechaActual === '') {
                    toastr.info('Formato de fecha inválido', '', $scope.toastrOptions);
                    return;
                }

                if (parseInt($filter('date')($scope.FechaActual, 'yyyyMMdd')) < parseInt($filter('date')(new Date(), 'yyyyMMdd'))) {
                    toastr.info('Solo puede programar agenda a partir de la fecha actual', '', $scope.toastrOptions);
                    $scope.FechaActual = new Date();
                    return;
                }

                $scope.LimpiarDatos();
                $scope.FechaHoraAgendaDetallada(horas, minutos);
                
                if (parseInt($filter('date')(new Date($scope.FechaActual), 'yyyyMMdd')) === parseInt($filter('date')(new Date(), 'yyyyMMdd'))) {
                    if (parseInt($filter('date')(new Date($scope.HoraFin), 'HHmm')) < parseInt($filter('date')(new Date(), 'HHmm'))) {
                        toastr.info('Solo puede agendar citas a partir de la hora actual ', '', $scope.toastrOptions);
                        $scope.FechaHoraAgendaGeneral();
                        return;
                    }
                }

                $scope.EmpleadoSeleccionadoModal = {
                    id_Empleado: empleado.id_Empleado,
                    nombres: empleado.nombres
                };

                if (empleado.criterio === 'PAGO_PORCENTUAL') {
                    $scope.ConsultarEmpleadoServicio(empleado.id_Empleado);
                }

                $scope.ConsultarNumeroCitasDia();

                $scope.AccionAgenda = 'Agendar cita';
                $scope.fDisableFechaCita = true;
                $scope.fDisableHoraInicio = true;

                $mdDialog.show({
                    contentElement: '#dlgAgendaGeneral',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    multiple: true,
                })
                    .then(function () {
                    }, function () {
                        $scope.LimpiarDatos();
                    });
            }
            else
                toastr.warning('Para utilizar el módulo agenda, debe configurar las propiedades de la empresa', '', $scope.toastrOptions);
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalFiltrarCitas = function () {
        try {
            $scope.AccionAgenda = 'Opciones de consulta';

            $mdDialog.show({
                contentElement: '#dlgFiltrarAgenda',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true,
            })
                .then(function () {
                }, function () {
                    $scope.LimpiarDatos();
                });
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.showConfirmCancelarAgenda = function (ev, data) {
        try {
            let confirm = $mdDialog.confirm()
                .title('Agenda')
                .textContent('¿Desea cancelar la cita?')
                .ariaLabel('Cancelar Cita')
                .targetEvent(ev, data)
                .ok('Sí')
                .cancel('No')
                .multiple(true);

            $mdDialog.show(confirm).then(function () {
                $scope.CancelarAgenda(data);
            }, function () {
                return;
            });
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    };

    $scope.showConfirmConfirmarAgenda = function (ev, data) {
        try {
            let confirm = $mdDialog.confirm()
                .title('Agenda')
                .textContent('¿Desea confirmar la cita?')
                .ariaLabel('Confirmar Cita')
                .targetEvent(ev, data)
                .ok('Sí')
                .cancel('No')
                .multiple(true);

            $mdDialog.show(confirm).then(function () {
                $scope.ConfirmarAgenda(data);
            }, function () {
                return;
            });
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    };

    $scope.FechaHoraAgendaGeneral = function () {
        try {
            $scope.FechaActual = new Date();
            $scope.HoraActual = new Date($scope.FechaActual.getFullYear(), $scope.FechaActual.getMonth(), $scope.FechaActual.getDate(), $scope.FechaActual.getHours(), $scope.FechaActual.getMinutes());
            $scope.FechaInicio = angular.copy($scope.FechaActual);
            $scope.FechaInicio = new Date($scope.FechaInicio.setHours(($scope.FechaInicio.getHours() + 1), 0, 0));
            $scope.HoraInicio = new Date($scope.FechaInicio.getFullYear(), $scope.FechaInicio.getMonth(), $scope.FechaInicio.getDate(), $scope.FechaInicio.getHours(), $scope.FechaInicio.getMinutes());
            $scope.HoraFin = angular.copy($scope.HoraInicio);
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.FechaHoraAgendaDetallada = function (horas) {
        try {
            $scope.HoraActual = new Date($scope.FechaActual.getFullYear(), $scope.FechaActual.getMonth(), $scope.FechaActual.getDate(), $scope.FechaActual.getHours(), $scope.FechaActual.getMinutes());
            let setHora = 0;
            let setMinutos = 0;
            let minutos = horas.substring(
                horas.lastIndexOf(":") + 1,
                horas.lastIndexOf(" ")
            );
            if (horas.indexOf('PM') !== -1 && horas !== '12:00 PM' && horas !== '12:30 PM') {
                horas = horas.replace('PM', '');
                setHora = parseInt(horas) + 12;
                if (minutos === '00')
                    setMinutos = '0';
                else
                    setMinutos = '30';
            } else {
                if (horas === '12:00 PM')
                    horas = horas.replace('PM', '');
                else
                    horas = horas.replace('AM', '');

                setHora = parseInt(horas);

                if (minutos === '00')
                    setMinutos = 0;
                else
                    setMinutos = 30;
            }

            $scope.FechaInicio = angular.copy($scope.FechaActual);
            $scope.FechaInicio = new Date(($scope.FechaInicio).setHours(setHora, setMinutos, 0, 0));
            $scope.FechaFin = angular.copy($scope.FechaInicio);
            $scope.HoraInicio = new Date($scope.FechaInicio.getFullYear(), $scope.FechaInicio.getMonth(), $scope.FechaInicio.getDate(), $scope.FechaInicio.getHours(), $scope.FechaInicio.getMinutes());
            $scope.HoraFin = angular.copy($scope.HoraInicio);
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarFechaModal = function () {
        try {
            if ($scope.FechaInicio === undefined) {
                toastr.warning('Formato de fecha invalido ', '', $scope.toastrOptions);
                return;
            }

            if (parseInt($filter('date')($scope.FechaInicio, 'yyyyMMdd')) < parseInt($filter('date')($scope.FechaActual, 'yyyyMMdd'))) {
                $scope.FechaInicio = angular.copy($scope.FechaActual);
                toastr.info('Solo puede programar agenda a partir de la fecha actual', '', $scope.toastrOptions);
            }

            if (parseInt($filter('date')(new Date($scope.FechaInicio), 'yyyyMMdd')) === parseInt($filter('date')(new Date(), 'yyyyMMdd'))) {
                if (parseInt($filter('date')(new Date($scope.HoraFin), 'HHmm')) < parseInt($filter('date')(new Date(), 'HHmm'))) {
                    toastr.info('Solo puede agendar citas a partir de la hora actual ', '', $scope.toastrOptions);
                    $scope.FechaHoraAgendaGeneral();
                    return;
                }
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarHoraFin = function () {
        try {
            if ($scope.HoraFin === undefined || $scope.HoraFin === null) {
                toastr.warning('Formato de hora invalido ', '', $scope.toastrOptions);
                return;
            }

            if (parseInt($filter('date')(new Date($scope.FechaInicio), 'yyyyMMdd')) === parseInt($filter('date')(new Date(), 'yyyyMMdd'))) {
                if (parseInt($filter('date')(new Date($scope.HoraFin), 'HHmm')) < parseInt($filter('date')(new Date(), 'HHmm'))) {
                    toastr.info('Solo puede agendar citas a partir de la hora actual ', '', $scope.toastrOptions);
                    $scope.FechaHoraAgendaGeneral();
                    return;
                }
            }

            if ($scope.HoraFin.getHours() < $scope.HoraInicio.getHours())
                $scope.HoraInicio = $scope.HoraFin;

            if ($scope.HoraFin.getHours() === $scope.HoraInicio.getHours() && $scope.HoraFin.getMinutes() < $scope.HoraInicio.getMinutes())
                $scope.HoraInicio = $scope.HoraFin;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.CalcularHoraFin = function () {
        try {
            let IdServicio = $scope.ServicioSeleccionadoModal;
            if ($scope.HoraInicio === undefined || $scope.HoraInicio === null) {
                toastr.warning('Formato de hora invalido ', '', $scope.toastrOptions);
                return;
            }

            if ($scope.PAPTS) {
                if ($scope.ServicioSeleccionadoModal !== -1 && IdServicio !== undefined && IdServicio !== null) {
                    if (parseInt($filter('date')(new Date($scope.FechaInicio), 'yyyyMMdd')) === parseInt($filter('date')(new Date(), 'yyyyMMdd'))) {
                        if (parseInt($filter('date')(new Date($scope.HoraInicio), 'HHmm')) < (parseInt($filter('date')(new Date(), 'HHmm')) + 60)) {
                            toastr.info('Solo puede agendar citas a partir de la hora actual ', '', $scope.toastrOptions);
                            $scope.FechaHoraAgendaGeneral();
                            return;
                        }
                    }

                    let tiemposervicio = Enumerable.From($scope.AgendaServicios)
                        .Where(function (x) { return x.id_Servicio === IdServicio })
                        .ToArray();

                    if (tiemposervicio[0].tiempo === 0 || tiemposervicio[0].tiempo === null || tiemposervicio[0].tiempo === undefined) {
                        toastr.warning('La configuración de esta empresa requiere que los servicios tengan un tiempo definido', '', $scope.toastrOptions);
                        $scope.ServicioSeleccionadoModal = -1;
                        $scope.HoraFin = angular.copy($scope.HoraInicio);
                        return;
                    }
                    else {
                        $scope.HoraFin = angular.copy($scope.HoraInicio);
                        $scope.HoraFin.setMinutes($scope.HoraFin.getMinutes() + tiemposervicio[0].tiempo);
                    }
                }
                else {
                    $scope.FechaHoraAgendaGeneral();
                }
            } else if (!$scope.PAPTS) {
                if (IdServicio !== -1 && IdServicio !== undefined && IdServicio !== null) {
                    if (parseInt($filter('date')(new Date($scope.FechaInicio), 'yyyyMMdd')) === parseInt($filter('date')(new Date(), 'yyyyMMdd'))) {
                        if (parseInt($filter('date')(new Date($scope.HoraInicio), 'HHmm')) < parseInt($filter('date')(new Date(), 'HHmm'))) {
                            toastr.info('Solo puede agendar citas a partir de la hora actual ', '', $scope.toastrOptions);
                            $scope.FechaHoraAgendaGeneral();
                            return;
                        }
                    }

                    if ($scope.HoraInicio.getHours() > $scope.HoraFin.getHours())
                        $scope.HoraFin = $scope.HoraInicio;

                    if ($scope.HoraInicio.getHours() === $scope.HoraFin.getHours() && $scope.HoraInicio.getMinutes() > $scope.HoraFin.getMinutes())
                        $scope.HoraFin = $scope.HoraInicio;

                    let tiemposervicio = Enumerable.From($scope.AgendaServicios)
                        .Where(function (x) { return x.id_Servicio === IdServicio })
                        .ToArray();

                    if (tiemposervicio[0].tiempo === 0 || tiemposervicio[0].tiempo === null || tiemposervicio[0].tiempo === undefined) {
                        $scope.HoraFin = angular.copy($scope.HoraInicio);
                        return;
                    }
                    else {
                        $scope.HoraFin = angular.copy($scope.HoraInicio);
                        $scope.HoraFin.setMinutes($scope.HoraFin.getMinutes() + tiemposervicio[0].tiempo);
                    }
                }
                else {
                    $scope.FechaHoraAgendaGeneral();
                }
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.GenerarArregloRangoHoras = function () {
        try {
            let cont = 0;
            let rangoinicial = '';
            let rangofinal = '';
            $scope.BlankCells = [];
            if ($scope.RHA !== null && $scope.RHA !== undefined && $scope.RHA !== '') {
                rangoinicial = $scope.RHA.substring(0, 2);
                rangofinal = $scope.RHA.substring($scope.RHA.length - 2);
            } else {
                rangoinicial = '7';
                rangofinal = '21';
            }

            for (i = parseInt(rangoinicial); i <= parseInt(rangofinal); i++) {
                if (i < 12) {
                    $scope.RangoHoras[cont] = i + ':00 AM';
                    cont++;
                    $scope.RangoHoras[cont] = i + ':30 AM';
                }
                if (i === 12) {
                    $scope.RangoHoras[cont] = i + ':00 PM';
                    cont++;
                    $scope.RangoHoras[cont] = i + ':30 PM';
                }
                if (i > 12) {
                    $scope.RangoHoras[cont] = (i - 12) + ':00 PM';
                    cont++;
                    $scope.RangoHoras[cont] = (i - 12) + ':30 PM';
                }
                cont++;
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.CardsDetalladaStyle=  function(agenda) {
        try {
            let estado = agenda.estado;
            if (estado === 'PROGRAMADA') {
                return 'detallada-programada';
            } else if (estado === 'CONFIRMADA') {
                return 'detallada-confirmada';
            } else if (estado === 'CANCELADA') {
                return 'detallada-cancelada';
            } else if (estado === 'FACTURADA') {
                return 'detallada-facturada';
            } else if (estado === 'LIQUIDADA') {
                return 'detallada-liquidada';
            } 
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }

    }

    $scope.CalcularAlturaDiv = function (agenda) {
        try {
            let alturadivcita = 0;
            alturadivcita = Math.abs(new Date(agenda.fecha_Fin) - new Date(agenda.fecha_Inicio));
            alturadivcita = Math.floor((alturadivcita / 1000) / 60);
            alturadivcita = (alturadivcita * 72) / 60;
            return alturadivcita;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.LimpiarAgenda = function () {
        $scope.Agendas = [];
    }

    $scope.BackgroundCards = function (estado) {
        try {
            if (estado === 'CONFIRMADA')
                return 'confirmada-cards';
            if (estado === 'CANCELADA')
                return 'cancelada-cards';
            if (estado === 'PROGRAMADA')
                return 'programada-cards';
            if (estado === 'LIQUIDADA')
                return 'liquidada-cards';
            if (estado === 'FACTURADA')
                return 'facturada-cards';
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.BackgroundShowMore = function (estado) {
        try {
            if (estado === 'CONFIRMADA')
                return 'confirmada-moreinfo';
            if (estado === 'CANCELADA')
                return 'cancelada-moreinfo';
            if (estado === 'PROGRAMADA')
                return 'programada-moreinfo';
            if (estado === 'LIQUIDADA')
                return 'liquidada-moreinfo';
            if (estado === 'FACTURADA')
                return 'facturada-moreinfo';
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.Cancelar = function () {
        $scope.LimpiarDatos();
        $mdDialog.cancel();
    };

    $scope.$on("CompanyChange", function () {
        $scope.LimpiarDatos();
        $scope.Agendas = [];
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.EmpresaPropiedades = $filter('filter')($rootScope.EmpresaPropiedades, { id_Empresa: $scope.IdEmpresa });
        $scope.ConsultarServiciosActivos();
        $scope.ConsultarEmpleadosAutoComplete();
        $scope.ConsultarClientes();
        $scope.ConfiguracionEmpresaActual();
        $scope.GenerarArregloRangoHoras();
        if ($scope.fActiveTab === 'General')
            $scope.ModalFiltrarCitas();
    });

    $scope.ConsultarServiciosActivos();
    $scope.ConsultarEmpleadosAutoComplete();
    $scope.ConsultarClientes();
    $scope.ConfiguracionEmpresaActual();
    $scope.GenerarArregloRangoHoras();
    $scope.ModalFiltrarCitas();
}