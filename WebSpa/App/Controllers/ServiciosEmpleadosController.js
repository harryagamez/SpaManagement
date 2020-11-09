angular.module('app.controllers')
    .controller("ServiciosEmpleadosController", ServiciosEmpleadosController);

ServiciosEmpleadosController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

function ServiciosEmpleadosController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
    $rootScope.header = 'Reportes - Servicios por Empleado';
    $scope.IdEmpresa = $rootScope.Id_Empresa;
}