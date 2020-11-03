angular.module('app.controllers')
    .controller("PagosClientesController", PagosClientesController);

PagosClientesController.$inject = ['$scope', '$rootScope', '$filter', '$mdDialog', '$mdToast', '$document', '$timeout', '$http', 'localStorageService', 'SPAService'];

function PagosClientesController($scope, $rootScope, $filter, $mdDialog, $mdToast, $document, $timeout, $http, localStorageService, SPAService) {
    $rootScope.header = 'SPA Management - Pagos por Cliente';
    $scope.IdEmpresa = $rootScope.Id_Empresa;
}