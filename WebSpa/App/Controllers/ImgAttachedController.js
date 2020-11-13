angular.module('app.controllers')
    .controller("ImgAttachedController", ImgAttachedController);

ImgAttachedController.$inject = ['$scope', '$rootScope', '$mdDialog', 'SPAService'];

function ImgAttachedController($scope, $rootScope, $mdDialog, SPAService) {
    $scope.ServicioImagenesAdjuntas = $rootScope.ServicioImagenesAdjuntas;
    $scope.ImagenesAdjuntas = $rootScope.ImagenesAdjuntas;
    $scope.ImagenesxAdjuntar = $rootScope.ImagenesxAdjuntar;
    $scope.InformacionImagen = $rootScope.InformacionImagen;

    $scope.EliminarImagenAdjunta = function (data) {
        let IdImagenAdjunta = data.id_Servicio_Imagen;
        SPAService._eliminarImagenAdjunta(IdImagenAdjunta)
            .then(
                function (result) {
                    if (result.data === true) {
                        toastr.success('Imagen eliminada correctamente', '', $scope.toastrOptions);

                        let index = $scope.ServicioImagenesAdjuntas.indexOf(data);
                        $scope.ServicioImagenesAdjuntas.splice(index, 1);
                        $rootScope.ImagenesAdjuntas = $scope.ServicioImagenesAdjuntas.length;
                        $scope.ImagenesAdjuntas = $rootScope.ImagenesAdjuntas;
                    }
                }, function (err) {
                    toastr.remove();
                    if (err.data !== null && err.status === 500)
                        toastr.error(err.data, '', $scope.toastrOptions);
                })
    }

    $scope.showConfirmBorrarServicioImagen = function (ev, data) {
        let confirm = $mdDialog.confirm()
            .title('Eliminar Imagen')
            .textContent('¿Desea Eliminar la imagen adjunta?')
            .ariaLabel('Eliminar Imagen')
            .targetEvent(ev, data)
            .ok('Sí')
            .cancel('No')
            .multiple(true);

        $mdDialog.show(confirm).then(function () {
            $scope.EliminarImagenAdjunta(data);
        }, function () {
            return;
        });
    }

    $scope.Cancelar = function () {
        $mdDialog.cancel();
        $('#txtBuscarServicio').focus();
    };
}