import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { } from 'googlemaps';

declare const google: any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('map') mapRef: ElementRef;
  map: google.maps.Map;
  global: any;
  latitude: any;
  longitude: any;
  autoCompleted: any;
  location: any;
  mapOptions: any;
  marker: any;
  geocode: any;
  decodeAddress: any;
  autoCompleteInput: '';
  formatedAddress: any;

  ngOnInit() {
    const that = this;
    this.global = window.navigator;
    this.global.permissions.query({ name: 'geolocation' }).then(function (permissionStatus) {
      console.log('geolocation permission state is ', permissionStatus.state);
      that.findMe();
      permissionStatus.onchange = function () {
        console.log('geolocation permission state has changed to ', this.state);
      };
      if (permissionStatus.state === 'denied') {
        that.global.permissions.revoke({ name: 'notifi' }).then(function (result) {
          console.log('geolocation permission state has changed to ', result.state);
        });
      }
    }).catch(err => console.log(err));
  }

  ngAfterViewInit() {
    this.autoCompleteAddress();
  }

  findMe() {
    const that = this;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        that.showPosition(position);
      }, (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log('User denied the request for Geolocation.');
            break;
          case error.POSITION_UNAVAILABLE:
            console.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            console.error('The request to get user location timed out.');
            break;
        }
      }, {
          timeout: 30000,
          maximumAge: 30000,
          enableHighAccuracy: true
        });
    } else {
      that.staticposition();
    }
  }

  showPosition(position) {
    const that = this;
    this.location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    this.mapOptions = {
      center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;
    that.addressGeocode(that.location);
    this.map = new google.maps.Map(this.mapRef.nativeElement, this.mapOptions);
    if (!this.marker) {
      that.marker = new google.maps.Marker({
        position: that.location,
        map: this.map,
        draggable: true,
        title: 'Got you!'
      });
    } else {
      that.marker.setPosition(that.location);
    }

    google.maps.event.addListener(this.marker, 'mouseup', function (event) {
      that.location = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
      that.addressGeocode(that.location);
      that.latitude = event.latLng.lat();
      that.longitude = event.latLng.lng();
      console.log(event.latLng.lat(), event.latLng.lng());
    });
  }

  staticposition() {
    const that = this;
    this.location = new google.maps.LatLng(17.4423827, 78.3975246);
    this.mapOptions = {
      center: new google.maps.LatLng(),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    this.map = new google.maps.Map(this.mapRef.nativeElement, this.mapOptions);
    that.addressGeocode(that.location);
    if (!this.marker) {
      that.marker = new google.maps.Marker({
        position: location,
        map: this.map,
        draggable: true,
        title: 'Got you!'
      });
    } else {
      that.marker.setPosition(that.location);
    }
    google.maps.event.addListener(this.marker, 'mouseup', function (event) {
      that.location = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
      that.marker.setPosition(that.location);
      that.addressGeocode(that.location);
      that.latitude = event.latLng.lat();
      that.longitude = event.latLng.lng();
    });
  }

  addressGeocode(location) {
    const that = this;
    this.geocode = new google.maps.Geocoder();
    this.geocode.geocode({ 'latLng': location }, function (results, status) {
      if (status === 'OK') {
        that.formatedAddress = results[0].formatted_address;
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  autoCompleteAddress() {
    const that = this;
    this.autoCompleted = new google.maps.places.Autocomplete((document.getElementById('autocomplete')), { types: ['geocode'] });
    google.maps.event.addListener(this.autoCompleted, 'place_changed', function () {
      const place = that.autoCompleted.getPlace();
      that.formatedAddress = place.formatted_address;
      that.latitude = place.geometry.location.lat();
      that.longitude = place.geometry.location.lng();
      that.location = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
      if (place.geometry.viewport) {
        that.map.fitBounds(place.geometry.viewport);
      } else {
        that.map.setCenter(place.geometry.location);
        that.map.setZoom(17);  // Why 17? Because it looks good.
      }
      if (!that.marker) {
        that.marker = new google.maps.Marker({
          position: that.location,
          map: this.map,
          draggable: true,
          title: 'Got you!'
        });
      } else {
        that.marker.setPosition(that.location);
      }
    });
  }
}
