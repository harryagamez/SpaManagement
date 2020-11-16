angular.module('app.controllers')
    .controller("GestionController", GestionController);

GestionController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$timeout', 'SPAService', 'AuthService'];

function GestionController($scope, $rootScope, $filter, $mdDialog, $timeout, SPAService, AuthService) {
    $rootScope.header = 'Gestion';
    $scope.TipoPerfilSeleccionado = -1;
    $scope.NombreReadOnly = false;
    $scope.Confirmacion = '';
    $scope.EditarUsuario = false;
    $scope.ImagenUsuario = '../Images/template/default_logo.png';
    $scope.PasswordHasChanged = false;
    $scope.PasswordBackup = '';
    $scope.EmpresaPropiedades = [];
    $scope.SistemaPropiedades = [];

    let fechaactual = new Date();
    $scope.Rango = {
        Desde: new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), 7, 0, 0),
        Hasta: new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), 21, 0, 0)
    }

    $scope.TipoPerfil =
        [
            { id_TipoPerfil: -1, Nombre: "[Seleccione]" },
            { id_TipoPerfil: 1, Nombre: "Administrador" },
            { id_TipoPerfil: 2, Nombre: "Invitado" }
        ];
    $scope.PropiedadesCondicionales = [
        { valor_Propiedad: "-1", descripcion: "[Seleccione]" },
        { valor_Propiedad: "SI", descripcion: "SI" },
        { valor_Propiedad: "NO", descripcion: "NO" }
    ];
    $scope.PropiedadesNomina = [
        { valor_Propiedad: "-1", descripcion: "[Seleccione]" },
        { valor_Propiedad: "MENSUAL", descripcion: "MENSUAL" },
        { valor_Propiedad: "QUINCENAL", descripcion: "QUINCENAL" },
        { valor_Propiedad: "DIARIO", descripcion: "DIARIO" },
        { valor_Propiedad: "POR_SERVICIOS", descripcion: "POR SERVICIOS" }

    ];
    $scope.TipoPerfil = $filter('orderBy')($scope.TipoPerfil, 'Nombre', false);

    $scope.Inicializacion = function () {
        $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
        window.onresize();

        $('#txtUsuario').focus();
    }
    
    $scope.Menu = $rootScope.Menu.filter(function (e) {
        return e._Level === 1;
    });

    $scope.Menu = $scope.Menu.map(function (e) {
        return { Id_Usuario: -1, Id_Menu: e.id_Menu, Descripcion: e.descripcion, Estado: true }
    });    

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

    $scope.IdEmpresa = $rootScope.Id_Empresa;
    $scope.IdUsuario = parseInt($rootScope.userData.userId);
    $scope.PerfilUsuario = $rootScope.userData.userRole;

    $scope.EmpresaPropiedades = $filter('filter')($rootScope.EmpresaPropiedades, { id_Empresa: $scope.IdEmpresa });
    $scope.SistemaPropiedades = $rootScope.SistemaPropiedades;

    $scope.ConsultarUsuarios = function () {
        SPAService._consultarUsuarios($scope.IdEmpresa)
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.Usuarios = [];
                        $scope.Usuarios = result.data;
                        $scope.UsuariosGridOptions.api.setRowData($scope.Usuarios);

                        $timeout(function () {
                            $scope.UsuariosGridOptions.api.sizeColumnsToFit();
                        }, 200);
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarUsuario = function (e, Nombre) {
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

    $scope.GuardarUsuario = function () {
        if ($scope.ValidarUsuario()) {
            SPAService._guardarUsuario(JSON.stringify($scope.Usuario))
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Usuario registrado/actualizado correctamente', '', $scope.toastrOptions);
                            $scope.ConsultarUsuarios();
                            $scope.LimpiarDatos();
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    $scope.GuardarEmpresaPropiedades = function () {
        if ($scope.SistemaPropiedades.length > 0) {
            let rangoagenda = '';
            if (($scope.Rango.Desde !== null && $scope.Rango.Desde !== undefined) && ($scope.Rango.Hasta !== null && $scope.Rango.Hasta !== undefined)) {
                let horainicio = ($filter('date')($scope.Rango.Desde, 'H'));
                let horafin = ($filter('date')($scope.Rango.Hasta, 'H'));
                if (parseInt(horainicio) < parseInt(horafin))
                    rangoagenda = horainicio + ' - ' + horafin;
                else {
                    toastr.info('La hora inicial debe ser menor a la hora final', '', $scope.toastrOptions);
                    $('#txtRangoDesde').focus();
                    return;
                }
            }

            let empresaPropiedades = [];
            $scope.SistemaPropiedades.map(function (propiedad) {
                let object = {
                    Id_Empresa: $scope.IdEmpresa,
                    Id_Sistema_Propiedad: propiedad.id_Sistema_Propiedad,
                    Valor_Propiedad: propiedad.valor_Propiedad
                };
                if (propiedad.tipo === 'RANGO_HORA')
                    object.Valor_Propiedad = rangoagenda;
                empresaPropiedades.push(object);
            });
            SPAService._guardarEmpresaPropiedades(empresaPropiedades)
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Propiedades registradas correctamente', '', $scope.toastrOptions);

                            let ids = Enumerable.From($rootScope.Empresas)
                                .Select(function (x) { return x.id_Empresa })
                                .ToArray().join(',');
                            $scope.ConsultarEmpresaPropiedades(ids);
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    $scope.ConsultarEmpresaPropiedades = function (id_empresas) {
        AuthService.consultarEmpresaPropiedades(id_empresas);
    }

    $scope.ConfiguracionEmpresaActual = function () {
        try {
            if ($scope.EmpresaPropiedades.length > 0) {
                let papts = $filter('filter')($scope.EmpresaPropiedades, { codigo: 'PAPTS' });
                if (papts[0].valor_Propiedad.toUpperCase() === 'SI' || papts[0].valor_Propiedad.toUpperCase() === 'SÍ')
                    $scope.PAPTS = true;
                else
                    $scope.PAPTS = false;
            } else
                toastr.info('La empresa seleccionada, no tiene propiedades definidas', '', $scope.toastrOptions);
        } catch (e) {
            toastr.error('Error consultando las propiedades de la empresa: ' + e.message, '', $scope.toastrOptions);
        }
    }

    $scope.ConfiguracionSistemaPropiedades = function () {
        try {
            if ($scope.SistemaPropiedades.length > 0) {
                $scope.SistemaPropiedades.map(function (propiedad) {
                    let empresaPropiedadSistema = Enumerable.From($scope.EmpresaPropiedades)
                        .Where(function (x) {
                            return x.id_Sistema_Propiedad === propiedad.id_Sistema_Propiedad
                                && x.id_Empresa === $scope.IdEmpresa;
                        })
                        .ToArray();
                    if (empresaPropiedadSistema.length > 0) {
                        propiedad.valor_Propiedad = empresaPropiedadSistema[0].valor_Propiedad;
                        if (propiedad.tipo === 'RANGO_HORA') {
                            let rangoinicial = parseInt(propiedad.valor_Propiedad.substring(0, 2));
                            let rangofinal = parseInt(propiedad.valor_Propiedad.substring(propiedad.valor_Propiedad.length - 2));
                            let fechaactual = new Date();
                            $scope.Rango.Desde = new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), rangoinicial, 0, 0);
                            $scope.Rango.Hasta = new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), rangofinal, 0, 0);
                        }
                    }
                    else {
                        if (propiedad.tipo === 'ESCALAR')
                            propiedad.valor_Propiedad = '';
                        else if (propiedad.tipo === 'CONDICIONAL')
                            propiedad.valor_Propiedad = 'SI';
                        else if (propiedad.tipo === 'TIPO_NOMINA')
                            propiedad.valor_Propiedad = 'MENSUAL'
                        else if (propiedad.tipo === 'RANGO_HORA') {
                            let fechaactual = new Date();
                            $scope.Rango = {
                                Desde: new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), 7, 0, 0),
                                Hasta: new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), 21, 0, 0)
                            }
                        }
                    }
                })
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
        }
    }

    $scope.UsuariosGridOptionsColumns = [
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
            headerName: "Perfil", field: 'perfil', width: 160, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, suppressSizeToFit: true
        }
    ];

    $scope.UsuariosGridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: $scope.UsuariosGridOptionsColumns,
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
        onRowClicked: OnRowClicked
    }

    $scope.ValidarUsuario = function () {
        try {
            let mail_expression = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,5}$/;
            $scope.Usuario.Id_Empresa = $scope.IdEmpresa;
            if ($scope.ImagenUsuario !== '../Images/template/default_logo.png')
                $scope.Usuario.Logo_Base64 = $scope.ImagenUsuario;
            else
                $scope.Usuario.Logo_Base64 = null;

            if ($scope.PerfilUsuario !== 'Administrador' && $scope.PerfilUsuario !== '[MANAGER]') {
                toastr.info('Solo los Administradores pueden registrar/actualizar usuarios', '', $scope.toastrOptions);
                $scope.LimpiarDatos();
                return false;
            }

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

            let menuUnchecked = 0;
            for (let i = 0; i < $scope.Usuario.Menu_Usuario.length; i++) {
                if ($scope.Usuario.Menu_Usuario[i].Estado === false)
                    menuUnchecked += 1;
            }

            if (menuUnchecked === $scope.Usuario.Menu_Usuario.length) {
                toastr.info('Debe asignar al menos un elemento del menú', '', $scope.toastrOptions);
                $scope.ModalMenu();
                return false;
            }
            return true;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.LimpiarDatos = function () {
        try {
            $scope.EditarUsuario = false;
            $scope.ImagenUsuario = '../Images/template/default_logo.png';
            $scope.EmpresaPropiedades = $filter('filter')($rootScope.EmpresaPropiedades, { id_Empresa: $scope.IdEmpresa });
            $scope.Menu = $rootScope.Menu;
            $scope.PasswordHasChanged = false;
            $scope.PasswordBackup = '';
            $scope.Menu = $scope.Menu.map(function (e) {
                return { Id_Menu_Usuario: '', Id_Usuario: -1, Id_Menu: e.id_Menu, Descripcion: e.descripcion, Estado: true }
            });
            $('#txtUsuario').focus();
            $scope.TipoPerfilSeleccionado = -1;
            $scope.Confirmacion = '';
            $scope.NombreReadOnly = false;
            $scope.Usuario = {
                Id_Usuario: -1,
                Nombre: '',
                Contrasenia: '',
                Mail: '',
                Perfil: '',
                Id_Empresa: $scope.IdEmpresa,
                Logo_Base64: null,
                Menu_Usuario: $scope.Menu,
                PasswordHasChanged: $scope.PasswordHasChanged
            }
            let fechaactual = new Date();
            $scope.Rango = {
                Desde: new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), 7, 0, 0),
                Hasta: new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), 21, 0, 0)
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    function OnRowClicked(event) {
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
                    $scope.ImagenUsuario = '../Images/template/default_logo.png';

                $scope.Usuario.Logo_Base64 = $scope.ImagenUsuario;
                $scope.Menu = event.node.data.menu_Usuario;
                $scope.Menu = $scope.Menu.map(function (e) {
                    return { Id_Menu_Usuario: e.id_Menu_Usuario, Id_Usuario: e.id_Usuario, Id_Menu: e.id_Menu, Estado: e.estado, Descripcion: e.descripcion }
                });

                $scope.Usuario.Menu_Usuario = $scope.Menu;
                $scope.Confirmacion = $scope.Usuario.Contrasenia;

                let filtrarTipoPerfil = Enumerable.From($scope.TipoPerfil)
                    .Where(function (x) { return x.Nombre === event.node.data.perfil })
                    .ToArray();

                if (filtrarTipoPerfil.length > 0)
                    $scope.TipoPerfilSeleccionado = filtrarTipoPerfil[0].id_TipoPerfil;

                $scope.NombreReadOnly = true;
                $('#txtContrasenia').focus();
            }
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
        $('#ImagenUsuario').trigger('click');
    }

    $scope.getBase64 = function (file) {
        try {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                $scope.$apply(function () {
                    $scope.ImagenUsuario = reader.result;
                });
                $("#ImagenServicio").val('');
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
                $("#ImagenServicio").val('');
            };
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarHora = function () {
        try {
            let fechaactual = new Date();
            if ($scope.Rango.Desde === undefined) {
                toastr.info('Formato de hora invalido ', '', $scope.toastrOptions);
                $scope.Rango = {
                    Desde: new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), 7, 0, 0),
                    Hasta: new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), 21, 0, 0)
                }
                return;
            }

            if ($scope.Rango.Hasta === undefined) {
                toastr.info('Formato de hora invalido ', '', $scope.toastrOptions);
                $scope.Rango = {
                    Desde: new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), 7, 0, 0),
                    Hasta: new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), 21, 0, 0)
                }
                return;
            }

            if (parseInt($filter('date')(new Date($scope.Rango.Desde), 'HHmm')) >= parseInt($filter('date')(new Date($scope.Rango.Hasta), 'HHmm'))) {
                toastr.info('La hora inicial debe ser menor a la hora final ', '', $scope.toastrOptions);
                $scope.Rango = {
                    Desde: new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), 7, 0, 0),
                    Hasta: new Date(fechaactual.getFullYear(), fechaactual.getMonth(), fechaactual.getDate(), 21, 0, 0)
                }
                return;
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    window.onresize = function () {
        $timeout(function () {
            $scope.UsuariosGridOptions.api.sizeColumnsToFit();
        }, 200);
    }

    $scope.Cancelar = function () {
        $mdDialog.cancel();
    };

    $scope.$on("CompanyChange", function () {
        $scope.LimpiarDatos();
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.EmpresaPropiedades = $filter('filter')($rootScope.EmpresaPropiedades, { id_Empresa: $scope.IdEmpresa });
        $scope.ConfiguracionEmpresaActual();
        $scope.ConfiguracionSistemaPropiedades();
        $scope.ConsultarUsuarios();
        $scope.Inicializacion();
    });

    $scope.Inicializacion();
    $scope.ConfiguracionSistemaPropiedades();
    $scope.ConfiguracionEmpresaActual();
    $scope.ConsultarUsuarios();
}