﻿angular.module('app.controllers')
    .controller("AdministratorPanelController", AdministratorPanelController);

AdministratorPanelController.$inject = ['$scope', '$rootScope', '$state', '$location', '$filter', '$http', '$mdToast', '$document', '$mdDialog', '$rootScope', '$timeout', 'localStorageService', 'AuthService', 'SPAService'];

function AdministratorPanelController($scope, $rootScope, $state, $location, $filter, $http, $mdToast, $document, $mdDialog, $rootScope, $timeout, localStorageService, AuthService, SPAService) {
    $scope.fActiveTab = 'Datos Maestros';
    $scope.CategoriaServicios = [];
    $scope.SedesPrincipales = [];
    const mail_expression = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,5}$/;

    $scope.Empresa =
    {
        Id_Empresa: '00000000-0000-0000-0000-000000000000',
        Nombre: '',
        Descripcion: '',
        Telefono_Fijo: '',
        Telefono_Movil: '',
        Mail: '',
        Logo: null,
        Direccion: '',
        Id_SedePrincipal: '',
        Id_Categoria_Servicio: '',
        Estado: '',
        Contacto: '',
        Id_Barrio: -1
    };

    $scope.Usuario = {
        Id_Usuario: -1,
        Nombre: '',
        Contrasenia: '',
        Perfil: '',
        Id_Empresa: $scope.IdEmpresa,
        Mail: '',
        Logo_Base64: null,
        Menu_Usuario: $scope.Menu,
        PasswordHasChanged: $scope.PasswordHasChanged
    }

    $scope.Servicio = {
        Id_Servicio: -1,
        Nombre: '',
        Descripcion: '',
        Id_Categoria_Servicio: '',
        Id_TipoServicio: ''
    }

    $scope.TipoPerfil =
        [
            { id_TipoPerfil: -1, Nombre: "[Seleccione]" },
            { id_TipoPerfil: 1, Nombre: "Administrador" },
            { id_TipoPerfil: 2, Nombre: "Invitado" }
        ];
    $scope.TipoPerfil = $filter('orderBy')($scope.TipoPerfil, 'Nombre', false);

    $scope.Barrios = [];
    $scope.Barrios.push({ id_Barrio: -1, nombre: '[Seleccione]', id_Municipio: -1, codigo: "-1", id_Object: -1 });
    $scope.TipoServiciosFiltrado = [];
    $scope.TipoServiciosFiltrado.push({ id_TipoServicio: -1, nombre: '[Seleccione]' });
    $scope.TipoServiciosFiltrado = $filter('orderBy')($scope.TipoServiciosFiltrado, 'id_TipoServicio', false);

    $scope.BarrioSeleccionado = -1;
    $scope.CategoriaSeleccionada = -1;
    $scope.TipoServicioSeleccionado = -1;
    $scope.SedePrincipalSeleccionada = -1;
    $scope.EstadoSeleccionado = 'ACTIVA';
    $scope.LogoEmpresa = '../Images/template/tulogo.png';
    $scope.ImagenUsuario = '../Images/default-perfil.png';

    $scope.TipoPerfilSeleccionado = -1;
    $scope.EmpresaSeleccionada = -1;

    $scope.UserAvatar = '../../Images/default-perfil.png';

    if ($rootScope.Empresas !== undefined) {
        if ($rootScope.Empresas.length === 0) {
            $scope.Empresas = [];
            $scope.MultipleEmpresa = false;
            $scope.EmpresaSeleccionada = '00000000-0000-0000-0000-000000000000';
        } else {
            $scope.Empresas = [];
            $scope.Empresas = $rootScope.Empresas;
            if ($scope.Empresas.length > 1) {
                $scope.EmpresaSeleccionada = $rootScope.Empresas[0].id_Empresa;
                $rootScope.Id_Empresa = $scope.EmpresaSeleccionada;
                $scope.MultipleEmpresa = true;
            } else if ($scope.Empresas.length === 1 && $rootScope.Id_Empresa === '00000000-0000-0000-0000-000000000000') {
                $scope.EmpresaSeleccionada = $rootScope.Empresas[0].id_Empresa;
                $rootScope.Nombre_Empresa = $rootScope.Empresas[0].nombre;
                $rootScope.Id_Empresa = $scope.EmpresaSeleccionada;
                $scope.MultipleEmpresa = false
            } else $scope.MultipleEmpresa = false;
        }
    }

    $scope.Logout = function () {
        AuthService.logOut();
        $('body>.tooltip').remove();
    }

    $scope.UsuarioSistema = $rootScope.userData.userName;
    $scope.NombreEmpresa = $rootScope.Nombre_Empresa;
    $scope.UserId = $rootScope.userData.userId;

    $scope.$on('successfull.useravatarload', function () {
        if ($rootScope.UserAvatar !== null && $rootScope.UserAvatar !== undefined)
            $scope.UserAvatar = $rootScope.UserAvatar;
    });

    if ($rootScope.UserAvatar !== null && $rootScope.UserAvatar !== undefined)
        $scope.UserAvatar = $rootScope.UserAvatar;

    $scope.$on('successfull.companiesLoaded', function () {
        $scope.Empresas = [];
        if ($scope.Empresas.length == 0)
            $scope.Empresas = $rootScope.Empresas;

        if ($scope.Empresas.length > 1) {
            $scope.EmpresaSeleccionada = $scope.Empresas[0].id_Empresa;
            $rootScope.Id_Empresa = $scope.EmpresaSeleccionada;
            $scope.MultipleEmpresa = true;
        } else if ($scope.Empresas.length === 1 && $rootScope.Id_Empresa === '00000000-0000-0000-0000-000000000000') {
            $scope.EmpresaSeleccionada = $rootScope.Empresas[0].id_Empresa;
            $rootScope.Nombre_Empresa = $rootScope.Empresas[0].nombre;
            $rootScope.Id_Empresa = $scope.EmpresaSeleccionada;
            $scope.MultipleEmpresa = false
        } else $scope.MultipleEmpresa = false;

        $scope.NombreEmpresa = $rootScope.Nombre_Empresa;
    });

    $scope.$on('failed.empresapropiedadesload', function () {
        if ($rootScope.Errores !== undefined && $rootScope.Errores !== '') {
            toastr.error($rootScope.Errores, '', $scope.toastrOptions);
        }
    });

    $scope.$on('failed.sistemapropiedadesload', function () {
        if ($rootScope.Errores !== undefined && $rootScope.Errores !== '') {
            toastr.error($rootScope.Errores, '', $scope.toastrOptions);
        }
    });

    $scope.EmpresasGridOptionsColumns = [
        {
            headerName: "", field: "", suppressMenu: true, visible: true, width: 20, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
            cellRenderer: function () {
                return "<i data-ng-click='ConsultarEmpresa (data)' data-toggle='tooltip' title='Editar empresa' class='material-icons' style='font-size:25px;margin-top:-1px;color:#f17325;'>create</i>";
            },
        },
        {
            headerName: "Nombre", field: 'nombre', width: 200, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Mail", field: 'mail', width: 160, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Dirección", field: 'direccion', width: 160, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Sede Principal", field: 'nombre_SedePrincipal', width: 200, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Estado", field: 'estado', width: 90, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }, suppressSizeToFit: true
        },
        {
            headerName: "Celular", field: 'telefono_Movil', width: 100, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' }, suppressSizeToFit: true
        },
    ];

    $scope.EmpresasGridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: $scope.EmpresasGridOptionsColumns,
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

    $scope.UsuariosAdminGridOptionsColumns = [
        {
            headerName: "Nombre", field: 'nombre', width: 160, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }, suppressSizeToFit: true
        },
        {
            headerName: "Empresa", field: 'nombre_Empresa', width: 100, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Mail", field: 'mail', width: 90, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Fecha Registro", field: 'fecha_Registro', width: 150, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, suppressSizeToFit: true, cellRenderer: (data) => {
                return data.value ? $filter('date')(new Date(data.value), 'MM/dd/yyyy') : '';
            }
        },
        {
            headerName: "Perfil", field: 'perfil', width: 160, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }, suppressSizeToFit: true
        }
    ];

    $scope.UsuariosAdminGridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: $scope.UsuariosAdminGridOptionsColumns,
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
        onRowClicked: OnRowClickedUsuarios
    }

    $scope.ServiciosGridOptionsColumns = [
        {
            headerName: "", field: "", suppressMenu: true, visible: true, width: 20, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
            cellRenderer: function () {
                return "<i data-ng-click='ConsultarServicio (data)' data-toggle='tooltip' title='Editar servicio' class='material-icons' style='font-size:25px;margin-top:-1px;color:#f17325;'>create</i>";
            },
        },
        {
            headerName: "Nombre", field: 'nombre', width: 200, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Descripción", field: 'descripcion', width: 260, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Tipo", field: 'nombre_Tipo_Servicio', width: 120, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Categoría", field: 'nombre_Categoria_Servicio', width: 120, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        }
    ];

    $scope.ServiciosGridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: $scope.ServiciosGridOptionsColumns,
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
                            $scope.BarrioSeleccionado = -1;
                        } else {
                            $scope.Barrios.push({ id_Barrio: -1, nombre: '[Seleccione]', id_Municipio: -1, codigo: "-1", id_Object: -1 });
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
                        $scope.MunicipioSeleccionado = -1;
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarCategoriaServicios = function () {
        SPAService._consultarCategoriaServicios()
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.CategoriaServicios = [];
                        $scope.CategoriaServicios = result.data;
                        $scope.CategoriaServicios.push({ id_Categoria_Servicio: -1, nombre: '[Seleccione]' });
                        $scope.CategoriaServicios = $filter('orderBy')($scope.CategoriaServicios, 'id_Categoria_Servicio', false);
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

    $scope.ConsultarMenuAdmin = function () {
        SPAService._consultarMenuAdmin()
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.MenuAdmin = [];
                        $scope.MenuAdmin = result.data;
                        $rootScope.Menu = $scope.MenuAdmin;
                        $scope.Menu = angular.copy($scope.MenuAdmin);
                        $scope.Menu = $scope.Menu.map(function (e) {
                            return { Id_Usuario: -1, Id_Menu: e.id_Menu, Descripcion: e.descripcion, Estado: true }
                        });

                        $scope.Menu = $filter('orderBy')($scope.Menu, 'nombre', false);
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarEmpresasAdmin = function () {
        SPAService._consultarEmpresasAdmin()
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.EmpresasAdmin = [];
                        $scope.EmpresasAdmin = result.data;
                        $scope.EmpresasCopy = angular.copy($scope.EmpresasAdmin);
                        $scope.EmpresasCopy.push({ id_Empresa: -1, nombre: '[Seleccione]' });
                        $scope.EmpresasCopy = $filter('orderBy')($scope.EmpresasCopy, 'id_Empresa', false);

                        $rootScope.Empresas = angular.copy($scope.EmpresasAdmin);
                        $scope.EmpresasGridOptions.api.setRowData($scope.EmpresasAdmin);

                        $timeout(function () {
                            $scope.EmpresasGridOptions.api.sizeColumnsToFit();
                        }, 200);
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarSedesPrincipales = function () {
        SPAService._consultarSedesPrincipales()
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.SedesPrincipales = [];
                        $scope.SedesPrincipales = result.data;
                        $scope.SedesPrincipales.push({ id_Empresa: -1, nombre: '[Seleccione]' });
                        $scope.SedesPrincipales = $filter('orderBy')($scope.SedesPrincipales, 'id_Empresa', false);
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarServiciosAdmin = function () {
        SPAService._consultarServiciosAdmin()
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.ServiciosMaestros = [];
                        $scope.ServiciosMaestros = result.data;

                        $scope.ServiciosGridOptions.api.setRowData($scope.ServiciosMaestros);

                        $timeout(function () {
                            $scope.ServiciosGridOptions.api.sizeColumnsToFit();
                        }, 200);
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarUsuariosAdmin = function () {
        SPAService._consultarUsuariosAdmin()
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.UsuariosAdmin = [];
                        $scope.UsuariosAdmin = result.data;
                        $scope.UsuariosAdminGridOptions.api.setRowData($scope.UsuariosAdmin);
                        $timeout(function () {
                            $scope.UsuariosAdminGridOptions.api.sizeColumnsToFit();
                        }, 200);
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarUsuarioAdmin = function (e, Nombre) {
        if (Nombre !== null && Nombre !== '' && $scope.EditarUsuario === false) {
            SPAService._consultarUsuario(Nombre)
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.info('Ya existe ese nombre de usuario. Debe ingresar uno diferente', '', $scope.toastrOptions);
                            $('#txtUsuario').focus();
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    $scope.GuardarEmpresa = function () {
        if ($scope.ValidarDatosEmpresa()) {
            SPAService._guardarEmpresa($scope.Empresa)
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Empresa registrada y/o actualizada correctamente', '', $scope.toastrOptions);
                            $scope.LimpiarDatos();
                            $scope.ConsultarEmpresasAdmin();
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    $scope.GuardarUsuarioAdmin = function () {
        if ($scope.ValidarUsuarioAdmin()) {
            SPAService._guardarUsuario(JSON.stringify($scope.Usuario))
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Usuario registrado/actualizado correctamente', '', $scope.toastrOptions);
                            $scope.ConsultarUsuariosAdmin();
                            $scope.LimpiarDatos();
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    $scope.GuardarServicioAdmin = function () {
        if ($scope.ValidarServiciosAdmin()) {
            SPAService._guardarServicioAdmin($scope.Servicio)
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Servicio maestro registrado/actualizado correctamente', '', $scope.toastrOptions);
                            $scope.ConsultarServiciosAdmin();
                            $scope.LimpiarDatos();

                            if ($scope.AccionServicio === 'Actualizar Servicio')
                                $scope.Cancelar();
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    function OnRowClickedUsuarios(event) {
        try {
            $scope.LimpiarDatos();
            if (event.node.data !== undefined && event.node.data !== null) {
                $scope.EditarUsuario = true;
                $scope.Usuario.Id_Usuario = event.node.data.id_Usuario;
                $scope.Usuario.Nombre = event.node.data.nombre;
                $scope.Usuario.Contrasenia = event.node.data.contrasenia;
                $scope.Usuario.Mail = event.node.data.mail;
                $scope.Usuario.Id_Empresa = event.node.data.id_Empresa;
                $scope.PasswordBackup = angular.copy(event.node.data.contrasenia);

                if (event.node.data.logo_Base64 !== null)
                    $scope.ImagenUsuario = event.node.data.logo_Base64;
                else
                    $scope.ImagenUsuario = '../Images/default-perfil.png';

                $scope.Usuario.Logo_Base64 = $scope.ImagenUsuario;
                $scope.Menu = event.node.data.menu_Usuario;
                $scope.Menu = $scope.Menu.map(function (e) {
                    return { Id_Menu_Usuario: e.id_Menu_Usuario, Id_Usuario: e.id_Usuario, Id_Menu: e.id_Menu, Estado: e.estado, Descripcion: e.descripcion }
                });

                $scope.Menu = $filter('orderBy')($scope.Menu, 'nombre', false);

                $scope.Usuario.Menu_Usuario = $scope.Menu;
                $scope.Confirmacion = $scope.Usuario.Contrasenia;

                let filtrarTipoPerfil = Enumerable.From($scope.TipoPerfil)
                    .Where(function (x) { return x.Nombre === event.node.data.perfil })
                    .ToArray();

                if (filtrarTipoPerfil.length > 0)
                    $scope.TipoPerfilSeleccionado = filtrarTipoPerfil[0].id_TipoPerfil;

                $scope.EmpresaSeleccionada = event.node.data.id_Empresa;

                $scope.NombreReadOnly = true;
                $('#txtContrasenia').focus();
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ConsultarEmpresa = function (data) {
        try {
            $scope.LimpiarDatos();

            if (data !== undefined && data !== null) {
                if (data.id_Municipio === 0 || data.id_Municipio === null || data.id_Municipio === undefined)
                    $scope.MunicipioSeleccionado = -1;
                else {
                    $scope.MunicipioSeleccionado = data.id_Municipio;
                    $scope.FiltrarBarrios($scope.MunicipioSeleccionado);
                }

                $scope.Empresa.Id_Empresa = data.id_Empresa;
                $scope.Empresa.Nombre = data.nombre;
                $scope.Empresa.Direccion = data.direccion;
                $scope.Empresa.Telefono_Fijo = data.telefono_Fijo;
                $scope.Empresa.Telefono_Movil = data.telefono_Movil;
                $scope.Empresa.Mail = data.mail;

                if (data.logo !== null)
                    $scope.LogoEmpresa = data.logo;
                else
                    $scope.LogoEmpresa = '../Images/template/tulogo.png';

                $scope.Empresa.Logo = $scope.LogoEmpresa;
                $scope.Empresa.Descripcion = data.descripcion;

                $scope.Empresa.Id_SedePrincipal = data.id_SedePrincipal;
                $scope.Empresa.Id_Categoria_Servicio = data.id_Categoria_Servicio;
                $scope.Empresa.Estado = data.estado;

                $scope.CategoriaSeleccionada = data.id_Categoria_Servicio;
                if (data.id_SedePrincipal === null || data.id_SedePrincipal === undefined || data.id_SedePrincipal === '') {
                    $scope.SedePrincipalSeleccionada = -1;
                } else {
                    $scope.SedePrincipalSeleccionada = data.id_SedePrincipal;
                }

                $scope.EstadoSeleccionado = data.estado;
                $scope.Empresa.Contacto = data.contacto;

                $timeout(function () {
                    if (data.id_Barrio === 0 || data.id_Barrio === null || data.id_Barrio === undefined)
                        $scope.BarrioSeleccionado = -1;
                    else
                        $scope.BarrioSeleccionado = data.id_Barrio;
                }, 100);

                $scope.ModalNuevaEmpresa();

                $('#txtNombreEmpesa').focus();
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ConsultarServicio = function (data) {
        try {
            $scope.LimpiarDatos();

            if (data !== undefined && data !== null) {
                $scope.Servicio.Id_Servicio = data.id_Servicio;
                $scope.Servicio.Nombre = data.nombre;
                $scope.Servicio.Descripcion = data.descripcion;

                $scope.Servicio.Id_Categoria_Servicio = data.id_Categoria_Servicio;
                $scope.Servicio.Id_TipoServicio = data.id_TipoServicio;

                $timeout(function () {
                    $scope.FiltrarTipoServicio(data.id_Categoria_Servicio);
                });                

                $scope.Servicio.Fecha_Registro = data.fecha_Registro;
                $scope.Servicio.Fecha_Modificacion = data.fecha_Modificacion;                
                $scope.CategoriaSeleccionada = data.id_Categoria_Servicio;
                $scope.TipoServicioSeleccionado = data.id_TipoServicio;
                

                $scope.ModalNuevoServicio();                
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarDatosEmpresa = function () {
        try {
            if ($scope.Empresa.Nombre === '' || $scope.Empresa.Nombre === undefined || $scope.Empresa.Nombre === null) {
                toastr.info('Debe digitar el nombre de la empresa', '', $scope.toastrOptions);
                $('#txtNombreEmpresa').focus();
                return false;
            }

            if ($scope.Empresa.Direccion === '' || $scope.Empresa.Direccion === undefined || $scope.Empresa.Direccion === null) {
                toastr.info('Debe digitar la dirección física de la empresa', '', $scope.toastrOptions);
                $('#txtDireccionEmpresa').focus();
                return false;
            }

            if ($scope.Empresa.Telefono_Fijo === '' || $scope.Empresa.Telefono_Fijo === undefined || $scope.Empresa.Telefono_Fijo === null) {
                toastr.info('Debe digitar el número de teléfono fijo de la empresa', '', $scope.toastrOptions);
                $('#txtTelFijoEmpresa').focus();
                return false;
            }

            if ($scope.Empresa.Telefono_Movil === '' || $scope.Empresa.Telefono_Movil === undefined || $scope.Empresa.Telefono_Movil === null) {
                toastr.info('Debe digitar el teléfono celular de la empresa', '', $scope.toastrOptions);
                $('#txtCelularEmpresa').focus();
                return false;
            }

            if ($scope.Empresa.Mail === '' || $scope.Empresa.Mail === undefined || $scope.Empresa.Mail === null) {
                toastr.info('Correo electrónico de la empresa es requerido', '', $scope.toastrOptions);
                $('#txtMailEmpresa').focus();
                return false;
            }

            if (!mail_expression.test($scope.Empresa.Mail)) {
                toastr.info('La dirección de correo electrónico no es válida.', '', $scope.toastrOptions);
                $('#txtMailEmpresa').focus();
                return false;
            }

            if ($scope.Empresa.Descripcion === '' || $scope.Empresa.Descripcion === undefined || $scope.Empresa.Descripcion === null) {
                toastr.info('Debe digitar la descripción de la empresa', '', $scope.toastrOptions);
                $('#txtDescripcionEmpresa').focus();
                return false;
            }

            if ($scope.CategoriaSeleccionada === -1 || $scope.CategoriaSeleccionada === undefined || $scope.CategoriaSeleccionada === null) {
                toastr.info('Debe seleccionar una categoría de servicio para la empresa', '', $scope.toastrOptions);
                $('#slCategoriaServicio').focus();
                return false;
            }

            $scope.Empresa.Id_Categoria_Servicio = $scope.CategoriaSeleccionada;

            if ($scope.SedePrincipalSeleccionada === -1 || $scope.SedePrincipalSeleccionada === undefined || $scope.SedePrincipalSeleccionada === null) {
                $scope.Empresa.Id_SedePrincipal = null;
            } else {
                $scope.Empresa.Id_SedePrincipal = $scope.SedePrincipalSeleccionada;
            }

            $scope.Empresa.Estado = $scope.EstadoSeleccionado;

            if ($scope.Empresa.Contacto === '' || $scope.Empresa.Contacto === undefined || $scope.Empresa.Contacto === null) {
                toastr.info('Debe ingresar el nombre de un contacto para la empresa', '', $scope.toastrOptions);
                $('#txtContactoEmpresa').focus();
                return false;
            }

            if ($scope.MunicipioSeleccionado === -1 || $scope.MunicipioSeleccionado === undefined || $scope.MunicipioSeleccionado === null) {
                toastr.info('Debe seleccionar un municipio', '', $scope.toastrOptions);
                $('#slMunicipios').focus();
                return false;
            }

            if ($scope.BarrioSeleccionado === -1 || $scope.BarrioSeleccionado === undefined || $scope.BarrioSeleccionado === null) {
                toastr.info('Debe seleccionar un barrio', '', $scope.toastrOptions);
                $('#slBarrios').focus();
                return false;
            }

            $scope.Empresa.Id_Barrio = $scope.BarrioSeleccionado;

            if ($scope.LogoEmpresa === undefined || $scope.LogoEmpresa === null || $scope.LogoEmpresa === '') {
                $scope.Empresa.Logo = null
            } else {
                $scope.Empresa.Logo = $scope.LogoEmpresa;
            }

            return true;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarUsuarioAdmin = function () {
        try {
            let mail_expression = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,5}$/;
            $scope.Usuario.Id_Empresa = $scope.IdEmpresa;
            if ($scope.ImagenUsuario !== '../Images/default-perfil.png')
                $scope.Usuario.Logo_Base64 = $scope.ImagenUsuario;
            else
                $scope.Usuario.Logo_Base64 = null;

            if ($scope.Usuario.Nombre === '') {
                toastr.info('Debe ingresar un nombre de usuario', '', $scope.toastrOptions);
                $('#txtUsuario').focus();
                return false;
            }

            if ($scope.Usuario.Contrasenia === '') {
                toastr.info('Debe ingresar una contraseña', '', $scope.toastrOptions);
                $('#txtContrasenia').focus();
                return false;
            }

            if ($scope.Confirmacion === '') {
                toastr.info('Debe confirmar la contraseña', '', $scope.toastrOptions);
                $('#txtConfirmacion').focus();
                return false;
            }

            if ($scope.Usuario.Contrasenia !== $scope.Confirmacion) {
                toastr.info('La confirmación de la contraseña no coincide con la contraseña', '', $scope.toastrOptions);
                $('#txtConfirmacion').focus();
                return false;
            }

            if (($scope.Usuario.Contrasenia !== $scope.PasswordBackup && $scope.Usuario.Id_Usuario !== -1) || ($scope.Usuario.Id_Usuario === -1)) {
                $scope.PasswordHasChanged = true;
                $scope.Usuario.PasswordHasChanged = $scope.PasswordHasChanged;
            }

            if ($scope.Usuario.Mail === '') {
                toastr.info('Debe ingresar una dirección de correo electrónico', '', $scope.toastrOptions);
                $('#txtMail').focus();
                return false;
            }

            if (!mail_expression.test($scope.Usuario.Mail)) {
                toastr.info('La dirección de correo electrónico no es válida.', '', $scope.toastrOptions);
                $('#txtMail').focus();
                return false;
            }

            if ($scope.TipoPerfilSeleccionado === -1) {
                toastr.info('Debe seleccionar un perfil', '', $scope.toastrOptions);
                $('#slTipoPerfil').focus();
                return false;
            }

            let filtrarTipoPerfil = Enumerable.From($scope.TipoPerfil)
                .Where(function (x) { return x.id_TipoPerfil === $scope.TipoPerfilSeleccionado })
                .ToArray();

            if (filtrarTipoPerfil.length > 0)
                $scope.Usuario.Perfil = filtrarTipoPerfil[0].Nombre;

            if ($scope.EmpresaSeleccionada === -1 || $scope.EmpresaSeleccionada === undefined || $scope.EmpresaSeleccionada === null) {
                toastr.info('Debe seleccionar una empresa', '', $scope.toastrOptions);
                $('#slEmpresas').focus();
                return false;
            }

            $scope.Usuario.Id_Empresa = $scope.EmpresaSeleccionada;
            $scope.Usuario.Menu_Usuario = $scope.Menu;

            let menuUnchecked = 0;
            for (let i = 0; i < $scope.Usuario.Menu_Usuario.length; i++) {
                if ($scope.Usuario.Menu_Usuario[i].Estado === false)
                    menuUnchecked += 1;
            }

            if (menuUnchecked === $scope.Menu.length) {
                toastr.info('Debe asignar almenos un elemento del menú', '', $scope.toastrOptions);
                $scope.ModalMenu();
                return false;
            }
            return true;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarServiciosAdmin = function () {
        try {
            if ($scope.Servicio.Nombre === '' || $scope.Servicio.Nombre === undefined || $scope.Servicio.Nombre === null) {
                toastr.info('Debe establecer el nombre del servicio', '', $scope.toastrOptions);
                $('#txtNombreServicio').focus();
                return false;
            }

            if ($scope.Servicio.Descripcion === '' || $scope.Servicio.Descripcion === undefined || $scope.Servicio.Descripcion === null) {
                toastr.info('Debe establecer la descripción del servicio', '', $scope.toastrOptions);
                $('#txtDescripcionServicio').focus();
                return false;
            }

            if ($scope.CategoriaSeleccionada === -1 || $scope.CategoriaSeleccionada === undefined || $scope.CategoriaSeleccionada === null) {
                toastr.info('Debe seleccionar una categoría', '', $scope.toastrOptions);
                $('#slCategoriaServicio1').focus();
                return false;
            }

            $scope.Servicio.Id_Categoria_Servicio = $scope.CategoriaSeleccionada;

            if ($scope.TipoServicioSeleccionado === -1 || $scope.TipoServicioSeleccionado === undefined || $scope.TipoServicioSeleccionado === null) {
                toastr.info('Debe seleccionar un tipo de servicio', '', $scope.toastrOptions);
                $('#slTipoServicio').focus();
                return false;
            }

            $scope.Servicio.Id_TipoServicio = $scope.TipoServicioSeleccionado;

            return true;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalNuevaEmpresa = function () {
        try {
            if ($scope.Empresa.Nombre === '')
                $scope.AccionEmpresa = 'Registrar Empresa';
            else
                $scope.AccionEmpresa = 'Actualizar Empresa';

            $mdDialog.show({
                contentElement: '#dlgNuevaEmpresa',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true
            })
                .then(function () {
                }, function () {
                    $scope.LimpiarDatos();
                });

            $scope.OcultarbtnNuevo = false;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalNuevoServicio = function () {
        try {
            if ($scope.Servicio.Nombre === '')
                $scope.AccionServicio = 'Registrar Servicio';
            else
                $scope.AccionServicio = 'Actualizar Servicio';

            $mdDialog.show({
                contentElement: '#dlgNuevoServicio',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true
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

    $scope.ModalMenu = function () {
        try {
            $scope.AccionGasto = 'MENU';

            $mdDialog.show({
                contentElement: '#dlgMenu',
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

    $scope.LimpiarDatos = function () {
        try {
            $scope.Empresa =
            {
                Id_Empresa: '00000000-0000-0000-0000-000000000000',
                Nombre: '',
                Descripcion: '',
                Telefono_Fijo: '',
                Telefono_Movil: '',
                Mail: '',
                Logo: null,
                Direccion: '',
                Id_SedePrincipal: '',
                Id_Categoria_Servicio: '',
                Estado: '',
                Contacto: '',
                Id_Barrio: -1
            };

            $scope.Servicio = {
                Id_Servicio: -1,
                Nombre: '',
                Descripcion: '',
                Id_Categoria_Servicio: '',
                Id_TipoServicio: ''
            }

            $scope.Usuario = {
                Id_Usuario: -1,
                Nombre: '',
                Contrasenia: '',
                Mail: '',
                Perfil: '',
                Id_Empresa: '',
                Logo_Base64: null,
                Menu_Usuario: $scope.Menu,
                PasswordHasChanged: $scope.PasswordHasChanged
            }

            $scope.CategoriaSeleccionada = -1;
            $scope.SedePrincipalSeleccionada = -1;
            $scope.EstadoSeleccionado = 'ACTIVA';
            $scope.BarrioSeleccionado = -1;
            $scope.MunicipioSeleccionado = -1;

            $scope.LogoEmpresa = '../Images/template/tulogo.png';
            $scope.ImagenUsuario = '../Images/default-perfil.png';

            $scope.PasswordHasChanged = false;
            $scope.PasswordBackup = '';
            $scope.TipoPerfilSeleccionado = -1;
            $scope.TipoServicioSeleccionado = -1;
            $scope.EmpresaSeleccionada = -1;
            $scope.Confirmacion = '';
            $scope.NombreReadOnly = false;

            $scope.TipoServiciosFiltrado = [];
            $scope.TipoServiciosFiltrado.push({ id_TipoServicio: -1, nombre: '[Seleccione]' });
            $scope.TipoServiciosFiltrado = $filter('orderBy')($scope.TipoServiciosFiltrado, 'id_TipoServicio', false);

            $scope.Menu = $rootScope.Menu;
            $scope.Menu = $scope.Menu.map(function (e) {
                return { Id_Usuario: -1, Id_Menu: e.id_Menu, Descripcion: e.descripcion, Estado: true }
            });
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

    $scope.FiltrarTipoServicio = function (CategoriaSeleccionada) {
        try {
            let idcategoria = CategoriaSeleccionada;

            if (idcategoria !== null && idcategoria !== undefined) {
                if (idcategoria !== -1) {
                    $scope.TipoServiciosFiltrado = [];
                    $scope.TipoServiciosFiltrado = $scope.TipoServicios.filter(function (e) {
                        return e.id_Categoria_Servicio === idcategoria;
                    });

                    $scope.TipoServiciosFiltrado.push({ id_TipoServicio: -1, nombre: '[Seleccione]' });
                    $scope.TipoServiciosFiltrado = $filter('orderBy')($scope.TipoServiciosFiltrado, 'id_TipoServicio', false);
                }
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.SeleccionarImagen = function (event) {
        try {
            let mayorDosMB = false;
            let files = event.target.files[0];

            let fileSize = (files.size / 1024 / 1024)
            if (fileSize > 2)
                mayorDosMB = true;

            if (mayorDosMB) {
                toastr.info('El tamaño de las imágenes debe ser de máximo 2MB', '', $scope.toastrOptions);
                files = '';
                return;
            }
            $scope.getBase64(files);
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ProcesarImagen = function () {
        if ($scope.fActiveTab === 'Empresas')
            $("#LogoEmpresa").trigger('click');
        if ($scope.fActiveTab === 'Usuarios')
            $("#ImagenUsuario").trigger('click');
    }

    $scope.getBase64 = function (file) {
        try {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                $scope.$apply(function () {
                    debugger;
                    if ($scope.fActiveTab === 'Empresas')
                        $scope.LogoEmpresa = reader.result;
                    if ($scope.fActiveTab === 'Usuarios')
                        $scope.ImagenUsuario = reader.result;
                });
                if ($scope.fActiveTab === 'Empresas')
                    $("#LogoEmpresa").val('');
                if ($scope.fActiveTab === 'Usuarios')
                    $("#ImagenUsuario").val('');
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
                $("#LogoEmpresa").val('');
                $("#ImagenUsuario").val('');
            };
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.Cancelar = function () {
        $mdDialog.cancel();
    };

    $timeout(function () {
        $scope.LimpiarDatos();
        $scope.ConsultarMunicipios();
        $scope.ConsultarEmpresasAdmin();
        $scope.ConsultarSedesPrincipales();
        $scope.ConsultarCategoriaServicios();
        $scope.ConsultarMenuAdmin();
        $scope.ConsultarUsuariosAdmin();
        $scope.ConsultarServiciosAdmin();
        $scope.ConsultarTipoServicios();
    }, 200);
}