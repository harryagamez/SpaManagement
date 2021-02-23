angular.module('app.controllers')
    .controller("SliderController", SliderController);

SliderController.$inject = ['$scope', '$rootScope', '$mdDialog'];

function SliderController($scope, $rootScope, $mdDialog) {
    $scope.ServicioNombre = $rootScope.ServicioNombre;
    $scope.SliderServicios = $rootScope.ServicioListaImagenes;
    $scope.SliderClass = 'container' + $scope.SliderServicios.length;

    $scope.Cancelar = function () {
        $mdDialog.cancel();
        $('#txtBuscarServicio').focus();
    };
}