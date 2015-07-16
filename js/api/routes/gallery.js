var q      = require('q')
  , glob   = require('glob')
  , _      = require('underscore')
  , config = require('../../config.js');

var api = (function() {
    /**
     * Listowanie albumów
     * todo: Jakieś cache by nie szukać co zapytanie
     */
    var listAlbums = function() {
        var defer = q.defer()
          , tree = {};

        glob('**/*', {
              cwd: config.FRONTEND_PATH + 'data/img/gallery'
            , mark: true
        }, function (er, files) {
            _(files).each(function(path) {
                /** Tworzenie JSONu z pliku */
                var segments = ('/' + path).match(/(?:([^\/]*)\/)|(.*\..*)/g)
                  , current  = tree;
                _(segments).each(function(segment) {
                    /** Jeśli jest katalogiem to dodaje do wcześniejszej odnogi */
                    if(/.*\/$/.test(segment))
                        current = (current[segment] = current[segment] || { files: [] });
                    else
                        current.files.push({
                              name: segment
                            , url:  'img/gallery/' + path
                        });
                });
            });
            defer.resolve(tree);
        });
        return defer.promise;
    };
    return {
        listAlbums: listAlbums
    };
}());

module.exports = function(router) {
    /** Listowanie albumów */
    router.get('/', function(req, res, next) {
        api.listAlbums().then(res.json.bind(res));
    });
};