import { StyleSheet, Text, View, BackHandler, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, TextInput, FlatList, PermissionsAndroid, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '~/components/Header';
import { NavigationContext, useNavigation } from '@react-navigation/native';
import { GOOGLE_MAPS_APIKEY, isEmptyArr, isEmptyObj, removeAccents, responsiveFontSizeOS, responsiveSizeOS, SCREEN_WIDTH } from '~/helper/GeneralMain';
import FastImage from 'react-native-fast-image';
import { Footer } from '~/components/Footer';
import { locationData } from '~/data';
import LayoutView from '~/components/LayoutView';
import SCREENS from '~/constant/screens';
import images from '~/themes/images';
import Fonts from '~/themes/Fonts';
import Colors from '~/themes/colors';

const SearchScreen = (props) => {
  const { currentPosition } = props?.route?.params ?? {};
  const navigation = React.useContext(NavigationContext);

  const [findWordDestination, setFindWordDestination] = useState(null);
  const [findWordInputSource, setFindWordInputSource] = useState(null);
  const [findWordInputDestination, setFindWordInputDestination] = useState(null);
  const [searchCurrentResults, setSearchCurrentResults] = useState([]);
  const [searchInputSourceResults, setSearchInputSourceResults] = useState([]);
  const [searchInputDestinationResults, setSearchInputDestinationResults] = useState([]);

  const [locationList, setLocationList] = useState(locationData ?? []);
  const [locationListInputSource, setLocationListInputSource] = useState(locationData ?? []);
  const [locationListInputDestination, setLocationListInputDestination] = useState(locationData ?? []);
  const [locationType, setLocationType] = useState(searchType.CURRENT);
  const [currentSource, setCurrentSource] = useState(currentPosition);
  console.log('Test 5 currentSource: ', JSON.stringify(currentSource));
  const [currentDestination, setCurrentDestination] = useState(null);
  const [currentDestinationFocus, setCurrentDestinationFocus] = useState(true);
  const [inputSource, setInputSource] = useState(null);
  console.log('Test 5 inputSource: ', JSON.stringify(inputSource));
  const [inputSourceFocus, setInputSourceFocus] = useState(true);
  const [inputDestination, setInputDestination] = useState(null);
  console.log('Test 5 inputDestination: ', JSON.stringify(inputSource));
  const [inputDestinationFocus, setInputDestinationFocus] = useState(false);
  const [isSubmit, setCheckSubmit] = useState(false);

  // Gọi hàm yêu cầu quyền khi component được mounted
  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (!isEmptyObj(currentPosition)) {
      setCurrentSource(currentPosition);
    }
  }, [currentPosition]);

  useEffect(() => {
    if (locationType === searchType.CURRENT) {
      currentSource && currentDestination ? setCheckSubmit(true) : setCheckSubmit(false);
    } else if (locationType === searchType.INPUT) {
      inputSource && inputDestination ? setCheckSubmit(true) : setCheckSubmit(false);
    }
  }, [locationType, currentDestination, inputSource, inputDestination]);

  /**
   * Hàm handle nút back vật lý
   */
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', preventGoBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', preventGoBack);
    };
  }, []);

  /**
   * Hàm clear text
   * @param {*} type
   * @returns
   */
  const handleClear = (type) => () => {
    switch (type) {
      case paramType.currentDestination:
        setFindWordDestination(null);
        setLocationList(locationData);
        break;
      case paramType.inputSource:
        setFindWordInputSource(null);
        setLocationListInputSource(locationData);
        break;
      case paramType.inputDestination:
        setFindWordInputDestination(null);
        setLocationListInputDestination(locationData);
        break;
      default:
        break;
    }
  };

  /**
   * Hàm tìm kiếm dữ liệu get san
   * @param {*} text
   * @param {*} type
   */
  const handleFindLocation = (text, type) => {
    const searchWord = removeAccents(text?.trim()?.toLowerCase());
    const filterData = locationData.filter((item) => removeAccents(item.text.toLowerCase()).includes(searchWord));
    switch (type) {
      case paramType.currentDestination:
        setLocationList(filterData);
        setFindWordDestination(text);
        break;
      case paramType.inputSource:
        setLocationListInputSource(filterData);
        setFindWordInputSource(text);
        break;
      case paramType.inputDestination:
        setLocationListInputDestination(filterData);
        setFindWordInputDestination(text);
        break;
      default:
        break;
    }
  };

  /**
   * Hàm xử lý booking
   * @param {*} item
   * @param {*} type
   * @returns
   */
  const handleBooking = (item, type) => () => {
    console.log('Test 10 item map: ', JSON.stringify(item));
    switch (type) {
      case paramType.currentSource:
        break;
      case paramType.currentDestination:
        setFindWordDestination(item?.text);
        setCurrentDestination(item);
        break;
      case paramType.inputSource:
        setFindWordInputSource(item?.text);
        setInputSource(item);
        break;
      case paramType.inputDestination:
        setFindWordInputDestination(item?.text);
        setInputDestination(item);
        break;
      default:
        break;
    }
  };

  /**
   * Mở giao diện booking trên map
   */
  const handleSearch = () => {
    let directionData = {};
    switch (locationType) {
      case searchType.CURRENT:
        directionData = {
          fromLocation: currentSource?.coords,
          toLocation: currentDestination?.location,
        };
        break;
      case searchType.INPUT:
        directionData = {
          fromLocation: inputSource?.location,
          toLocation: inputDestination?.location,
          origin: inputSource?.desc,
          destination: inputDestination?.desc,
        };
        break;
      default:
        return;
    }

    navigation.navigate(SCREENS.ORDER_BOOKING_SCREEN, { directionData });
  };

  /**
   * Hàm go back
   * @returns
   */
  const preventGoBack = () => {
    navigation.goBack();
    return true;
  };

  /**
   * Hàm chuyển đổi Tab
   * @param {*} type
   * @returns
   */
  const handleSelectLocation = (type) => () => {
    setLocationType(type);
  };

  /**
   * Giao diện chi tiết của một địa điểm
   * @param {*} item
   * @param {*} type
   * @returns
   */
  const viewItemLocation = (item, type) => {
    console.log('Test item desc: ', JSON.stringify(item));
    return (
      <>
        <TouchableOpacity style={styles.btnLocationItem} onPress={handleBooking(item, type)}>
          <Text style={styles.txtLocationItem}>{item?.text}</Text>
          <Text style={styles.txtLocationDesc} numberOfLines={1} ellipsizeMode="tail">
            {item?.desc}
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  /**
   * Phân luồng tìm địa điểm (view)
   * @param {*} locationType
   * @returns
   */
  const viewFlowExpand = (locationType) => {
    switch (locationType) {
      case searchType.CURRENT:
        return viewCurrentLocation();
      case searchType.INPUT:
        return viewInputLocation();
      default:
        return null;
    }
  };

  /**
   * Hàm focust textinput
   * @param {*} key
   * @returns
   */
  const handleInputFocus = (key) => () => {
    switch (key) {
      case paramType.currentSource:
        break;
      case paramType.currentDestination:
        setCurrentDestinationFocus(true);
        break;
      case paramType.inputSource:
        setInputSourceFocus(true);
        break;
      case paramType.inputDestination:
        setInputDestinationFocus(true);
        break;
      default:
        break;
    }
  };

  /**
   * Hàm blur textinput
   * @param {*} key
   * @returns
   */
  const handleInputBlur = (key) => () => {
    switch (key) {
      case paramType.currentSource:
        break;
      case paramType.currentDestination:
        setCurrentDestinationFocus(false);
        break;
      case paramType.inputSource:
        setInputSourceFocus(false);
        break;
      case paramType.inputDestination:
        setInputDestinationFocus(false);
        break;
      default:
        break;
    }
  };

  /**
   * Bổ sung đoạn mã yêu cầu quyền truy cập vị trí
   */
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
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

  /**
   * Hàm api search google map
   * @param {*} text
   */
  const handleGoogleSearch = async (text, type) => {
    let textResult;
    switch (type) {
      case paramType.currentDestination:
        setFindWordDestination(text);
        textResult = await getApiPlaceMap(text);
        console.log('Test textResult map google: ', JSON.stringify(textResult));
        setSearchCurrentResults(textResult);
        textResult?.length === 0 ? handleFindLocation(text, type) : null;
        break;
      case paramType.inputSource:
        setFindWordInputSource(text);
        textResult = await getApiPlaceMap(text);
        setSearchInputSourceResults(textResult);
        textResult?.length === 0 ? handleFindLocation(text, type) : null;
        break;
      case paramType.inputDestination:
        setFindWordInputDestination(text);
        textResult = await getApiPlaceMap(text);
        setSearchInputDestinationResults(textResult);
        textResult?.length === 0 ? handleFindLocation(text, type) : null;
        break;
      default:
        break;
    }
  };

  const getApiPlaceMap = async (text) => {
    if (text.length > 0) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_MAPS_APIKEY}&language=vi`;
        const response = await fetch(url);
        const json = await response.json();
        return json.predictions;
      } catch (error) {
        console.error(error);
      }
    } else {
      return [];
    }
  };

  const handlePlaceDetails = async (placeId) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_MAPS_APIKEY}`;
      const response = await fetch(url);
      const json = await response.json();

      if (json.status === 'OK') {
        const location = json.result.geometry.location;
        console.log('Location details: ', location);
        return location;
      } else {
        console.error('Error fetching place details:', json.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePlaceId = (item, type) => async () => {
    const location = await handlePlaceDetails(item.place_id);
    const finalObject = {
      text: item.structured_formatting.main_text,
      desc: item.description,
      location: {
        latitude: location.lat,
        longitude: location.lng,
      },
      country: item.terms[item.terms.length - 1].value,
    };
    console.log('Test 100 finalObject: ', JSON.stringify(finalObject));
    switch (type) {
      case paramType.currentDestination:
        setFindWordDestination(finalObject?.text);
        setCurrentDestination(finalObject);
        break;
      case paramType.inputSource:
        setFindWordInputSource(finalObject?.text);
        setInputSource(finalObject);
        break;
      case paramType.inputDestination:
        setFindWordInputDestination(finalObject?.text);
        setInputDestination(finalObject);
        break;
      default:
        break;
    }
  };

  console.log('Test currentDestinationFocus: ', currentDestinationFocus);

  /**
   * Flow cho vị trí hiện tại
   * @returns
   */
  const viewCurrentLocation = () => {
    return (
      <>
        <View style={[styles.viewSearch]}>
          <TouchableOpacity style={styles.btnSearch}>
            <FastImage source={images.icSearch} style={styles.imgSearch} resizeMode="contain" />
          </TouchableOpacity>
          <TextInput
            value={findWordDestination}
            onFocus={handleInputFocus(paramType.currentDestination)}
            onBlur={handleInputBlur(paramType.currentDestination)}
            onChangeText={(text) => handleGoogleSearch(text, paramType.currentDestination)}
            style={styles.viewInputText}
            placeholder="Tìm kiếm điểm đến"
            autoCorrect={false}
            keyboardType={'default'}
          />
          <TouchableOpacity onPress={handleClear(paramType.currentDestination)} style={styles.viewClose}>
            <FastImage source={images.iconClose} style={styles.imgClose} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        {currentDestinationFocus ? (
          findWordDestination && searchCurrentResults.length > 0 ? (
            <FlatList
              data={searchCurrentResults}
              keyExtractor={(item, index) => item.place_id || index.toString()}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <TouchableOpacity onPress={handlePlaceId(item, paramType.currentDestination)}>
                    <Text style={styles.itemText}>{item.description}</Text>
                  </TouchableOpacity>
                </View>
              )}
              numColumns={1}
            />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              data={locationList}
              removeClippedSubviews={true}
              renderItem={({ item, index }) => viewItemLocation(item, paramType.currentDestination)}
              keyExtractor={(item, index) => index.toString()}
              onEndReachedThreshold={0.5}
              numColumns={1}
              style={styles.locationList}
            />
          )
        ) : null}
      </>
    );
  };

  console.log('Test findWordInputDestination: ', findWordInputDestination);

  /**
   * Luồng cho vị trí A, B
   * @returns
   */
  const viewInputLocation = () => {
    return (
      <>
        <View style={[styles.viewSearch]}>
          <TouchableOpacity style={styles.btnSearch}>
            <FastImage source={images.icSearch} style={styles.imgSearch} resizeMode="contain" />
          </TouchableOpacity>
          <TextInput
            value={findWordInputSource}
            onFocus={handleInputFocus(paramType.inputSource)}
            onBlur={handleInputBlur(paramType.inputSource)}
            onChangeText={(text) => handleFindLocation(text, paramType.inputSource)}
            style={styles.viewInputText}
            placeholder="Tìm kiếm điểm đón"
            autoCorrect={false}
            keyboardType={'default'}
          />
          <TouchableOpacity onPress={handleClear(paramType.inputSource)} style={styles.viewClose}>
            <FastImage source={images.iconClose} style={styles.imgClose} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        <View style={[styles.viewSearch]}>
          <TouchableOpacity style={styles.btnSearch}>
            <FastImage source={images.icSearch} style={styles.imgSearch} resizeMode="contain" />
          </TouchableOpacity>
          <TextInput
            value={findWordInputDestination}
            onFocus={handleInputFocus(paramType.inputDestination)}
            onBlur={handleInputBlur(paramType.inputDestination)}
            onChangeText={(text) => handleFindLocation(text, paramType.inputDestination)}
            style={styles.viewInputText}
            placeholder="Tìm kiếm điểm đến"
            autoCorrect={false}
            keyboardType={'default'}
          />
          <TouchableOpacity onPress={handleClear(paramType.inputDestination)} style={styles.viewClose}>
            <FastImage source={images.iconClose} style={styles.imgClose} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        {inputSourceFocus ? (
          findWordInputSource && searchInputSourceResults.length > 0 ? (
            <FlatList
              data={searchInputSourceResults}
              keyExtractor={(item, index) => item.place_id || index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={handlePlaceId(item, paramType.inputSource)}>
                  <Text style={styles.itemText}>{item.description}</Text>
                </TouchableOpacity>
              )}
              numColumns={1}
            />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              data={locationListInputSource}
              removeClippedSubviews={true}
              renderItem={({ item, index }) => viewItemLocation(item, paramType.inputSource)}
              keyExtractor={(item, index) => index.toString()}
              onEndReachedThreshold={0.5}
              numColumns={1}
              style={styles.locationList}
            />
          )
        ) : null}
        {inputDestinationFocus ? (
          findWordInputDestination && searchInputDestinationResults.length > 0 ? (
            <FlatList
              data={searchInputDestinationResults}
              keyExtractor={(item, index) => item.place_id || index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={handlePlaceId(item, paramType.inputDestination)}>
                  <Text style={styles.itemText}>{item.description}</Text>
                </TouchableOpacity>
              )}
              numColumns={1}
            />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              data={locationListInputDestination}
              removeClippedSubviews={true}
              renderItem={({ item, index }) => viewItemLocation(item, paramType.inputDestination)}
              keyExtractor={(item, index) => index.toString()}
              onEndReachedThreshold={0.5}
              numColumns={1}
              style={styles.locationList}
            />
          )
        ) : null}
      </>
    );
  };

  /**
   * Giao diện main
   */
  return (
    <LayoutView>
      <Header barStyle="dark-content" title={'Tìm kiếm'} onPressLeft={preventGoBack} />
      <SafeAreaView style={styles.container}>
        <View style={styles.viewContent}>
          <View style={styles.viewSelectLocation}>
            <TouchableOpacity style={[styles.btnSelectLocation, locationType === searchType.CURRENT ? styles.btnSelectLocationEnable : null]} onPress={handleSelectLocation(searchType.CURRENT)}>
              <Text style={[styles.txtSelectService, locationType === searchType.CURRENT ? styles.txtSelectServiceEnable : null]}>Vị trí hiện tại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnSelectLocation, locationType === searchType.INPUT ? styles.btnSelectLocationEnable : null]} onPress={handleSelectLocation(searchType.INPUT)}>
              <Text style={[styles.txtSelectService, locationType === searchType.INPUT ? styles.txtSelectServiceEnable : null]}>Vị trí khác</Text>
            </TouchableOpacity>
          </View>
          {viewFlowExpand(locationType)}
        </View>
        <Footer disableShadown backgroundColor="white">
          <TouchableOpacity style={[[styles.viewInputButton, !isSubmit ? styles.viewInputButton_Disabled : null]]} disabled={isSubmit ? false : true} onPress={handleSearch}>
            <Text style={styles.txtSubmit}>TÌM KIẾM</Text>
          </TouchableOpacity>
        </Footer>
      </SafeAreaView>
    </LayoutView>
  );
};

