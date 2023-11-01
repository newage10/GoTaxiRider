import { BackHandler, Dimensions, SafeAreaView, StyleSheet, Text, View, Alert } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import LayoutView from '~/components/LayoutView';
import Header from '~/components/Header';
import { WebView } from 'react-native-webview';
import { NavigationContext, useNavigation } from '@react-navigation/native';
import { isEmptyObj, responsiveSizeOS, SCREEN_WIDTH } from '~/helper/GeneralMain';
import { searchType } from '../search/SearchScreen';
import DriverReceiverModal from './DriverReceiverModal';
import useToggleState from '~/hooks/useToggleState';
import SCREENS from '~/constant/screens';
import images from '~/themes/images';

const BookingScreen = (props) => {
  const { searchLocation } = props?.route?.params ?? {};
  const navigation = React.useContext(NavigationContext);
  const webviewRef = useRef(null);
  const [bookingVisible, toggleBookingVisible] = useToggleState(false);

  const [linkWebMap, setLinkWebMap] = useState(null);

  useEffect(() => {
    toggleBookingVisible();
  }, []);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', preventGoBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', preventGoBack);
    };
  }, []);

  useEffect(() => {
    if (!isEmptyObj(searchLocation)) {
      const { locationType, currentSource, currentDestination, inputSource, inputDestination } = searchLocation ?? {};
      let linkDireaction;
      switch (locationType) {
        case searchType.CURRENT:
          linkDireaction = `https://www.google.com/maps/dir/${currentSource?.location?.latitude},${currentSource?.location?.longitude}/${currentDestination?.desc}`;
          break;
        case searchType.INPUT:
          linkDireaction = `https://www.google.com/maps/dir/${inputSource?.desc}/${inputDestination?.desc}`;
          break;
        default:
          break;
      }
      setLinkWebMap(linkDireaction);
    }
  }, [searchLocation]);

  const handleBooking = () => {
    const timerId = setTimeout(() => {
      Alert.alert(
        'Thông báo',
        'Hoàn thành chuyến đi',
        [
          { text: 'Không', style: 'cancel' },
          { text: 'Trang chủ', onPress: () => navigation.navigate(SCREENS.HOME_SCREEN) },
        ],
        { cancelable: true }
      );
    }, 5000);
    return () => {
      clearTimeout(timerId);
    };
  };

  const preventGoBack = () => {
    navigation.goBack();
    return true;
  };

  return (
    <>
      <LayoutView>
        <Header barStyle="dark-content" title={'Đặt chuyến'} onPressLeft={preventGoBack} imageRight={images.icDriver} styleRight={styles.imgRight} onPressRight={toggleBookingVisible} />
        <SafeAreaView style={styles.container}>
          <View style={styles.viewContent}>
            <WebView source={{ uri: linkWebMap }} javaScriptEnabled={true} ref={webviewRef} startInLoadingState={true} setSupportMultipleWindows={false} />
          </View>
        </SafeAreaView>
        <DriverReceiverModal modalVisible={bookingVisible} toggleModalVisible={toggleBookingVisible} modalTitle={'Chọn tài xế'} handleBooking={handleBooking} />
      </LayoutView>
    </>
  );
};

export default BookingScreen;

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
    // overflow: 'hidden',
    flex: 1,
    backgroundColor: 'rgb(244,244,244)',
    width: SCREEN_WIDTH,
    borderTopLeftRadius: responsiveSizeOS(20),
    borderTopRightRadius: responsiveSizeOS(20),
  },
  MainContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mapStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainerStyle: {
    padding: 16,
    backgroundColor: '#F3F4F9',
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHandle: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
  },
  item: {
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    marginVertical: 10,
  },
  containerSheet: {
    height: responsiveSizeOS(300),
    position: 'absolute',
    bottom: 0,
  },
  imgRight: {
    width: responsiveSizeOS(25),
    height: responsiveSizeOS(25),
    resizeMode: 'contain',
  },
});
