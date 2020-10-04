angular.module('app.controllers')
    .controller("ClientesController", ClientesController);

ClientesController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

function ClientesController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
    $scope.Clientes = [];
    $scope.ObjetoCliente = [];
    $scope.Municipios = [];
    $scope.Barrios = [];
    $scope.BarriosGlobales = [];
    $scope.EstadoClientes = [];
    $scope.TipoClientes = [];
    $scope.IsLoading = false;
    $scope.ProcessQueu = [];
    $scope.MunicipioSeleccionado = -1;
    $scope.BarrioSeleccionado = -1;
    $scope.TipoClienteSeleccionado = -1;
    $scope.EstadoSeleccionado = 'ACTIVO';
    $scope.Accion = '';
    $scope.ListadoClientes = false;
    $scope.DetalladoServicios = false;
    $scope.GeneralServicios = false;
    $scope.PermitirFiltrar = true;
    $scope.ArchivoSeleccionado = null;
    $scope.ExcelClientes = [];
    $scope.Validaciones = [];
    const mail_expression = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,5}$/;

    $scope.IdEmpresa = $rootScope.Id_Empresa;
    $scope.IdUsuario = parseInt($rootScope.userData.userId);

    $scope.Cliente =
    {
        Id_Cliente: -1,
        Cedula: '',
        Nombres: '',
        Apellidos: '',
        Telefono_Fijo: '',
        Telefono_Movil: '',
        Mail: '', Direccion: '',
        Id_Municipio: -1,
        Id_Barrio: -1,
        Fecha_Nacimiento: new Date(),
        Id_Tipo: -1,
        Estado: $scope.EstadoSeleccionado,
        Id_Empresa: $scope.IdEmpresa,
        Id_Usuario_Creacion: $scope.IdUsuario
    }

    $scope.MunicipiosCopy = [];
    $scope.MunicipiosCopy.push({ id_Municipio: -1, nombre: '[Seleccione]' });

    $scope.Barrios.push({ id_Barrio: -1, nombre: '[Seleccione]', id_Municipio: -1, codigo: "-1", id_Object: -1 });

    $scope.fEditarCliente = false;

    $scope.Inicializacion = function () {
        $(".ag-header-cell[col-id='Checked']").find(".ag-cell-label-container").remove();
        window.onresize();        
    }

    $scope.GuardarCliente = function () {
        if ($scope.ValidarDatos()) {
            $scope.ObjetoCliente = [];
            $scope.ObjetoCliente.push($scope.Cliente);

            SPAService._registrarActualizarCliente(JSON.stringify($scope.ObjetoCliente))
                .then(
                    function (result) {
                        if (result.data === true) {
                            toastr.success('Cliente registrado y/o actualizado correctamente', '', $scope.toastrOptions);
                            $scope.ConsultarClientes();
                            
                            $('#txtCedula').focus();
                            if ($scope.fEditarCliente) {
                                $scope.Cancelar();
                            }

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
                        $scope.ClientesGridOptions.api.setRowData($scope.Clientes);

                        $timeout(function () {
                            $scope.ClientesGridOptions.api.sizeColumnsToFit();
                        }, 200);
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })

        $('#txtCedula').focus();
    }

    $scope.ConsultarCliente = function (e, cedula_cliente) {
        $scope.Accion = '';

        $scope.Cliente.Id_Cliente = -1;
        $scope.Cliente.Nombres = '';
        $scope.Cliente.Apellidos = '';
        $scope.Cliente.Telefono_Fijo = '';
        $scope.Cliente.Telefono_Movil = '';
        $scope.Cliente.Mail = '';
        $scope.Cliente.Direccion = '';
        $scope.Cliente.Id_Barrio = -1;
        $scope.Cliente.Id_Municipio = -1;
        $scope.Cliente.Fecha_Nacimiento = $filter('date')(new Date(), 'MM-dd-yyyy');
        $scope.Cliente.Id_Tipo = -1;
        $scope.Cliente.Estado = $scope.EstadoSeleccionado;
        if (cedula_cliente !== null && cedula_cliente !== '') {
            SPAService._consultarCliente(cedula_cliente, $scope.IdEmpresa)
                .then(
                    function (result) {
                        if (result.data !== undefined && result.data !== null) {
                            $scope.Accion = 'BUSQUEDA_CLIENTE';
                            $scope.FiltrarMunicipios(result.data.id_Departamento);
                            $scope.ConsultarBarrios(result.data.id_Municipio);
                            $scope.Cliente.Id_Cliente = result.data.id_Cliente;
                            $scope.Cliente.Cedula = result.data.cedula;
                            $scope.Cliente.Nombres = result.data.nombres;
                            $scope.Cliente.Apellidos = result.data.apellidos;                            
                            $scope.Cliente.Telefono_Fijo = result.data.telefono_Fijo;
                            $scope.Cliente.Telefono_Movil = result.data.telefono_Movil;
                            $scope.Cliente.Mail = result.data.mail;
                            $scope.Cliente.Direccion = result.data.direccion;
                            $scope.Cliente.Id_Barrio = result.data.id_Barrio;                            
                            $scope.Cliente.Fecha_Nacimiento = $filter('date')(new Date(result.data.fecha_Nacimiento), 'MM/dd/yyyy');
                            $scope.Cliente.Id_Tipo = result.data.id_Tipo;
                            $scope.TipoClienteSeleccionado = result.data.id_Tipo;
                            $scope.Cliente.Estado = result.data.estado;
                            $timeout(function () {
                                $scope.DepartamentoSeleccionado = result.data.id_Departamento;
                                $scope.MunicipioSeleccionado = result.data.id_Municipio;
                                $scope.BarrioSeleccionado = result.data.id_Barrio;
                            }, 200);                          

                            $('#txtNombre').focus();
                            $scope.AccionCliente = 'Actualizar Cliente';
                            $scope.fEditarCliente = true;
                            $scope.PermitirFiltrar = false;
                        }
                        else
                            $scope.PermitirFiltrar = false;
                    }, function (err) {
                        toastr.remove();
                        if (err.data !== null && err.status === 500)
                            toastr.error(err.data, '', $scope.toastrOptions);
                    })
        }
    }

    $scope.ConsultarTipoClientes = function () {
        SPAService._consultarTipoClientes()
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.TipoClientes = [];
                        $scope.TipoClientes = result.data;
                        $scope.TipoClientes.push({ id_Tipo: -1, nombre: '[Seleccione]', descripcion: "" })
                        $scope.TipoClientes = $filter('orderBy')($scope.TipoClientes, 'nombre', false);
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
                        } else {
                            $scope.Barrios.push({ id_Barrio: -1, nombre: '[Seleccione]', id_Municipio: -1, codigo: "-1", id_Object: -1 });
                            $scope.MunicipioSeleccionado = -1;
                        }

                        if ($scope.Accion === 'BUSQUEDA_CLIENTE') {
                            let filtrarBarrio = Enumerable.From($scope.Barrios)
                                .Where(function (x) { return x.id_Barrio === $scope.Cliente.Id_Barrio })
                                .ToArray();

                            if (filtrarBarrio.length > 0)
                                $scope.BarrioSeleccionado = $scope.Cliente.Id_Barrio;
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
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.ConsultarDepartamentos = function () {
        SPAService._consultarDepartamentos()
            .then(
                function (result) {
                    if (result.data !== undefined && result.data !== null) {
                        $scope.Departamentos = [];
                        $scope.Departamentos = result.data;
                        $scope.Departamentos.push({ id_Departamento: -1, nombre: '[Seleccione]' });
                        $scope.Departamentos = $filter('orderBy')($scope.Departamentos, 'nombre', false);
                        $scope.DepartamentoSeleccionado = -1;
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.FiltrarBarrios = function (id_Municipio) {
        $scope.ConsultarBarrios(id_Municipio);
    }

    $scope.FiltrarMunicipios = function (id_Departamento) {
        try {
            let idDepartamento = id_Departamento;
            $scope.MunicipiosCopy = [];
            $scope.MunicipiosCopy = angular.copy($scope.Municipios);

            $scope.MunicipiosCopy = $scope.Municipios.filter(function (e) {
                return e.id_Departamento === idDepartamento;
            });

            $scope.MunicipiosCopy.push({ id_Municipio: -1, nombre: '[Seleccione]' });
            $scope.MunicipiosCopy = $filter('orderBy')($scope.MunicipiosCopy, 'nombre', false);
            $scope.MunicipiosCopy = $filter('orderBy')($scope.MunicipiosCopy, 'id_Municipio', false);
            $scope.MunicipioSeleccionado = -1;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }    

    $scope.ImportarArchivo = function () {
        $('#labelArchivo').trigger('click');
    }

    $scope.CargarArchivo = function (archivo) {
        $scope.ArchivoSeleccionado = archivo.target.files[0];
        $scope.ProcesarArchivo();
    }

    $scope.ProcesarArchivo = function () {
        let ObjetoDatos = [];
        let file = $scope.ArchivoSeleccionado;

        if ((file.type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            && (file.type != "application/vnd.ms-excel")) {
            toastr.info('La extensión del archivo debe ser: .xls, ó .xlsx', '', $scope.toastrOptions);
            $("#labelArchivo").val('');
            $scope.ArchivoSeleccionado = null;
            $scope.$apply();
            return;
        }

        if (file) {
            var reader = new FileReader();
            var name = file.name;
            $scope.fileName = file.name;
            reader.onload = function (e) {
                if (!e) {
                    var data = reader.content;
                } else {
                    var data = e.target.result;
                }

                try {
                    let workbook = XLSX.read(data, { type: 'binary' });
                    let first_sheet_name = workbook.SheetNames[0];

                    ObjetoDatos = XLSX.utils.sheet_to_json(workbook.Sheets[first_sheet_name], { raw: false });
                    $scope.ExcelClientes = [];
                    $scope.Validaciones = [];

                    if (!ObjetoDatos[0].hasOwnProperty("CEDULA") || !ObjetoDatos[0].hasOwnProperty("NOMBRE(S)") || !ObjetoDatos[0].hasOwnProperty("APELLIDO(S)")
                        || !ObjetoDatos[0].hasOwnProperty("MAIL") || !ObjetoDatos[0].hasOwnProperty("DIRECCION") || !ObjetoDatos[0].hasOwnProperty("MUNICIPIO")
                        || !ObjetoDatos[0].hasOwnProperty("CELULAR") || !ObjetoDatos[0].hasOwnProperty("FECHA_NACIMIENTO")) {
                        toastr.info('El formato del archivo no es correcto, por favor verifique si las columnas tienen valores vacios o los nombres de las columnas son incorrectos', '', $scope.toastrOptions);
                        $("#labelArchivo").val('');
                        $scope.ArchivoSeleccionado = null;
                        $scope.$apply();
                        return;
                    }

                    if (ObjetoDatos.length > 0) {
                        if (ObjetoDatos.length > 400) {
                            toastr.info('El archivo de excel, debe tener máximo 400 registros', '', $scope.toastrOptions);
                            $("#labelArchivo").val('');
                            $scope.ArchivoSeleccionado = null;
                            $scope.$apply();
                            return;
                        }

                        let numeroFila = 0;
                        for (let objeto of ObjetoDatos) {
                            numeroFila += 1;

                            if (objeto["CEDULA"] === undefined || objeto["CEDULA"] === '') {
                                let mensaje = {
                                    Mensaje: "Campo cédula vacio. - Registro número " + numeroFila
                                }
                                $scope.Validaciones.push(mensaje);
                                continue;
                            }

                            if (objeto["NOMBRE(S)"] === undefined || objeto["NOMBRE(S)"] === '') {
                                let mensaje = {
                                    Mensaje: "Campo nombres(s) vacio. - Registro número " + numeroFila
                                }
                                $scope.Validaciones.push(mensaje);
                                continue;
                            }

                            if (objeto["APELLIDO(S)"] === undefined || objeto["APELLIDO(S)"] === '') {
                                let mensaje = {
                                    Mensaje: "Campo apellido(s) vacio. - Registro número " + numeroFila
                                }
                                $scope.Validaciones.push(mensaje);
                                continue;
                            }

                            if (objeto["MAIL"] === undefined || objeto["MAIL"] === '') {
                                let mensaje = {
                                    Mensaje: "Campo mail vacio. - Registro número " + numeroFila
                                }
                                $scope.Validaciones.push(mensaje);
                                continue;
                            }

                            if (objeto["DIRECCION"] === undefined || objeto["DIRECCION"] === '') {
                                let mensaje = {
                                    Mensaje: "Campo dirección vacio. - Registro número " + numeroFila
                                }
                                $scope.Validaciones.push(mensaje);
                                continue;
                            }

                            if (objeto["CELULAR"] === undefined || objeto["CELULAR"] === '') {
                                let mensaje = {
                                    Mensaje: "Campo celular vacio. - Registro número " + numeroFila
                                }
                                $scope.Validaciones.push(mensaje);
                                continue;
                            }

                            if (objeto["FECHA_NACIMIENTO"] === undefined || objeto["FECHA_NACIMIENTO"] === '') {
                                let mensaje = {
                                    Mensaje: "Campo fecha_nacimiento vacio. - Registro número " + numeroFila
                                }
                                $scope.Validaciones.push(mensaje);
                                continue;
                            }

                            let buscarCliente = Enumerable.From($scope.ExcelClientes)
                                .Where(function (x) {
                                    return x.Cedula === objeto["CEDULA"]
                                }).ToArray();

                            if (buscarCliente.length === 0) {
                                if (!mail_expression.test(objeto["MAIL"])) {
                                    let mensaje = {
                                        Mensaje: "Mail inválido. - Registro número " + numeroFila
                                    }
                                    $scope.Validaciones.push(mensaje);
                                    continue;
                                }
                                if (!moment(objeto["FECHA_NACIMIENTO"], 'YYYY-MM-DD', true).isValid()) {
                                    let mensaje = {
                                        Mensaje: "Fecha de nacimiento inválida. - Registro número " + numeroFila
                                    }
                                    $scope.Validaciones.push(mensaje);
                                    continue;
                                }

                                let cliente = {
                                    "Id_Cliente": -1,
                                    "Cedula": objeto["CEDULA"],
                                    "Nombres": objeto["NOMBRE(S)"],
                                    "Apellidos": objeto["APELLIDO(S)"],
                                    "Mail": objeto["MAIL"],
                                    "Direccion": objeto["DIRECCION"],
                                    "Telefono_Movil": objeto["CELULAR"],
                                    "Fecha_Nacimiento": objeto["FECHA_NACIMIENTO"],
                                    "Id_Tipo": 1,
                                    "Estado": "ACTIVO",
                                    "Id_Empresa": $scope.IdEmpresa,
                                    "Id_Usuario_Creacion": $scope.IdUsuario
                                };

                                $scope.ExcelClientes.push(cliente)
                            }
                        }

                        if ($scope.ExcelClientes.length > 0)
                            $scope.ProcesarExcelClientes($scope.ExcelClientes);
                        else if ($scope.Validaciones.length > 0) {
                            let mensajes = Enumerable.From($scope.Validaciones)
                                .Select(function (x) { return x.Mensaje })
                                .ToArray().join('\n');

                            let information = $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Validación excel')
                                .textContent('El archivo tiene las siguientes inconsistencias: \n' + mensajes + '.\n\nNo se puede procesar ningún registro del archivo')
                                .ariaLabel('Validación excel')
                                .ok('Aceptar')
                                .multiple(true);

                            $mdDialog.show(information);
                        }
                    } else {
                        toastr.info('El archivo seleccionado no tiene datos', '', $scope.toastrOptions);
                        $("#labelArchivo").val('');
                        $scope.ArchivoSeleccionado = null;
                        return;
                    }
                } catch (e) {
                    toastr.error(e.message, '', $scope.toastrOptions);
                    $("#labelArchivo").val('');
                    $scope.ArchivoSeleccionado = null;
                    return;
                }
                $("#labelArchivo").val('');
                $scope.ArchivoSeleccionado = null;
            };

            if (!FileReader.prototype.readAsBinaryString) {
                FileReader.prototype.readAsBinaryString = function (fileData) {
                    var binary = '';
                    var pt = this;
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var bytes = new Uint8Array(reader.result);
                        var length = bytes.byteLength;
                        for (var i = 0; i < length; i++) {
                            binary += String.fromCharCode(bytes[i]);
                        }
                        pt.content = binary;
                        $(pt).trigger('onload');
                    }
                    reader.readAsArrayBuffer(fileData);
                }
            }
            reader.readAsBinaryString(file);
        }
    }

    $scope.ProcesarExcelClientes = function (clientes) {
        try {
            if ($scope.Validaciones.length > 0) {
                let mensajes = Enumerable.From($scope.Validaciones)
                    .Select(function (x) { return x.Mensaje })
                    .ToArray().join('\n');

                let confirm = $mdDialog.confirm()
                    .title('Validación excel')
                    .textContent('El archivo tiene las siguientes inconsistencias: \n' + mensajes + '.\n\nLos registros de clientes que presentaron inconsistencias no se procesarán. \n¿Desea continuar?')
                    .ariaLabel('Validar excel')
                    .ok('Sí')
                    .cancel('No')
                    .multiple(true);

                $mdDialog.show(confirm).then(function () {
                    $scope.GuardarExcelClientes(clientes);
                }, function () {
                    return;
                });
            } else $scope.GuardarExcelClientes(clientes);
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.GuardarExcelClientes = function (clientes) {
        SPAService._registrarClientes(JSON.stringify(clientes))
            .then(
                function (result) {
                    if (result.data === true) {
                        toastr.success('Clientes actualizados correctamente', '', $scope.toastrOptions);
                        $scope.ConsultarClientes();
                        $('#txtCedula').focus();
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    window.onresize = function () {
        $timeout(function () {
            $scope.ClientesGridOptions.api.sizeColumnsToFit();
        }, 300);
    }

    $scope.ValidarDatos = function () {
        try {
            $scope.Cliente.Id_Barrio = $scope.BarrioSeleccionado
            $scope.Cliente.Id_Tipo = $scope.TipoClienteSeleccionado;
            $scope.Cliente.Estado = $scope.EstadoSeleccionado;

            if ($scope.Cliente.Cedula === '') {
                toastr.info('Identificación del cliente es requerida', '', $scope.toastrOptions);
                $('#txtCedula').focus();
                return false;
            }

            if ($scope.Cliente.Nombres === '') {
                toastr.info('Nombre del cliente es requerido', '', $scope.toastrOptions);
                $('#txtNombres').focus();
                return false;
            }

            if ($scope.Cliente.Apellidos === '') {
                toastr.info('Apellido del cliente es requerido', '', $scope.toastrOptions);
                $('#txtApellido').focus();
                return false;
            }

            if ($scope.Cliente.Telefono_Movil === '') {
                toastr.info('Celular del cliente es requerido', '', $scope.toastrOptions);
                $('#txtMovil').focus();
                return false;
            }

            if ($scope.Cliente.Mail === '') {
                toastr.info('Correo electrónico del clientes es requerido', '', $scope.toastrOptions);
                $('#txtMail').focus();
                return false;
            }

            if (!mail_expression.test($scope.Cliente.Mail)) {
                toastr.info('La dirección de correo electrónico no es válida.', '', $scope.toastrOptions);
                $('#txtMail').focus();
                return false;
            }            

            if ($scope.Cliente.Id_Tipo === -1) {
                toastr.info('Tipo de cliente es requerido', '', $scope.toastrOptions);
                $('#slTipoCliente').focus();
                return false;
            }

            if (parseInt($filter('date')(new Date($scope.Cliente.Fecha_Nacimiento), 'yyyyMMdd')) > parseInt($filter('date')(new Date(), 'yyyyMMdd'))) {
                toastr.info('La fecha de nacimiento, debe ser menor que la fecha actual', '', $scope.toastrOptions);
                $('#dpFechaNacimiento').focus();
                return false;
            }

            if ($scope.Cliente.Id_Barrio === -1) {
                toastr.info('Debe seleccionar un barrio', '', $scope.toastrOptions);
                $('#slBarrio').focus();
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
            $scope.EstadoSeleccionado = 'ACTIVO';

            $scope.Cliente =
            {
                Id_Cliente: -1,
                Cedula: '',
                Nombres: '',
                Apellidos: '',
                Telefono_Fijo: '',
                Telefono_Movil: '',
                Mail: '', Direccion: '',
                Id_Municipio: -1,
                Id_Barrio: -1,
                Fecha_Nacimiento: new Date(),
                Id_Tipo: -1,
                Estado: $scope.EstadoSeleccionado,
                Id_Empresa: $scope.IdEmpresa,
                Id_Usuario_Creacion: $scope.IdUsuario
            }

            $scope.MunicipioSeleccionado = -1;
            $scope.BarrioSeleccionado = -1;
            $scope.DepartamentoSeleccionado = -1;
            $scope.TipoClienteSeleccionado = -1;

            $scope.ListadoClientes = false;
            $scope.PermitirFiltrar = true;
            $scope.DetalladoServicios = false;
            $scope.GeneralServicios = false;
            $scope.Accion = '';
            $scope.ObjetoCliente = [];

            $scope.fEditarCliente = false;

            $scope.MunicipiosCopy = [];
            $scope.MunicipiosCopy.push({ id_Municipio: -1, nombre: '[Seleccione]' });            
                
            $scope.CedulaReadOnly = false;
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.ClientesGridOptionsColumns = [        
        {
            headerName: "", field: "Checked", suppressFilter: true, width: 30, checkboxSelection: true, headerCheckboxSelection: true, hide: false, headerCheckboxSelectionFilteredOnly: true, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer', "margin-top": "3px" }
        },
        {
            headerName: "", field: "", suppressMenu: true, visible: true, width: 20, cellStyle: { "display": "flex", "justify-content": "center", "align-items": "center", 'cursor': 'pointer' },
            cellRenderer: function () {
                return "<i data-ng-click='EditarCliente (data)' data-toggle='tooltip' title='Editar Cliente' class='material-icons' style='font-size:25px;margin-top:-1px;color:#f17325;'>create</i>";
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
            headerName: "Celular", field: 'telefono_Movil', width: 120, cellStyle: { 'text-align': 'right', 'cursor': 'pointer', 'color': '#212121', 'background': 'RGBA(210,216,230,0.75)', 'font-weight': 'bold', 'border-bottom': '1px dashed #212121', 'border-right': '1px dashed #212121', 'border-left': '1px dashed #212121' },
        },
        {
            headerName: "Mail", field: 'mail', width: 250, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
        },
        {
            headerName: "Dirección", field: 'direccion', width: 230, cellStyle: { 'text-align': 'left', 'cursor': 'pointer' },
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

    $scope.ClientesGridOptions = {
        defaultColDef: {
            resizable: true
        },
        columnDefs: $scope.ClientesGridOptionsColumns,
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

    $scope.ModalNuevoCliente = function () {
        try {
            if ($scope.Cliente.Id_Cliente === -1)
                $scope.AccionCliente = 'Registrar Cliente';
            else
                $scope.AccionCliente = 'Actualizar Cliente';

            $mdDialog.show({
                contentElement: '#dlgNuevoCliente',
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

    function ChangeRowColor(params) {
        if (params.data.estado === 'INACTIVO') {
            return { 'background-color': '#ecf0e0', 'color': '#999999', 'font-weight': '300' };
        }
    }

    $scope.onFilterTextBoxChanged = function () {
        if ($scope.PermitirFiltrar === true) {
            $scope.ClientesGridOptions.api.setQuickFilter($('#txtNombres').val());
        }
    }

    $scope.EditarCliente = function(data) {
        try {
            if (data !== undefined && data !== null) {
                $scope.LimpiarDatos();
                $scope.fEditarCliente = true;
                $scope.FiltrarMunicipios(data.id_Departamento);
                $scope.ConsultarBarrios(data.id_Municipio);
                $scope.Accion = 'BUSQUEDA_CLIENTE';
                $scope.Cliente.Id_Cliente = data.id_Cliente;
                $scope.Cliente.Cedula = data.cedula;
                $scope.Cliente.Nombres = data.nombres;
                $scope.Cliente.Apellidos = data.apellidos;
                $scope.Cliente.Telefono_Fijo = data.telefono_Fijo;
                $scope.Cliente.Telefono_Movil = data.telefono_Movil;
                $scope.Cliente.Mail = data.mail;
                $scope.Cliente.Direccion = data.direccion;                
                $scope.Cliente.Id_Municipio = data.id_Municipio;
                $scope.Cliente.Id_Barrio = data.id_Barrio;
                $scope.Cliente.Fecha_Nacimiento = $filter('date')(new Date(data.fecha_Nacimiento), 'MM/dd/yyyy');
                $scope.Cliente.Id_Tipo = data.id_Tipo;
                $scope.TipoClienteSeleccionado = data.id_Tipo;
                $scope.Cliente.Estado = data.estado;
                $scope.DepartamentoSeleccionado = data.id_Departamento;

                $timeout(function () {
                    $scope.MunicipioSeleccionado = data.id_Municipio;
                    $scope.BarrioSeleccionado = data.id_Barrio;
                },200);                
                
                $scope.EstadoSeleccionado = $scope.Cliente.Estado;                
                $scope.PermitirFiltrar = false;
                $scope.ModalNuevoCliente();
            }
        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.Cancelar = function () {
        $mdDialog.cancel();
    };

    $scope.$on("CompanyChange", function () {
        $scope.IdEmpresa = $rootScope.Id_Empresa;
        $scope.LimpiarDatos();
        $scope.ConsultarClientes();
        $scope.Inicializacion();
    });

    $scope.ConsultarClientes();
    $scope.ConsultarMunicipios();
    $scope.ConsultarDepartamentos();
    $scope.ConsultarTipoClientes();
    $scope.Inicializacion();
}