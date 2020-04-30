(function () {

    angular.module('app.directives', [])
        .directive('cbutton', cbutton)
        .directive('limitTo', limitTo)
        .directive('numbersOnly', numbersOnly)
        .directive('renderOptionDatePicker', renderOptionDatePicker)
        .directive('ngEnter', ngEnter)
        .directive('tooltip', tooltip)
        .directive('validateEmail', function () {
            var email_regexp = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
            return {
                link: function (scope, elm) {
                    elm.on("keyup", function () {
                        var isMatchRegex = email_regexp.test(elm.val());
                        if (isMatchRegex && elm.hasClass('warning') || elm.val() == '') {
                            elm.removeClass('warning');
                        } else if (isMatchRegex == false && !elm.hasClass('warning')) {
                            elm.addClass('warning');
                        }
                    });
                }
            }
        })
        .directive('dateNow', ['$filter', function ($filter) {
            return {
                link: function ($scope, $element, $attrs) {
                    $element.text($filter('date')(new Date(), $attrs.dateNow));
                }
            };
        }]);


    function cbutton() {
        return {
            restrict: 'C',
            link: function (scope, element, attrs) {

                function mobilecheck() {
                    var check = false;
                    (function (a) { if (/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera);
                    return check;
                }

                var support = { animations: Modernizr.cssanimations },
                    animEndEventNames = { 'WebkitAnimation': 'webkitAnimationEnd', 'OAnimation': 'oAnimationEnd', 'msAnimation': 'MSAnimationEnd', 'animation': 'animationend' },
                    animEndEventName = animEndEventNames[Modernizr.prefixed('animation')],
                    onEndAnimation = function (el, callback) {
                        var onEndCallbackFn = function (ev) {
                            if (support.animations) {
                                if (ev.target != this) return;
                                this.removeEventListener(animEndEventName, onEndCallbackFn);
                            }
                            if (callback && typeof callback === 'function') { callback.call(); }
                        };
                        if (support.animations) {
                            el.addEventListener(animEndEventName, onEndCallbackFn);
                        }
                        else {
                            onEndCallbackFn();
                        }
                    },
                    eventtype = mobilecheck() ? 'touchstart' : 'click';

                var el = element[0];

                el.addEventListener(eventtype, function (ev) {
                    classie.add(el, 'cbutton--click');
                    onEndAnimation(classie.has(el, 'cbutton--complex') ? el.querySelector('.cbutton__helper') : el, function () {
                        classie.remove(el, 'cbutton--click');
                    });
                });
            }
        }
    }

    function limitTo() {
        return {
            require: 'ngModel',
            restrict: 'A',
            scope: {
                limit: '=limitTo'
            },
            link: function (scope, element, attr, ctrl) {
                // Just type 123         
                function inputValue(val) {
                    if (val) {
                        val = val.toString();

                        var digits = val.replace(val.slice(scope.limit), '');

                        if (digits !== val) {
                            ctrl.$setViewValue(digits);
                            ctrl.$render();
                        }

                        return parseInt(digits, 10);
                    } else {
                        return 0
                    }
                }
                ctrl.$parsers.push(inputValue);
            }
        };
    }

    function numbersOnly() {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    if (text) {
                        var transformedInput = text.replace(/[^0-9]/g, '');

                        if (transformedInput !== text) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    }
                    return 0;
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    }

    function renderOptionDatePicker($timeout) {
        return {
            restrict: 'E',
            scope: {
                renderNgModelPicker: '=modelPicker',
                dateOptions: '=options',
            },
            link: function (scope, element, attrs) {
                var _self = {};
                _self.dateOptions = angular.copy(scope.dateOptions);
                if (_self.dateOptions) {
                    self.elemClass = (self.dateOptions.elemClass) ? _self.dateOptions.elemClass : '';
                    self.elemMaxLength = (self.dateOptions.elemMaxLength) ? _self.dateOptions.elemMaxLength : 10;
                    self.dateOptions.onClose = (self.dateOptions.onClose) ? _self.dateOptions.onClose : function (dateText, datePickerInstance) {
                        $timeout(function () {
                            scope.renderNgModelPicker = dateText;
                            scope.$apply();
                        });
                    }
                }

                scope.pickerParamts = _self;
            },
            template: '<input  data-icon="calendar" data-ng-maxlength="pickerParamts.elemMaxLength" data-ng-model="renderNgModelPicker" type="text" class="form-control" data-ng-class="pickerParamts.elemClass" data-ui-date="pickerParamts.dateOptions" data-ng-required="true" />',

        };
    }

    function ngEnter() {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter, { 'event': event });
                    });

                    event.preventDefault();
                }
            });
        };
    }

    function tooltip() {
        return {
            restrict: 'A',
            link: function (scope, element, attributes) {
                element.bind('mouseleave', function () {
                    $('body>.tooltip').remove();
                });
            }
        };
    }

})();