angular.module('app.controllers')
    .controller("AdministratorPanelController", AdministratorPanelController);

AdministratorPanelController.$inject = ['$scope', '$state', '$location', '$mdDialog', '$rootScope', '$timeout', 'AuthService'];

function AdministratorPanelController($scope, $state, $location, $mdDialog, $rootScope, $timeout, authService) {
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
        authService.logOut();
        $('body>.tooltip').remove();
    }

    $scope.UsuarioSistema = $rootScope.userData.userName;
    $scope.NombreEmpresa = $rootScope.Nombre_Empresa;
    $scope.UserId = $rootScope.userData.userId;
    $scope.$on('successfull.menuload', function () {
        if ($scope.Menu.length == 0)
            $scope.Menu = $rootScope.Menu;
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
}
