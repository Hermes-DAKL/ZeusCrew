angular.module('roadtrippin.maps', ['gservice', 'toaster'])
  .controller('mapController', function($scope, mapFactory, gservice, $location, $anchorScroll, toaster) {
    $scope.route = {};
    $scope.route.stopOptions = [1, 2, 3, 4, 5];
    $scope.route.stopTypes = ['gas_station', 'liquor_store', 'restaurant', 'lodging', 'rv_park'];
    $scope.places = [];
    $scope.savedRoutes = [];
    $scope.user = {};
    $scope.distance = '';
    $scope.time = '';

    var readCredentials = function () {
      mapFactory.getUserInfo()
        .then(function (userInfo) {
          $scope.user = userInfo;
        });
    };
    readCredentials();

    var startAutoComplete = new google.maps.places.Autocomplete(
      document.getElementById('start'), {
      types: ['geocode']
    });
    
    startAutoComplete.addListener('place_changed', function() {
      $scope.route.start = startAutoComplete.getPlace().formatted_address;
        var place = startAutoComplete.getPlace();
        // console.log('place', place);   
        // console.log($scope.route.start); 
    });

    var endAutoComplete = new google.maps.places.Autocomplete(
      document.getElementById('end'), {
      types: ['geocode']
    });

    endAutoComplete.addListener('place_changed', function() {
      $scope.route.end = endAutoComplete.getPlace().formatted_address;
      $(this).val('') ;   
    });

    //this is a call to our Google maps API factory for directions
    $scope.getRoute = function() {
      var numbStops = parseInt($scope.route.numStops);
      gservice.calcRoute($scope.route.start, $scope.route.end, numbStops, $scope.route.typeStops)
        .then(function(places) { 
          $scope.distance = gservice.thisTrip.distanceText;
          $scope.time = gservice.thisTrip.timeText;
          splitLocations(places); 
        });
      $scope.startInput = '';
      $scope.endInput = '';
    };
    //Call geolocation service from browser
    $scope.getCurrentLocation = function(place) {
      var dir= 'https://www.google.com/maps/dir/';
      //Get current location from browser
      navigator.geolocation.getCurrentPosition(function(position){
        //Showing the position for now
        dir += "'" + position.coords.latitude + ',' + position.coords.longitude + "'/'"+place.lat+','+place.long+"'";
        var win = window.open(dir, '_blank');
        win.focus();
      });
    }

    var splitLocations = function (places) {
      $scope.places = [];
      //copy the places array before we start splitting things so our original stays in-tact
      var placesCopy = [];
      for (var i = 0; i < places.length; i++) {
        //this apparently is needed for a clean copy...
        placesCopy.push(JSON.parse(JSON.stringify(places[i])));
      }
      placesCopy.forEach(function (place) { //split address for easier formatting
        place.location = place.location.split(', ');
        $scope.places.push(place);
      });
    };

    $scope.getLetter = function (i) {
      return String.fromCharCode(i + 66);
    };

    $scope.saveRoute = function () {
      var authorAndTrip = gservice.thisTrip;
      authorAndTrip.author = $scope.user.username;
      mapFactory.saveJourneyWithWaypoints(authorAndTrip).then($scope.getAll());
       $scope.urlSave();
    };

    $scope.getAll = function () {
      mapFactory.getAllRoutes().then(function (results) {
        $scope.savedRoutes = results;
      });
    };

    $scope.viewSavedRoute = function (hash) {
      $location.hash('top');
      $anchorScroll();
      for (var i = 0; i < $scope.savedRoutes.length; i++) {
        if ($scope.savedRoutes[i].hash === hash) {
          $scope.distance = $scope.savedRoutes[i].tripDistance;
          $scope.time = $scope.savedRoutes[i].tripTime;
          //split up waypoints array into names ans locations. Even index ==== name, odd index === location
          $scope.savedRoutes[i].stopLocations = [];
          $scope.savedRoutes[i].stopNames = [];
          for (var j = 0; j < $scope.savedRoutes[i].wayPoints.length; j++) {
            if (j % 2 === 0) {
              $scope.savedRoutes[i].stopNames.push($scope.savedRoutes[i].wayPoints[j]);
            } else {
              $scope.savedRoutes[i].stopLocations.push($scope.savedRoutes[i].wayPoints[j]);
            }
          }
          //set $scope.places to saved stop data so stop data will display on page
          var places = [];
          for (var k = 0; k < $scope.savedRoutes[i].stopNames.length; k++) {
            var location = $scope.savedRoutes[i].stopLocations[k];
            var place = {
              name: $scope.savedRoutes[i].stopNames[k],
              location: location,
              position: k
            };
            places.push(place);
          }
          //add stop locations to stops array, render stops to map
          gservice.render($scope.savedRoutes[i].startPoint, $scope.savedRoutes[i].endPoint, places)
          .then(function (places) { splitLocations(places); });
        }
      }
    };
    
    $scope.deleteSavedRoute = function (hash) {
      mapFactory.deleteRoute(hash).then(function () {
        $scope.getAll();
      });
    };

    // Saves shortened version of url to clipboard and displays toastr message
    $scope.urlSave = function(){
      toaster.pop({
        type: 'success',
        title: 'Yay!',
        body: 'Shortcut URL copied to clipboard',
      });
    };

    $scope.getAll();

    $scope.signout = function () {
      mapFactory.signout();
    };
  });
