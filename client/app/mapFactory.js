angular.module('roadtrippin.mapsFactory', [])

  .factory('mapFactory', function($http, $q, $window, $location) {

    //send endpoints and array of waypoints to the server
    var saveJourneyWithWaypoints = function (tripObject) {
      var deferred = $q.defer ();
      $http({
        method: 'POST',
        url: '/saveJourney',
        data: JSON.stringify(tripObject)
      }).then(function (res) {
        deferred.resolve (res);
      }).catch(function (err) {
        deferred.reject (err);
      });
      return deferred.promise;
    };

    // Retrieve all saved routes
    var getAllRoutes = function() {
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: '/saveJourney'
      }).then(function (res) {
        deferred.resolve (res.data);
      }).catch(function (err) {
        deferred.reject (err);
      });
      return deferred.promise;
    };
    
    // Delete route, hash passed from mapCtrl
    var deleteRoute = function(hash) {
      var deferred = $q.defer();
      $http({
        method: 'POST',
        url: '/deleteJourney',
        data: JSON.stringify({hash: hash})
      }).then(function (res) {
        deferred.resolve (res);
      }).catch(function (err) {
        deferred.reject (err);
      });
      return deferred.promise;
    };
    
    // Retrieve user's info
    var getUserInfo = function() {
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: '/api/user'
      }).then(function (res) {
        deferred.resolve(res.data);
      }).catch(function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };

    // sign user out
    var signout = function() {
      $window.localStorage.removeItem('com.roadtrippin');
      $location.path('/signin');
    };

    return {
      saveJourneyWithWaypoints: saveJourneyWithWaypoints,
      getAllRoutes: getAllRoutes,
      deleteRoute: deleteRoute,
      signout: signout,
      getUserInfo: getUserInfo
    };
  });
