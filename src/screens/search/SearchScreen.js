import { StyleSheet, Text, View, BackHandler, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, TextInput, FlatList, PermissionsAndroid, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '~/components/Header';
import { NavigationContext, useNavigation } from '@react-navigation/native';
import { GOOGLE_MAPS_APIKEY, removeAccents, responsiveFontSizeOS, responsiveSizeOS, SCREEN_WIDTH } from '~/helper/GeneralMain';
import FastImage from 'react-native-fast-image';
import getDirections from 'react-native-google-maps-directions';
import { Footer } from '~/components/Footer';
import { locationData } from '~/data';
import LayoutView from '~/components/LayoutView';
import SCREENS from '~/constant/screens';
import images from '~/themes/images';
import Fonts from '~/themes/Fonts';
import Colors from '~/themes/colors';

const SearchScreen = (props) => {
  const { currentPosition } = props?.route?.params ?? {};
  console.log('Test now: ', JSON.stringify(currentPosition));
  const navigation = React.useContext(NavigationContext);
  const [findWord, setFindWord] = useState(null);
  const [findWordInputSource, setFindWordInputSource] = useState(null);
  const [findWordInputDestanation, setFindWordInputDestanation] = useState(null);
  const [locationList, setLocationList] = useState(locationData ?? []);
  const [locationListInputSource, setLocationListInputSource] = useState(locationData ?? []);
  const [locationListInputDestination, setLocationListInputDestination] = useState(locationData ?? []);
  const [locationType, setLocationType] = useState(searchType.CURRENT);
  const [currentSource, setCurrentSource] = useState(currentPosition);
  const [currentSourceName, setCurrentSourceName] = useState(null);
  const [currentSourceFirst, setCurrentSourceFirst] = useState(null);
  const [currentSourceclear, setCurrentSourceClear] = useState(null);
  const [currentDestination, setCurrentDestination] = useState(null);
  const [currentDestinationName, setCurrentDestinationName] = useState(null);
  const [currentDestinationFirst, setCurrentDestinationFirst] = useState(null);
  const [currentDestinationClear, setCurrentDestinationClear] = useState(null);
  const [inputSource, setInputSource] = useState(null);
  const [inputSourceName, setInputSourceName] = useState(null);
  const [inputSourceFirst, setInputSourceFirst] = useState(null);
  const [InputSourceclear, setInputSourceClear] = useState(null);
  const [inputDestination, setInputDestination] = useState(null);
  const [inputDestinationName, setInputDestinationName] = useState(null);
  const [inputDestinationFirst, setInputDestinationFirst] = useState(null);
  const [inputDestinationClear, setInputDestinationClear] = useState(null);
  const [isSubmit, setCheckSubmit] = useState(false);

  const [searchResults, setSearchResults] = useState([]);

  // Gọi hàm yêu cầu quyền khi component được mounted
  useEffect(() => {
    requestLocationPermission();
  }, []);

  /**
   * Vấn đề: locationType ?
   * currentSource ?
   * currentDestination ?
   */
  useEffect(() => {
    if (locationType === searchType.CURRENT) {
      currentSource && currentDestination ? setCheckSubmit(true) : setCheckSubmit(false);
    } else if (locationType === searchType.INPUT) {
      inputSource && inputDestination ? setCheckSubmit(true) : setCheckSubmit(false);
    }
  }, [locationType, currentDestination, inputSource, inputDestination]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', preventGoBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', preventGoBack);
    };
  }, []);

  const handleClear = (type) => () => {
    switch (type) {
      case paramType.currentDestination:
        setFindWord(null);
        setLocationList(locationData);
        break;
      case paramType.inputSource:
        setFindWordInputSource(null);
        setLocationListInputSource(locationData);
        break;
      case paramType.inputDestination:
        setFindWordInputDestanation(null);
        setLocationListInputDestination(locationData);
        break;
      default:
        break;
    }
  };

  const handleFindLocation = (text, type) => {
    const searchWord = removeAccents(text?.trim()?.toLowerCase());
    const filterData = locationData.filter((item) => removeAccents(item.text.toLowerCase()).includes(searchWord));
    switch (type) {
      case paramType.currentDestination:
        setLocationList(filterData);
        setFindWord(text);
        break;
      case paramType.inputSource:
        setLocationListInputSource(filterData);
        setFindWordInputSource(text);
        break;
      case paramType.inputDestination:
        setLocationListInputDestination(filterData);
        setFindWordInputDestanation(text);
        break;
      default:
        break;
    }
  };

  const handleBooking = (item, type) => () => {
    switch (type) {
      case paramType.currentSource:
        setCurrentSourceName(item?.text);
        setCurrentSource(item);
        break;
      case paramType.currentDestination:
        setCurrentDestinationName(item?.text);
        setFindWord(item?.text);
        setCurrentDestination(item);
        break;
      case paramType.inputSource:
        setInputSourceName(item?.text);
        setFindWordInputSource(item?.text);
        setInputSource(item);
        break;
      case paramType.inputDestination:
        setInputDestinationName(item?.text);
        setFindWordInputDestanation(item?.text);
        setInputDestination(item);
        break;
      default:
        break;
    }
  };

  const handleSearch = () => {
    navigation.navigate(SCREENS.BOOKING_SCREEN, { searchLocation: { locationType, currentSource, currentDestination, inputSource, inputDestination } });
  };

  const preventGoBack = () => {
    navigation.goBack();
    return true;
  };

  const handleSelectLocation = (type) => () => {
    setLocationType(type);
  };

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
   * Phân luồng tìm địa điểm
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

  const handleInputFocus = (key) => () => {
    switch (key) {
      case paramType.currentSource:
        setCurrentSourceClear(true);
        setCurrentSourceFirst(true);
        break;
      case paramType.currentDestination:
        setCurrentDestinationClear(true);
        setCurrentDestinationFirst(true);
        break;
      case paramType.inputSource:
        setInputSourceClear(true);
        setInputSourceFirst(true);
        break;
      case paramType.inputDestination:
        setInputDestinationClear(true);
        setInputDestinationFirst(true);
        break;
      default:
        break;
    }
  };

  const handleInputBlur = (key) => () => {
    switch (key) {
      case paramType.currentSource:
        setCurrentSourceClear(false);
        setCurrentSourceFirst(false);
        break;
      case paramType.currentDestination:
        setCurrentDestinationClear(false);
        setCurrentDestinationFirst(false);
        break;
      case paramType.inputSource:
        setInputSourceClear(false);
        setInputSourceFirst(false);
        break;
      case paramType.inputDestination:
        setInputDestinationClear(false);
        setInputDestinationFirst(false);
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

  const handleGoogleSearch = async (text) => {
    setFindWordInputSource(text);
    if (text.length > 0) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_MAPS_APIKEY}&language=vi`;
        const response = await fetch(url);
        const json = await response.json();
        setSearchResults(json.predictions);
        // Có thể bạn muốn làm gì đó với kết quả tìm kiếm, ví dụ hiển thị trong một FlatList
        console.log('Test search list: ', JSON.stringify(json));
      } catch (error) {
        console.error(error);
      }
    } else {
      setSearchResults([]);
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
        // Tại đây bạn có thể làm gì đó với thông tin vị trí, ví dụ lưu trữ nó hoặc hiển thị trên bản đồ
      } else {
        console.error('Error fetching place details:', json.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  console.log('Test searchResults: ', JSON.stringify(searchResults));

  console.log('Test locationList: ', JSON.stringify(locationList));

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
            value={findWord}
            onChangeText={handleGoogleSearch}
            // onChangeText={(text) => handleFindLocation(text, paramType.currentDestination)}
            style={styles.viewInputText}
            placeholder="Tìm kiếm điểm đến"
            autoCorrect={false}
            keyboardType={'default'}
          />
          <TouchableOpacity onPress={handleClear(paramType.currentDestination)} style={styles.viewClose}>
            <FastImage source={images.iconClose} style={styles.imgClose} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        {findWord ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => item.place_id || index.toString()}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.itemText}>{item.description}</Text>
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
        )}
      </>
    );
  };

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
            value={findWordInputDestanation}
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
        {inputSourceFirst ? (
          <FlatList
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            data={locationListInputSource}
            removeClippedSubviews={true}
            renderItem={({ item, index }) => viewItemLocation(item, paramType.inputSource)}
            keyExtractor={(item, index) => index.toString()}
            onEndReachedThreshold={0.5}
            numColumns={2}
            style={styles.locationList}
          />
        ) : null}
        {inputDestinationFirst ? (
          <FlatList
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            data={locationListInputDestination}
            removeClippedSubviews={true}
            renderItem={({ item, index }) => viewItemLocation(item, paramType.inputDestination)}
            keyExtractor={(item, index) => index.toString()}
            onEndReachedThreshold={0.5}
            numColumns={2}
            style={styles.locationList}
          />
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
    backgroundColor: 'rgb(138,43,226)',
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
    backgroundColor: '#610899',
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
    backgroundColor: '#7A0BC0',
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
