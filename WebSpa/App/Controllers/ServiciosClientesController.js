angular.module('app.controllers')
    .controller("AdministratorController", AdministratorController);

AdministratorController.$inject = ['$scope', '$state', '$location', '$mdDialog', '$rootScope', '$timeout', 'AuthService'];

function AdministratorController($scope, $state, $location, $mdDialog, $rootScope, $timeout, authService) {
    $rootScope.header = 'SPA Management - Servicios por Cliente';    
}