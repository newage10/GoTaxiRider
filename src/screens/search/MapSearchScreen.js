import React from 'react';
import { Text, View, PermissionsAndroid, Platform } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_APIKEY } from '~/helper/GeneralMain';

const MapSearchScreen = () => {
  // Hàm này sẽ được gọi khi người dùng chọn một địa điểm từ danh sách gợi ý
  const handleSelect = (data, details = null) => {
    // 'details' là một đối tượng chứa thông tin chi tiết của địa điểm, nhưng chỉ khi fetchDetails = true
    console.log(data);
    console.log(details);
  };

  // Bổ sung đoạn mã yêu cầu quyền truy cập vị trí
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      // Quyền truy cập vị trí trên iOS sẽ được yêu cầu thông qua plist
      // Và bạn có thể sử dụng react-native-permissions để yêu cầu tại đây
      console.log('iOS location permission request would go here');
    } else {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: 'Location Permission',
          message: 'This app needs access to your location for the search functionality.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
        } else {
          console.log('Location permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Gọi hàm yêu cầu quyền khi component được mounted
  React.useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <GooglePlacesAutocomplete
      currentLocation={false} // Cho phép sử dụng vị trí hiện tại
      currentLocationLabel="Vị trí hiện tại" // Label cho nút vị trí hiện tại
      debounce={200} // Độ trễ là 200ms giữa các yêu cầu
      disableScroll={false} // Không vô hiệu hóa việc cuộn danh sách
      enableHighAccuracyLocation={false} // Không yêu cầu vị trí GPS chính xác cao
      enablePoweredByContainer={false} // Không hiển thị "Powered by Google"
      fetchDetails={true} // Lấy thông tin chi tiết về địa điểm được chọn
      GooglePlacesDetailsQuery={{ fields: 'formatted_address' }} // Ví dụ về truy vấn chi tiết
      GooglePlacesSearchQuery={{ rankby: 'distance', type: 'cafe' }} // Tìm kiếm quán cafe gần nhất
      keepResultsAfterBlur={true} // Giữ kết quả sau khi input mất focus
      keyboardShouldPersistTaps="handled" // Bàn phím không tự động ẩn sau khi chạm
      listEmptyComponent={() => <Text>Không tìm thấy kết quả</Text>} // Component hiển thị khi không có kết quả
      listViewDisplayed="auto" // Tự động quản lý hiển thị danh sách
      minLength={1} // Số ký tự tối thiểu để bắt đầu tìm kiếm
      nearbyPlacesAPI="GooglePlacesSearch" // Sử dụng API tìm kiếm địa điểm gần đó
      onPress={(data, details = null) => {
        // xử lý khi địa điểm được chọn
      }}
      placeholder="Tìm kiếm địa điểm" // Text hiển thị khi input trống
      predefinedPlacesAlwaysVisible={true} // Hiển thị các địa điểm xác định trước luôn hiển thị
      query={{
        key: GOOGLE_MAPS_APIKEY,
        language: 'vi', // Ngôn ngữ cho kết quả tìm kiếm
      }}
      renderRow={(data) => (
        <View>
          <Text>{data.description}</Text>
        </View>
      )} // Custom hiển thị hàng trong danh sách
      styles={{
        // textInputContainer: {
        //   backgroundColor: 'rgb(255, 255, 255)', // màu nền giống như viewSearch
        //   // height: responsiveSizeOS(40), // chiều cao giống như viewSearch
        //   width: '100%', // Lấy chiều rộng tối đa
        //   paddingHorizontal: responsiveSizeOS(10),
        // },
        textInputContainer: {
          backgroundColor: 'rgb(255, 255, 255)', // Đặt màu nền của container chứa TextInput
          // height: responsiveSizeOS(40), // Đặt chiều cao như trong styles.viewSearch
          // borderRadius: responsiveSizeOS(10), // Đặt borderRadius như trong styles.viewSearch
          // Các styles khác giống như trong styles.viewSearch của bạn
        },
        textInput: {
          marginLeft: 0, // loại bỏ lề mặc định nếu có
          marginRight: 0, // loại bỏ lề mặc định nếu có
          height: '100%', // chiều cao giống như container
          // Thêm bất kỳ styles nào khác cần thiết cho text input
        },
        // Bạn có thể cần tùy chỉnh các styles khác cho list, separator, v.v.
        // listView: {
        //   // Nếu bạn muốn tùy chỉnh style cho danh sách kết quả gợi ý
        //   backgroundColor: 'white', // Màu nền cho danh sách gợi ý
        //   marginTop: 10, // Khoảng cách từ GooglePlacesAutocomplete
        //   borderBottomLeftRadius: 8, // Bo góc dưới bên trái
        //   borderBottomRightRadius: 8, // Bo góc dưới bên phải
        //   borderColor: '#cccccc', // Màu viền của danh sách
        //   borderWidth: 1, // Độ rộng viền
        //   shadowColor: '#000000', // Màu bóng
        //   shadowRadius: 5, // Bán kính bóng
        //   shadowOpacity: 0.1, // Độ trong suốt của bóng
        //   elevation: 3, // Độ cao (đối với Android)
        //   marginHorizontal: 10, // Khoảng cách ngang từ cạnh màn hình
        //   zIndex: 5, // Đảm bảo listView không bị che khuất bởi các phần tử khác
        // },
        listView: {
          // height: 500,
          backgroundColor: 'blue', // Màu nền xanh dương cho danh sách gợi ý
          borderColor: 'blue', // Đặt màu viền giống màu nền
          borderWidth: 1,
          marginHorizontal: 0, // Đặt margin ngang là 0 để listView phù hợp với viewSearch
          borderTopWidth: 0, // Loại bỏ viền trên cùng nếu bạn không muốn có đường phân cách
          // Thêm shadow hoặc elevation nếu bạn muốn listView có độ nổi
          shadowColor: '#000000',
          shadowRadius: 4,
          shadowOpacity: 0.5,
          elevation: 4,
          // Điều chỉnh các khoảng cách và padding nếu cần
        },
        predefinedPlacesDescription: {
          // Styles cho các địa điểm được xác định trước
        },
        // ...các styles khác nếu cần
      }}
      // textInputProps={{
      //   autoCapitalize: 'none',
      //   autoCorrect: false,
      // }} // Props cho input text
      timeout={30000} // Timeout cho yêu cầu là 30 giây
    />
    // <GooglePlacesAutocomplete
    //   currentLocation={false} // Cho phép sử dụng vị trí hiện tại
    //   currentLocationLabel="Vị trí hiện tại" // Label cho nút vị trí hiện tại
    //   debounce={200} // Độ trễ là 200ms giữa các yêu cầu
    //   disableScroll={false} // Không vô hiệu hóa việc cuộn danh sách
    //   enableHighAccuracyLocation={false} // Không yêu cầu vị trí GPS chính xác cao
    //   enablePoweredByContainer={false} // Không hiển thị "Powered by Google"
    //   fetchDetails={true} // Lấy thông tin chi tiết về địa điểm được chọn
    //   GooglePlacesDetailsQuery={{ fields: 'formatted_address' }} // Ví dụ về truy vấn chi tiết
    //   GooglePlacesSearchQuery={{ rankby: 'distance', type: 'cafe' }} // Tìm kiếm quán cafe gần nhất
    //   keepResultsAfterBlur={true} // Giữ kết quả sau khi input mất focus
    //   keyboardShouldPersistTaps="handled" // Bàn phím không tự động ẩn sau khi chạm
    //   listEmptyComponent={() => <Text>Không tìm thấy kết quả</Text>} // Component hiển thị khi không có kết quả
    //   listViewDisplayed="auto" // Tự động quản lý hiển thị danh sách
    //   minLength={3} // Số ký tự tối thiểu để bắt đầu tìm kiếm
    //   nearbyPlacesAPI="GooglePlacesSearch" // Sử dụng API tìm kiếm địa điểm gần đó
    //   onPress={(data, details = null) => {
    //     // xử lý khi địa điểm được chọn
    //   }}
    //   placeholder="Tìm kiếm địa điểm" // Text hiển thị khi input trống
    //   predefinedPlacesAlwaysVisible={true} // Hiển thị các địa điểm xác định trước luôn hiển thị
    //   query={{
    //     key: 'AIzaSyBv_3P3yNTVYWvi3fdSENaTV-jJ1XzWWAw',
    //     language: 'vi', // Ngôn ngữ cho kết quả tìm kiếm
    //   }}
    //   renderRow={(data) => (
    //     <View>
    //       <Text>{data.description}</Text>
    //     </View>
    //   )} // Custom hiển thị hàng trong danh sách
    //   styles={{
    //     textInputContainer: {
    //       backgroundColor: 'grey',
    //     },
    //     textInput: {
    //       height: 38,
    //       color: '#5d5d5d',
    //       fontSize: 16,
    //     },
    //   }} // Custom styles
    //   textInputProps={{
    //     autoCapitalize: 'none',
    //     autoCorrect: false,
    //   }} // Props cho input text
    //   timeout={30000} // Timeout cho yêu cầu là 30 giây
    // />
  );
};

export default MapSearchScreen;
