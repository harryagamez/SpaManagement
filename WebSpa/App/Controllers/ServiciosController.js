﻿angular.module('app.controllers')
    .controller("ServiciosController", ServiciosController)

ServiciosController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

function ServiciosController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
    $scope.TipoServicios = [];
    $scope.ObjetoServicio = [];
    $scope.Servicios = [];
    $scope.TipoServicioSeleccionado = -1;
    $scope.EstadoSeleccionado = 'ACTIVO';
    $scope.AccionServicio = 'Registrar Servicio';
    $scope.ImagenServicioBase64 = '';
    $scope.InformacionImagen = '';
    $rootScope.ImagenesxAdjuntar = 0;

    $scope.Inicializacion = function () {
        $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
        window.onresize();

        $('#txtBuscarServicio').focus();
    }

    $scope.IdEmpresa = $rootScope.Id_Empresa;
    $scope.IdUsuario = parseInt($rootScope.userData.userId);

    $scope.Servicio =
    {
        Descripcion: '',
        Estado: $scope.EstadoSeleccionado,
        Fecha_Registro: $filter('date')(new Date(), 'MM-dd-yyyy'),
        Id_Empresa: $scope.IdEmpresa,
        Id_TipoServicio: -1,
        Id_Servicio: -1,
        Nombre: '',
        Nombre_Tipo_Servicio: '',
        Tiempo: 0,
        Valor: 0,
        Imagenes_Servicio: []
    }

    $scope.GuardarServicio = function () {
        if ($scope.ValidarDatos()) {
            $scope.Servicio.Imagenes_Servicio = $scope.Servicio.Imagenes_Servicio.concat($scope.TEMPServicio);

            $scope.ObjetoServicio = [];
            $scope.ObjetoServicio.push($scope.Servicio);

            SPAService._guardarServicio(JSON.stringify($scope.ObjetoServicio))
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Servicio registrado/actualizado correctamente', '', $scope.toastrOptions);
                            $scope.ConsultarServicios();
                            $scope.LimpiarDatos();

                            if ($scope.AccionServicio === 'Editar Servicio')
                                $scope.Cancelar();
                        }
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    $scope.ConsultarTipoServicios = function () {
        SPAService._consultarTipoServicios()
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.TipoServicios = [];
                        $scope.TipoServicios = result.data;
                        $scope.TipoServicios.push({ id_TipoServicio: -1, nombre: '[Seleccione]', descripcion: '', fecha_Registro: null, fecha_Modificacion: null });
                        $scope.TipoServicios = $filter('orderBy')($scope.TipoServicios, 'nombre', false);
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarServicios = function () {
        SPAService._consultarServicios($scope.IdEmpresa)
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.Servicios = [];
                        $scope.Servicios = result.data;
                        $scope.ServiciosGridOptions.api.setRowData($scope.Servicios);

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

    $scope.ConsultarServicio = function (data) {
        try {
            $rootScope.ServicioImagenesAdjuntas = data.imagenes_Servicio;
            $scope.TipoServicioSeleccionado = -1;

            if (data.id_Servicio !== undefined && data.id_Servicio !== null) {
                $scope.Servicio.Nombre = data.nombre;
                $scope.Servicio.Descripcion = data.descripcion;
                $scope.Servicio.Estado = data.estado;
                $scope.Servicio.Fecha_Modificacion = $filter('date')(new Date(), 'MM-dd-yyyy');
                $scope.Servicio.Id_Empresa = $scope.IdEmpresa;
                $scope.Servicio.Id_TipoServicio = data.id_TipoServicio;
                $scope.Servicio.Id_Servicio = data.id_Servicio;
                $scope.Servicio.Tiempo = data.tiempo;
                $scope.Servicio.Valor = data.valor;
                $scope.Servicio.Id_Servicio = data.id_Servicio;
                $scope.Servicio.Imagenes_Servicio = data.imagenes_Servicio;
                $scope.TipoServicioSeleccionado = data.id_TipoServicio;
                $scope.ModalEditarServicio();
                $scope.NombreServicioReadOnly = true;

                $scope.EstadoSeleccionado = $scope.Servicio.Estado;
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
        }
    }

    $scope.VisualizarImagen = function (data) {
        try {
            $rootScope.ServicioNombre = data.nombre;
            $rootScope.ServicioListaImagenes = [];
            $rootScope.ServicioListaImagenes = data.imagenes_Servicio;

            if ($rootScope.ServicioListaImagenes.length > 0)
                $scope.ModalSliderServicio();
            else
                $scope.showAlertSinImagenesAdjuntas();
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ConsultarServicioNombre = function (e, nombre) {
        try {
            let row = $scope.ServiciosGridOptions.api.getRowNode(nombre);
            if (row === undefined) return;

            if (row.data.nombre !== undefined && row.data.nombre !== null) {
                $scope.AccionServicio = 'Editar Servicio';
                $scope.Servicio.Nombre = row.data.nombre;
                $scope.Servicio.Descripcion = row.data.descripcion;
                $scope.Servicio.Estado = row.data.estado;
                $scope.Servicio.Fecha_Modificacion = $filter('date')(new Date(), 'MM-dd-yyyy');
                $scope.Servicio.Id_Empresa = $scope.IdEmpresa;
                $scope.Servicio.Id_TipoServicio = row.data.id_TipoServicio;
                $scope.Servicio.Id_Servicio = row.data.id_Servicio;
                $scope.Servicio.Tiempo = row.data.tiempo;
                $scope.Servicio.Valor = row.data.valor;
                $scope.Servicio.Id_Servicio = row.data.id_Servicio;
                $scope.TipoServicioSeleccionado = row.data.id_TipoServicio;

                $scope.NombreServicioReadOnly = true;
                $scope.OcultarbtnNuevo = true;
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.LimpiarDatos = function () {
        try {
            $scope.EstadoSeleccionado = 'ACTIVO';
            $scope.ImagenServicioBase64 = '';
            $rootScope.ImagenesAdjuntas = 0;
            $rootScope.InformacionImagen = '';
            $rootScope.ImagenesxAdjuntar = 0;
            $scope.TEMPServicio = [];

            $scope.Servicio =
            {
                Nombre: '',
                Descripcion: '',
                Estado: $scope.EstadoSeleccionado,
                Fecha_Registro: $filter('date')(new Date(), 'MM-dd-yyyy'),
                Id_Empresa: $scope.IdEmpresa,
                Id_TipoServicio: -1,
                Id_Servicio: -1,
                Nombre_Tipo_Servicio: '',
                Tiempo: 0,
                Valor: 0,
                Imagenes_Servicio: []
            }

            $scope.TipoServicioSeleccionado = -1;

            $('#txtNombreServicio').focus();
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ValidarDatos = function () {
        try {
            $scope.Servicio.Id_TipoServicio = $scope.TipoServicioSeleccionado;
            $scope.Servicio.Estado = $scope.EstadoSeleccionado;

            if ($scope.Servicio.Nombre === '') {
                toastr.info('Nombre del servicio es requerido', '', $scope.toastrOptions);
                $('#txtNombreServicio').focus();
                return false;
            }

            if ($scope.Servicio.Descripcion === '') {
                toastr.info('Descripción del servicio es requerida', '', $scope.toastrOptions);
                $('#txtDescripcionServicio').focus();
                return false;
            }

            if (parseInt($scope.Servicio.Tiempo) === 0) {
                toastr.info('Tiempo del servicio es requerido', '', $scope.toastrOptions);
                $('#txtTiempoServicio').focus();
                return false;
            }

            if ($scope.Servicio.Id_TipoServicio === -1) {
                toastr.info('Tipo de servicio es requerido', '', $scope.toastrOptions);
                $('#slTipoServicio').focus();
                return false;
            }

            if (parseInt($scope.Servicio.Valor) === 0) {
                toastr.info('Valor del servicio es requerido', '', $scope.toastrOptions);
                $('#txtValorServicio').focus();
                return false;
            }

            return true;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalNuevoServicio = function () {
        try {
            $scope.AccionServicio = 'Registrar Servicio';
            $rootScope.ImagenesAdjuntas = 0;
            $rootScope.ImagenesxAdjuntar = 0;
            $scope.Servicio.Imagenes_Servicio.length = 0;
            $mdDialog.show({
                contentElement: '#dlgNuevoServicio',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true
            })
                .then(function () {
                }, function () {
                    $('#txtBuscarServicio').focus();
                    $scope.LimpiarDatos();
                });

            $scope.LimpiarDatos();
            $scope.NombreServicioReadOnly = false;
            $scope.OcultarbtnNuevo = false;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalEditarServicio = function () {
        try {
            $scope.AccionServicio = 'Editar Servicio';
            $rootScope.ImagenesAdjuntas = $scope.Servicio.Imagenes_Servicio.length;
            $rootScope.ImagenesxAdjuntar = 0;
            $mdDialog.show({
                contentElement: '#dlgNuevoServicio',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                multiple: true
            })
                .then(function () {
                }, function () {
                    $scope.Servicio.Imagenes_Servicio = $scope.Servicio.Imagenes_Servicio.filter(function (item) {
                        return item.Id_Servicio !== -1;
                    });
                    $('#txtBuscarServicio').focus();
                    $scope.LimpiarDatos();
                });

            $scope.NombreServicioReadOnly = true
            $scope.OcultarbtnNuevo = true;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ModalSliderServicio = function () {
        try {
            $mdDialog.show({
                controller: SliderController,
                templateUrl: 'Views/Templates/_slider.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen
            })
                .then(function () {
                }, function () {
                });
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    };

    $scope.showCustomImagenesAdjuntas = function (ev) {
        try {
            $mdDialog.show({
                controller: ImgAttachedController,
                templateUrl: 'Views/Templates/_imgattached.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen,
                multiple: true
            })
                .then(function () {
                }, function () {
                });
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    };

    $scope.showAlertSinImagenesAdjuntas = function (ev) {
        try {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Imágenes Adjuntas')
                    .textContent('El servicio ' + $rootScope.ServicioNombre + ' no tiene imagenes adjuntas.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Aceptar')
                    .targetEvent(ev)
                    .multiple(true)
            );
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    };

    $scope.showReemplazarImagenesServicio = function (ev, data) {
        try {
            if ($rootScope.ImagenesAdjuntas >= 5) {
                toastr.info('El servicio ya tiene 5 imágenes adjuntas. Si desea subir más, debe borrar alguna imagen existente', '', $scope.toastrOptions);
                return;
            }

            if ($rootScope.ImagenesAdjuntas > 0 && $rootScope.ImagenesAdjuntas <= 5) {
                let confirm = $mdDialog.confirm()
                    .title('Sobreescribir Imágenes')
                    .textContent('Ya existen ' + $scope.Servicio.Imagenes_Servicio.length + ' imágenes adjuntas. ¿Desea agregar más?')
                    .ariaLabel('Sobreescribir Imágenes')
                    .targetEvent(ev, data)
                    .ok('Sí')
                    .cancel('No')
                    .multiple(true);

                $mdDialog.show(confirm).then(function () {
                    $scope.ProcesarImagen();
                }, function () {
                    return;
                });
            }
            else
                $scope.ProcesarImagen();
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    };

    $scope.ServiciosGridOptionsColumns = [

        {
            headerName: "", field: "Checked", suppressFilter: true, width: 25, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
        },
        {
            headerName: "", field: "", suppressMenu: true, visible: true, width: 25, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
            cellRenderer: function () {
                return "<i data-ng-click='ConsultarServicio(data)' data-toggle='tooltip' title='Editar servicio' class='material-icons' style='font-size:25px;margin-top:-1px;color:#f17325;'>create</i>";
            },
        },
        {
            headerName: "", field: "", suppressMenu: true, visible: true, width: 25, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
            cellRenderer: function () {
                return "<i data-ng-click='VisualizarImagen(data)' data-toggle='tooltip' title='Ver imagen' class='material-icons' style='font-size:25px;margin-top:-1px;color:#f17325;'>image</i>";
            },
        },
        {
            headerName: "Nombre", field: 'nombre', width: 150, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Descripcion", field: 'descripcion', width: 150, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' }, cellRenderer: function (params) {
                return "<span  data-toggle='tooltip' data-placement='left' title='{{data.descripcion}}'>{{data.descripcion}}</span>"
            },
        },
        {
            headerName: "Tiempo", field: 'tiempo', width: 70, cellStyle: { 'text-align': 'right', 'cursor': 'pointer' },
        },
        {
            headerName: "Costo", field: 'valor', width: 60, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#212121', 'background': 'RGBA(210,216,230,0.75)', 'font-weight': 'bold', 'border-bottom': '1px dashed #212121', 'border-right': '1px dashed #212121', 'border-left': '1px dashed #212121' }, valueFormatter: currencyFormatter
        },
        {
            headerName: "Tipo", field: 'nombre_Tipo_Servicio', width: 100, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Estado", field: 'estado', width: 70, cellStyle: { 'text-align': 'center', 'cursor': 'pointer' },
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
        rowSelection: 'multiple',
        getRowStyle: ChangeRowColor
    }

    function ChangeRowColor(params) {
        if (params.data.estado === 'INACTIVO') {
            return { 'background-color': '#ecf0e0', 'color': '#999999', 'font-weight': '300' };
        }
    }

    $scope.ServiciosGridOptions.getRowNodeId = function (data) {
        return data.nombre;
    };

    $scope.onFilterTextBoxChanged = function () {
        $scope.ServiciosGridOptions.api.setQuickFilter($('#txtBuscarServicio').val());
    }

    function currencyFormatter(params) {
        let valueGrid = params.value;
        return $filter('currency')(valueGrid, '$', 0);
    }

    window.onresize = function () {
        $timeout(function () {
            $scope.ServiciosGridOptions.api.sizeColumnsToFit();
        }, 200);
    }

    $scope.Cancelar = function () {
        $mdDialog.cancel();
        $('#txtBuscarServicio').focus();
    };

    $scope.SeleccionarImagen = function (event) {
        try {
            $scope.ImagenServicioBase64 = '';
            $rootScope.InformacionImagen = '';

            if ($scope.Servicio.Imagenes_Servicio == null) { $scope.Servicio.Imagenes_Servicio = []; }

            let mayorDosMB = false;
            let files = event.target.files;

            if (files.length > 5) {
                toastr.info('Solo puede seleccionar un máximo de 5 imágenes', '', $scope.toastrOptions);
                files = [];
                return;
            }

            if (files.length + $scope.Servicio.Imagenes_Servicio.length > 5) {
                toastr.info('El servicio solo puede tener un máximo de 5 imágenes. Ya tiene ' + $scope.Servicio.Imagenes_Servicio.length + ' imágenes adjuntas', '', $scope.toastrOptions);
                files = [];
                return;
            }

            for (i = 0; i < files.length; i++) {
                let fileSize = (files[i].size / 1024 / 1024)
                if (fileSize > 2)
                    mayorDosMB = true;
            }

            if (mayorDosMB) {
                toastr.info('El tamaño de las imágenes debe ser de máximo 2MB', '', $scope.toastrOptions);
                files = [];
                return;
            }

            for (i = 0; i < files.length; i++) {
                let fileSize = (files[i].size / 1024 / 1024);
                $rootScope.InformacionImagen += 'Nombre: ' + files[i].name + ' - Tamaño: ' + fileSize.toFixed(3) + ' MB';
                $rootScope.ImagenesxAdjuntar = files.length;
                $scope.getBase64(files[i]);
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ProcesarImagen = function () {
        $('#ImagenServicio').trigger('click');
    }

    $scope.getBase64 = function (file) {
        try {
            $scope.TEMPServicio = [];
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                $scope.ImagenServicioBase64 = reader.result;
                $scope.TEMPServicio.push({
                    Id_Servicio: -1, Imagen_Base64: $scope.ImagenServicioBase64, TuvoCambios: true
                });
                $("#ImagenServicio").val('');
                $('#txtNombreServicio').focus();
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

    $scope.$on("CompanyChange", function () {
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.LimpiarDatos();
        $scope.ConsultarServicios();
        $scope.Inicializacion();
    });

    $scope.ConsultarTipoServicios();
    $scope.ConsultarServicios();
    $scope.Inicializacion();
}