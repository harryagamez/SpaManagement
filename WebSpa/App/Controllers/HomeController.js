﻿angular.module('app.controllers')
    .controller("HomeController", HomeController);

HomeController.$inject = ['$scope', '$rootScope', '$timeout', '$location', 'AuthService', '$mdDialog'];

function HomeController($scope, $rootScope, $timeout, $location, authService, $mdDialog) {
    $rootScope.header = 'Inicio';    
    $scope.UserAvatar = '../../Images/default_perfil_alt.png';
    $scope.UsuarioSistema = $rootScope.userData.userName;
    $scope.IdEmpresa = $rootScope.Id_Empresa;
    $rootScope.CerrandoSesionMensajes = '';       

    $scope.ModalLogout = function () {
        try {
            $mdDialog.show({
                contentElement: '#dlgLogout',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                multiple: false,
            })
            .then(function () {
            }, function () {
            });            

            $timeout(function () { $rootScope.CerrandoSesionMensajes = 'Limpiando datos de acceso de ' + $scope.UsuarioSistema; }, 100);
            $timeout(function () { $rootScope.CerrandoSesionMensajes = 'Cerrando conexiones...'; }, 1800);
            $timeout(function () { $rootScope.CerrandoSesionMensajes = 'Cerrando sesión...'; }, 2200);

            $timeout(function () {
                $scope.UserAvatar = '../../Images/default_perfil_alt.png';
                $rootScope.UserAvatar = '../../Images/default_perfil_alt.png';
                $('body>.tooltip').remove();
                $scope.Cancelar();
                authService.logOut();
            },3000);
            

        } catch (e) {
            toastr.error(e.message, '', $scope.toastrOptions);
            return;
        }
    }

    $scope.Cancelar = function () {
        $mdDialog.cancel();
    };   

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
                $rootScope.Categoria_Empresa = $rootScope.Empresas[0].id_Categoria_Servicio;
            } else if ($scope.Empresas.length === 1 && $rootScope.Id_Empresa === '00000000-0000-0000-0000-000000000000') {
                $scope.EmpresaSeleccionada = $rootScope.Empresas[0].id_Empresa;
                $rootScope.Nombre_Empresa = $rootScope.Empresas[0].nombre;
                $rootScope.Id_Empresa = $scope.EmpresaSeleccionada;
                $scope.MultipleEmpresa = false
            } else $scope.MultipleEmpresa = false;
        }
    }

    $scope.Logout = function () {       
        $scope.ModalLogout();                
    }

    $scope.UsuarioSistema = $rootScope.userData.userName;
    $scope.NombreEmpresa = $rootScope.Nombre_Empresa;
    $scope.UserId = $rootScope.userData.userId;
    $scope.$on('successfull.menuload', function () {

        if ($scope.Menu.length === 0) {
            $scope.Menu = $rootScope.Menu;
                  
        }            
    });

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
        $rootScope.Categoria_Empresa = $rootScope.Empresas[0].id_Categoria_Servicio;
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

    $scope.FiltrarEmpresa = function (id_empresa) {
        $rootScope.Id_Empresa = id_empresa;
        $rootScope.$broadcast("CompanyChange");
    }

    $scope.$on('$viewContentLoaded', function () {
        $location.replace();
    });

    $scope.$on("$destroy", function () {
        $scope.Menu = [];
        $scope.SubMenu = [];
        $scope.Empresas = [];
    });    
}