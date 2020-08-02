(function () {
    agGrid.initialiseAgGridWithAngular1(angular);

    angular.module('app.controllers', []);

    angular.element(document).ready(function () {
        $("body").tooltip({
            selector: '[data-toggle="tooltip"]',
            trigger: 'hover'
        });

        $('body').on("click", ".dropdown-menu", function (e) {
            $(this).parent().is(".show") && e.stopPropagation();
        });
    })
})();