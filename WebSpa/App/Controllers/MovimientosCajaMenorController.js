angular.module('app.controllers')
    .controller("MovimientosCajaMenorController", MovimientosCajaMenorController);

MovimientosCajaMenorController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

function MovimientosCajaMenorController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
    $rootScope.header = 'Reportes - Movimientos Caja Menor';
    $scope.IdEmpresa = $rootScope.Id_Empresa;
}