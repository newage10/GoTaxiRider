import { Alert, Platform, StyleSheet, Text, View, BackHandler } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsLocation } from '~/constant/content';
import { GOOGLE_MAPS_APIKEY, LATITUDE_DELTA, LONGITUDE_DELTA, getBookingTime, isEmptyObj, isEmptyParam, screenHeight, screenWidth } from '~/helper/GeneralMain';
import MapViewDirections from 'react-native-maps-directions';
import { check, openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { NavigationContext } from '@react-navigation/native';
import DriverReceiverModal from './DriverReceiverModal';
import useToggleState from '~/hooks/useToggleState';
import SCREENS from '~/constant/screens';
import { bookRide, calculateDistance } from '~/services/apiService';
import { useAppSelector } from '~/configs/hooks';
import socketService from '~/services/socketService';

const OrderBookingScreen = (props) => {
  const { directionData } = props?.route?.params ?? {};
  const navigation = React.useContext(NavigationContext);
  const customerId = useAppSelector((state) => state?.customer?.customerId ?? 10);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [currentLatitude, setCurrentLatitude] = useState(directionData?.fromLocation?.latitude);
  const [currentLongitude, setCurrentLongitude] = useState(directionData?.fromLocation?.longitude);
  const [coordinates, setCoordinates] = useState([]);
  const [bookingVisible, toggleBookingVisible] = useToggleState(false);
  const [bookingData, setBookingData] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [response, setResponse] = useState(null);
  const isSubscribed = useRef(true);
  const [isDriverLocationUpdated, setIsDriverLocationUpdated] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: directionData?.fromLocation?.latitude,
    longitude: directionData?.fromLocation?.longitude,
  });

  const [destinationLocation, setDestinationLocation] = useState({
    latitude: directionData?.toLocation?.latitude,
    longitude: directionData?.toLocation?.longitude,
  });

  const mapView = useRef(null);

  useEffect(() => {
    handlePermissionsLocation();
  }, []);

  useEffect(() => {
    if (!isEmptyObj(bookingData)) {
      toggleBookingVisible();
    }
  }, [bookingData]);

  useEffect(() => {
    if (directionData) {
      // Tạo một mảng mới chứa các tọa độ hiện tại và tọa độ mới từ directionData
      const newCoordinates = [...coordinates, directionData.fromLocation, directionData.toLocation];
      setCoordinates(newCoordinates);
      getDistanceFromAPI(directionData.fromLocation, directionData.toLocation);
    }
  }, [directionData]);

  useEffect(() => {
    // Kết nối khi component mount
    socketService.connect();

    // Thiết lập một timeout để đảm bảo rằng kết nối đã được thiết lập
    const timeoutId = setTimeout(() => {
      const id = socketService.getSocketId();
      setSocketId(id);
    }, 1000); // Chờ 1 giây

    // Dọn dẹp khi component unmount
    return () => {
      clearTimeout(timeoutId); // Hủy timeout nếu component unmount trước khi timeout hoàn thành
      socketService.disconnect(); // Đảm bảo rằng socket được ngắt kết nối
    };
  }, []);

  /**
   * Hàm call api thông tin các cuốc xe
   * @param {*} fromLocation
   * @param {*} toLocation
   */
  const getDistanceFromAPI = async (fromLocation, toLocation) => {
    const distanceData = {
      origin: `${fromLocation.latitude}, ${fromLocation.longitude}`,
      destination: `${toLocation.latitude}, ${toLocation.longitude}`,
    };

    try {
      const response = await calculateDistance(distanceData);

      // Kiểm tra xem phản hồi có status thành công không
      if (response.status) {
        // Phản hồi thành công, lưu dữ liệu vào state
        setBookingData(response);
      } else {
        setBookingData(defaultBooking);
        // Phản hồi không thành công, thông báo lỗi
        // showAlertRetry(fromLocation, toLocation);
      }
    } catch (error) {
      console.log('Error calling distance API: ', error);
      // Thông báo lỗi khi có sự cố với yêu cầu API
      setBookingData(defaultBooking);
      // showAlertRetry(fromLocation, toLocation);
    }
  };

  /**
   * Hàm thông báo get lại api khi bị google map chặn giới hạn limit call
   * @param {*} fromLocation
   * @param {*} toLocation
   */
  const showAlertRetry = (fromLocation, toLocation) => {
    Alert.alert(
      'Thông báo',
      'Không thể lấy thông tin khoảng cách. Tìm kiếm lại ?',
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Tìm kiếm', onPress: () => getDistanceFromAPI(fromLocation, toLocation) },
      ],
      { cancelable: false }
    );
  };

  const handleBooking = async (item) => {
    const { type, name, distance, duration, price, pickupLocation, destination, carType, serviceId } = item ?? {};
    console.log('Dữ liệu đặt chuyến: ', JSON.stringify(item));
    const bookingDetails = {
      data: {
        pickupLocationId: pickupLocation ?? 25,
        destinationId: destination ?? 11,
        bookingWay: 2,
        bookingTime: getBookingTime(),
        customerId: customerId,
        sum: price,
        paymentType: 1,
        paymentStatus: 1,
        note: 'Đến đúng hẹn',
        carType: carType ?? 1,
        serviceId: serviceId ?? 1,
        socketId: socketId,
      },
      bookingId: null,
    };

    try {
      const response = await bookRide(bookingDetails);
      setResponse(response);
    } catch (error) {
      console.log('Booking error: ', error);

      return Alert.alert(
        'Thông báo',
        'Đặt lại chuyến',
        [
          {
            text: 'OK',
            onPress: () => {
              toggleBookingVisible();
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  useEffect(() => {
    // Hàm xử lý dữ liệu vị trí tài xế nhận được từ server
    const handleDriverLocation = (data) => {
      console.log('Thông tin vị trí tài xế nhận từ server: ', JSON.stringify(data));
      const [longitude, latitude] = data?.driver_location ?? [];
      // Cập nhật vị trí hiện tại của tài xế
      console.log('Thông tin kinh độ, vĩ độ: ', longitude, latitude);
      if (longitude !== undefined && latitude !== undefined) {
        setCurrentLocation({ latitude, longitude });
        setIsDriverLocationUpdated(true);
      }
    };

    // Bắt đầu lắng nghe sự kiện vị trí tài xế từ server
    socketService.listenForDriverLocation(handleDriverLocation);

    // Cleanup khi component unmount
    return () => {
      // Dừng lắng nghe sự kiện vị trí tài xế từ server
      socketService.stopListeningForDriverLocation();
    };
  }, []);

  useEffect(() => {
    let intervalId;

    // Hàm lắng nghe tình trạng đặt xe
    const handleBookingStatus = (data) => {
      console.log('Tình trạng chuyến xe: ', JSON.stringify(data));
      const { id, status_description } = data?.status ?? {};
      if (id === 7) {
        Alert.alert('Thông báo', bookingType[id], [{ text: 'OK', onPress: () => navigation.navigate(SCREENS.HOME) }]);
      } else {
        Alert.alert('Thông báo', bookingType[id]);
      }
    };

    console.log('Thông tin tài xế nhận chuyến xe ', JSON.stringify(response));
    // Bắt đầu lắng nghe sự kiện từ server nếu có phản hồi thành công
    if (response && !isEmptyParam(response.bookingId)) {
      intervalId = setInterval(() => {
        socketService.checkLocationDriver(response?.driver_accepted?.id);
      }, 5000);
      const { fullname, phoneNo, Car } = response?.driver_accepted ?? {};
      Alert.alert(
        'Đặt chuyến thành công',
        `Tài xế: ${fullname} \n Số điện thoại: ${phoneNo} \n Hiệu xe: ${Car?.carName}`,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Xác nhận chuyến');
              socketService.listenForBookingStatus(handleBookingStatus);
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        'Thông báo',
        'Đặt lại chuyến',
        [
          {
            text: 'OK',
            onPress: () => {
              toggleBookingVisible();
            },
          },
        ],
        { cancelable: false }
      );
    }

    // Hàm cleanup khi component unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      isSubscribed.current = false;
      socketService.stopListeningForBookingStatus();
    };
  }, [response]);

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
      {!isDriverLocationUpdated ? (
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
      ) : (
        <MapView
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          style={StyleSheet.absoluteFill}
          ref={mapView}
          onPress={onMapPress}
        >
          {/* Marker for the current location */}
          <Marker key={`coordinate_current`} coordinate={currentLocation} title={'Vị trí hiện tại'} />

          {/* Marker for the destination */}
          <Marker key={`coordinate_destination`} coordinate={destinationLocation} title={'Điểm đến'} />
        </MapView>
      )}
      <DriverReceiverModal modalVisible={bookingVisible} toggleModalVisible={toggleBookingVisible} bookingData={bookingData ?? defaultBooking} modalTitle={'Đặt chuyến'} handleBooking={handleBooking} />
    </View>
  );
};

export default OrderBookingScreen;

const defaultBooking = {
  distance: {
    distance: {
      text: '4.8 km',
      value: 4822,
    },
    duration: {
      text: '17 mins',
      value: 1041,
    },
    status: 'OK',
  },
  fare: {
    bike: 30707,
    'bike-plus': 37376,
    car: 65028,
    'car-plus': 78953,
    'car-7seat': 80229,
  },
};

const bookingType = {
  1: 'Đặt chuyến xe',
  2: 'Đang tìm tài xế',
  3: 'Tài xế đã nhận cuốc xe',
  4: 'Tài xế đến nơi đón khách',
  5: 'Đang trên đường đi',
  6: 'Đã đến nơi',
  7: 'Chuyến xe đã hoàn thành',
  8: 'Huỷ',
  10: 'Không có tài xế nhận đơn',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
