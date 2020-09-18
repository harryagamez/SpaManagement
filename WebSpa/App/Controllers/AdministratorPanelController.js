angular.module('app.controllers')
    .controller("AdministratorPanelController", AdministratorPanelController);

AdministratorPanelController.$inject = ['$scope', '$state', '$location', '$filter','$http', '$mdDialog', '$rootScope', '$timeout', 'AuthService', 'SPAService'];

function AdministratorPanelController($scope, $state, $location, $filter, $http, $mdDialog, $rootScope, $timeout, AuthService, SPAService) { 
    
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
        Estado: ''
    };

    $scope.CategoriaSeleccionada = -1;
    $scope.SedePrincipalSeleccionada = -1;
    $scope.EstadoSeleccionado = 'ACTIVA';
    $scope.LogoEmpresa = '';

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
            headerName: "Nombre", field: 'nombre', width: 160, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Mail", field: 'mail', width: 100, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Dirección", field: 'direccion', width: 160, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }
        },
        {
            headerName: "Sede Principal", field: 'nombre_SedePrincipal', width: 150, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }
        },
        {
            headerName: "Estado", field: 'estado', width: 160, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' }, suppressSizeToFit: true
        },
        {
            headerName: "Telefono Móvil", field: 'telefono_Movil', width: 160, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }, suppressSizeToFit: true
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
        rowSelection: 'multiple',
        onRowClicked: OnRowClicked
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

    $scope.ConsultarTodasLasEmpresas = function () {
        SPAService._consultarTodasLasEmpresas()
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.TodasLasEmpresas = [];
                        $scope.TodasLasEmpresas = result.data;                       

                        $scope.EmpresasGridOptions.api.setRowData($scope.TodasLasEmpresas);

                        $timeout(function () {
                            $scope.EmpresasGridOptions.api.sizeColumnsToFit();
                        }, 200);
                    }
                }
            ), function (err) {
                toastr.remove();
                if (err.data !== null && err.status === 500)
                    toastr.error(err.data, '', $scope.toastrOptions);
            }
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
                }
            ), function (err) {
                toastr.remove();
                if (err.data !== null && err.status === 500)
                    toastr.error(err.data, '', $scope.toastrOptions);
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
                            $scope.ConsultarTodasLasEmpresas();
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
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
                Estado: ''
            };

            $scope.CategoriaSeleccionada = -1;
            $scope.SedePrincipalSeleccionada = -1;
            $scope.EstadoSeleccionado = 'ACTIVA';
            $scope.LogoEmpresa = '';

            $('#txtNombreEmpresa').focus();
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }       
    }

    function OnRowClicked(event) {
        try {
            $scope.LimpiarDatos();
            if (event.node.data !== undefined && event.node.data !== null) {                
                $scope.Empresa.Id_Empresa = event.node.data.id_Empresa;
                $scope.Empresa.Nombre = event.node.data.nombre;
                $scope.Empresa.Direccion = event.node.data.direccion;
                $scope.Empresa.Telefono_Fijo = event.node.data.telefono_Fijo;
                $scope.Empresa.Telefono_Movil = event.node.data.telefono_Movil;
                $scope.Empresa.Mail = event.node.data.mail;

                if (event.node.data.logo !== null)
                    $scope.LogoEmpresa = event.node.data.logo;
                else
                    $scope.LogoEmpresa = '../Images/default-perfil.png';

                $scope.Empresa.Logo = $scope.LogoEmpresa;
                $scope.Empresa.Descripcion = event.node.data.descripcion;                

                $scope.Empresa.Id_SedePrincipal = event.node.data.id_SedePrincipal;
                $scope.Empresa.Id_Categoria_Servicio = event.node.data.id_Categoria_Servicio;
                $scope.Empresa.Estado = event.node.data.estado;

                $scope.CategoriaSeleccionada = event.node.data.id_Categoria_Servicio;
                if (event.node.data.id_SedePrincipal === null || event.node.data.id_SedePrincipal === undefined || event.node.data.id_SedePrincipal === '') {
                    $scope.SedePrincipalSeleccionada = -1;
                } else {
                    $scope.SedePrincipalSeleccionada = event.node.data.id_SedePrincipal;
                }
                
                $scope.EstadoSeleccionado = event.node.data.estado;

                $('#txtNombreEmpesa').focus();
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
        $('#LogoEmpresa').trigger('click');
    }

    $scope.getBase64 = function (file) {
        try {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                $scope.$apply(function () {
                    $scope.LogoEmpresa = reader.result;
                });
                $("#LogoEmpresa").val('');
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
                $("#LogoEmpresa").val('');
            };
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.LimpiarDatos();
    $scope.ConsultarTodasLasEmpresas();
    $scope.ConsultarSedesPrincipales();
    $scope.ConsultarCategoriaServicios();      
}
