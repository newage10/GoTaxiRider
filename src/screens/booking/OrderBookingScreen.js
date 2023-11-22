import { Alert, Platform, StyleSheet, Text, View, BackHandler } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsLocation } from '~/constant/content';
import { GOOGLE_MAPS_APIKEY, LATITUDE_DELTA, LONGITUDE_DELTA, screenHeight, screenWidth } from '~/helper/GeneralMain';
import MapViewDirections from 'react-native-maps-directions';
import { check, openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { NavigationContext } from '@react-navigation/native';

const OrderBookingScreen = (props) => {
  const { directionData } = props?.route?.params ?? {};
  console.log('Test directionData: ', JSON.stringify(directionData));
  const navigation = React.useContext(NavigationContext);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [currentLatitude, setCurrentLatitude] = useState(directionData?.fromLocation?.latitude);
  const [currentLongitude, setCurrentLongitude] = useState(directionData?.fromLocation?.longitude);
  const [coordinates, setCoordinates] = useState([]);

  const mapView = useRef(null);

  useEffect(() => {
    handlePermissionsLocation();
  }, []);

  useEffect(() => {
    if (directionData) {
      // Tạo một mảng mới chứa các tọa độ hiện tại và tọa độ mới từ directionData
      const newCoordinates = [...coordinates, directionData.fromLocation, directionData.toLocation];
      setCoordinates(newCoordinates);
    }
  }, [directionData]);

  /**
   * Flow get ví trí hiện tại
   */
  useEffect(() => {
    if (currentPosition) {
      const { latitude, longitude } = currentPosition?.coords;
      setCurrentLatitude(latitude);
      setCurrentLongitude(longitude);
    }
  }, [currentPosition]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', preventGoBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', preventGoBack);
    };
  }, []);

  const preventGoBack = () => {
    navigation.goBack();
    return true;
  };

  /**
   * Hỏi quyền vị trí
   */
  const handlePermissionsLocation = () => {
    check(Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
      .then((result) => {
        switch (result) {
          case RESULTS.DENIED:
            request(Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PermissionsLocation.alertRequest).then((result) => {
              switch (result) {
                case RESULTS.DENIED:
                  Alert.alert('Thông báo', PermissionsLocation.alertDenied);
                  break;
                case RESULTS.GRANTED:
                  getCurrentLocation();
                  break;
                case RESULTS.BLOCKED:
                  Alert.alert(
                    'Cấp quyền truy cập',
                    PermissionsLocation.alertGranted,
                    [
                      { text: 'Không', style: 'cancel' },
                      { text: 'Đồng ý', onPress: () => openSettings() },
                    ],
                    { cancelable: true }
                  );
                  break;
              }
            });
            break;
          case RESULTS.GRANTED:
            getCurrentLocation();
            break;
          case RESULTS.BLOCKED:
            Alert.alert(
              'Cấp quyền truy cập',
              PermissionsLocation.alertGranted,
              [
                { text: 'Không', style: 'cancel' },
                { text: 'Đồng ý', onPress: () => openSettings() },
              ],
              { cancelable: true }
            );
            break;
        }
      })
      .catch((error) => {
        if (__DEV__) {
          console.log('Test error permission: ', error);
        }
      });
  };

  /**
   * Hàm get vị trí hiện tại
   */
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition((info) => {
      console.log('Test vi tri: ', info);
      setCurrentPosition(info);
    });
  };

  const onMapPress = (e) => {
    setCoordinates([...coordinates, e.nativeEvent.coordinate]);
  };

  return (
    <View style={styles.container}>
      <MapView
        initialRegion={{
          latitude: currentLatitude,
          longitude: currentLongitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        style={StyleSheet.absoluteFill}
        ref={mapView}
        onPress={onMapPress}
      >
        {coordinates.map((coordinate, index) => (
          <Marker key={`coordinate_${index}`} coordinate={coordinate} />
        ))}
        {coordinates.length >= 2 && (
          <MapViewDirections
            origin={coordinates[0]}
            waypoints={coordinates.length > 2 ? coordinates.slice(1, -1) : undefined}
            destination={coordinates[coordinates.length - 1]}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor="hotpink"
            optimizeWaypoints={true}
            onStart={(params) => {
              console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
            }}
            onReady={(result) => {
              console.log(`Distance: ${result.distance} km`);
              console.log(`Duration: ${result.duration} min.`);

              mapView.current.fitToCoordinates(result.coordinates, {
                edgePadding: {
                  right: screenWidth / 20,
                  bottom: screenHeight / 20,
                  left: screenWidth / 20,
                  top: screenHeight / 20,
                },
              });
            }}
            onError={(errorMessage) => {
              // console.log('GOT AN ERROR');
            }}
          />
        )}
      </MapView>
    </View>
  );
};

export default OrderBookingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
