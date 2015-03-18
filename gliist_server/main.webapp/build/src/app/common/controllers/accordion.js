angular.module("template/accordion/accordion-group.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/accordion/accordion-group.html",
      "<div class=\"panel panel-default\">\n" +
      "  <div class=\"panel-heading\" >\n" +
      "    <h4 class=\"panel-title\"><a data-toggle=\"collapse\" ng-click=\"isOpen = !isOpen\" accordion-transclude=\"heading\">{{heading}}</a></h4>\n" +
      "  </div>\n" +
      "  <div class=\"panel-collapse\" ng-hide=\"!isOpen\">\n" +
      "    <div class=\"panel-body\" ng-transclude></div>  </div>\n" +
      "</div>");
}]);

angular.module("template/accordion/accordion.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/accordion/accordion.html",
      "<div class=\"panel-group\" ng-transclude></div>");
}]);