export default SearchScreen;

export const searchType = {
  CURRENT: 1,
  INPUT: 2,
};

const paramType = {
  currentSource: 'currentSource',
  currentDestination: 'currentDestination',
  inputSource: 'inputSource',
  inputDestination: 'inputDestination',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentScrollView: {
    paddingBottom: responsiveSizeOS(50),
    paddingHorizontal: responsiveSizeOS(15),
  },
  viewContent: {
    flex: 1,
    backgroundColor: 'white',
    width: SCREEN_WIDTH,
    borderTopLeftRadius: responsiveSizeOS(20),
    borderTopRightRadius: responsiveSizeOS(20),
    paddingTop: responsiveSizeOS(4),
    paddingHorizontal: responsiveSizeOS(15),
  },
  viewSearch: {
    height: responsiveSizeOS(40),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderWidth: responsiveSizeOS(0.5),
    borderColor: 'rgb(203, 203, 203)',
    borderRadius: responsiveSizeOS(10),
    paddingHorizontal: responsiveSizeOS(10),
    marginBottom: responsiveSizeOS(16),
    width: '98%',
  },
  btnSearch: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgSearch: {
    width: responsiveSizeOS(16),
    height: responsiveSizeOS(16),
    resizeMode: 'contain',
  },
  viewInputText: {
    height: responsiveSizeOS(40),
    fontSize: responsiveFontSizeOS(16),
    fontFamily: Fonts.Regular,
    color: 'rgb(11, 11, 11)',
    marginLeft: responsiveSizeOS(8),
    textAlign: 'left',
    width: '85%',
    paddingVertical: responsiveSizeOS(1),
  },
  viewClose: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgClose: {
    width: responsiveSizeOS(24),
    height: responsiveSizeOS(24),
    resizeMode: 'contain',
  },
  locationList: {
    flex: 1,
    width: '100%',
    // width: '98%',
    // paddingHorizontal: responsiveSizeOS(5),
  },
  btnLocationItem: {
    paddingHorizontal: responsiveSizeOS(10),
    paddingVertical: responsiveSizeOS(5),
    // borderRadius: responsiveSizeOS(8),
    // borderWidth: responsiveSizeOS(1),
    // borderColor: 'black',
    marginRight: responsiveSizeOS(15),
    marginVertical: responsiveSizeOS(5),
  },
  txtLocationItem: {
    fontSize: responsiveFontSizeOS(14),
    fontFamily: Fonts.Regular,
  },
  txtLocationDesc: {
    color: Colors.txtGrayDesc,
    fontSize: responsiveFontSizeOS(14),
    fontFamily: Fonts.Regular,
  },
  viewSelectLocation: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: responsiveSizeOS(10),
    marginBottom: responsiveSizeOS(15),
  },
  btnSelectLocation: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsiveSizeOS(16),
    height: responsiveSizeOS(32),
    paddingHorizontal: responsiveSizeOS(16),
  },
  btnSelectLocationEnable: {
    backgroundColor: Colors.btnSubmit,
  },
  txtSelectService: {
    fontSize: responsiveFontSizeOS(16),
    fontFamily: Fonts.SemiBold,
    color: 'rgb(11, 11, 11)',
  },
  txtSelectServiceEnable: {
    color: 'white',
  },
  viewInputButton: {
    bottom: 0,
    backgroundColor: Colors.btnSubmit,
    borderRadius: responsiveSizeOS(15),
    justifyContent: 'center',
    alignItems: 'center',
    height: responsiveSizeOS(45),
    width: SCREEN_WIDTH - responsiveSizeOS(30),
    marginBottom: responsiveSizeOS(12),
    alignSelf: 'center',
    marginTop: responsiveSizeOS(10),
  },
  viewInputButton_Disabled: {
    backgroundColor: Colors.bgGrayD,
  },
  txtSubmit: {
    fontSize: responsiveFontSizeOS(16),
    color: 'white',
    fontFamily: Fonts.Bold,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
  },
});
