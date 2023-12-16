import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl, TextInput, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContext, useNavigation } from '@react-navigation/native';
import Header from '~/components/Header';
import Colors from '~/themes/colors';
import { SCREEN_WIDTH, isEmptyObj, responsiveFontSizeOS, responsiveSizeOS, screenWidth } from '~/helper/GeneralMain';
import LayoutView from '~/components/LayoutView';
import { useAppDispatch, useAppSelector } from '~/configs/hooks';
import { getCustomerInfo, updateCustomerInfo } from '~/services/apiService';
import { TextInputComponent } from '~/components/TextInputComponent';

const AccInfoScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = React.useContext(NavigationContext);
  const customerId = useAppSelector((state) => state?.customer?.customerId ?? 10);
  const [isSubmit, setCheckSubmit] = useState(true);
  const [nameCustomer, setNameCustomer] = useState(null);
  const [phoneCustomer, setPhoneCustomer] = useState(null);
  const [emailCustomer, setEmailCustomer] = useState(null);

  const handleSetData = (data, key) => {
    switch (key) {
      case accInfoCustomer.nameCustomer:
        setNameCustomer(data);
        break;
      case accInfoCustomer.phoneCustomer:
        setPhoneCustomer(data);
        break;
      case accInfoCustomer.emailCustomer:
        setEmailCustomer(data);
        break;
    }
  };

  const onRefreshLoading = () => {
    fetchCustomerData(customerId);
  };

  const fetchCustomerData = async (customerId) => {
    try {
      const response = await getCustomerInfo(customerId);
      console.log('Test 2 response: ', JSON.stringify(response));
      if (!isEmptyObj(response)) {
        const { fullname, email, phoneNo } = response;
        setNameCustomer(fullname);
        setEmailCustomer(email);
        setPhoneCustomer(phoneNo);
      }
    } catch (error) {
      console.error('Error fetching car types:', error.message);
    }
  };

  const handleIpdateCustomerInfo = async (customerId, reqData) => {
    try {
      const response = await updateCustomerInfo(customerId, reqData);
      console.log('Test 2 response: ', JSON.stringify(response));
      if (response?.success) {
        Alert.alert('Thông báo', response?.message ?? 'Cập nhật thông tin khách hàng thành công');
      }
    } catch (error) {
      console.error('Error update Customer info', error.message);
    }
  };

  const handleSubmit = () => {
    const reqData = {
      phoneNo: phoneCustomer,
      fullname: nameCustomer,
      email: emailCustomer,
    };
    handleIpdateCustomerInfo(customerId, reqData);
  };

  useEffect(() => {
    fetchCustomerData(customerId);
  }, []);

  useEffect(() => {
    nameCustomer && phoneCustomer && emailCustomer ? setCheckSubmit(true) : setCheckSubmit(false);
  }, [nameCustomer, phoneCustomer, emailCustomer]);

  const viewItem = (name, value, line = true, fWidthLeft = null, fWidthRight = null) => {
    return (
      <View>
        <View style={styles.viewItem}>
          <Text style={[styles.txtItemLeft, fWidthLeft]}>{name}</Text>
          <Text style={[styles.txtItemRight, fWidthRight]}>{value}</Text>
        </View>
        {line ? <View style={styles.viewLine} /> : null}
      </View>
    );
  };

  return (
    <LayoutView>
      <Header barStyle="dark-content" title={'Thông tin tài khoản'} onPressLeft={() => navigation.goBack()} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={false} onRefresh={onRefreshLoading} />}>
          <View style={styles.viewContent}>
            <TextInputComponent
              textLabel="Họ tên"
              textLabelStyle={styles.title}
              labelContainerStyle={styles.viewTextOption}
              value={nameCustomer}
              onChangeText={(e) => handleSetData(e, accInfoCustomer.nameCustomer)}
              returnKeyType={'done'}
              autoCorrect={false}
              allowFontScaling={false}
              keyboardType="default"
              placeholder={'Nhập tên khách hàng'}
              viewStyle={styles.viewInputText}
              setValue={setNameCustomer}
            />
            <TextInputComponent
              textLabel="Số điện thoại"
              textLabelStyle={styles.title}
              labelContainerStyle={styles.viewTextOption}
              value={phoneCustomer}
              onChangeText={(e) => handleSetData(e, accInfoCustomer.phoneCustomer)}
              returnKeyType={'done'}
              maxLength={10}
              autoCorrect={false}
              allowFontScaling={false}
              editable={false}
              keyboardType="number-pad"
              placeholder={'Nhập số điện thoại khách hàng'}
              viewStyle={styles.viewInputText}
              setValue={setPhoneCustomer}
            />
            <TextInputComponent
              textLabel="Email"
              textLabelStyle={styles.title}
              labelContainerStyle={styles.viewTextOption}
              value={emailCustomer}
              onChangeText={(e) => handleSetData(e, accInfoCustomer.emailCustomer)}
              returnKeyType={'done'}
              autoCorrect={false}
              allowFontScaling={false}
              keyboardType="email-address"
              placeholder={'Nhập địa chỉ email khách hàng'}
              viewStyle={styles.viewInputText}
              setValue={setEmailCustomer}
            />
            <TouchableOpacity style={[styles.viewInputButton, !isSubmit ? styles.viewInputButton_Disabled : null]} disabled={!isSubmit} onPress={handleSubmit}>
              <Text style={styles.txtSubmit}>XÁC NHẬN</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LayoutView>
  );
};

export default AccInfoScreen;

const accInfoCustomer = {
  nameCustomer: 'nameCustomer',
  phoneCustomer: 'phoneCustomer',
  emailCustomer: 'emailCustomer',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  viewContent: {
    flex: 1,
    backgroundColor: 'white',
    width: SCREEN_WIDTH,
    borderTopLeftRadius: responsiveSizeOS(20),
    borderTopRightRadius: responsiveSizeOS(20),
    paddingTop: responsiveSizeOS(12),
    paddingHorizontal: responsiveSizeOS(15),
  },

  viewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveSizeOS(4),
  },
  txtItem: {
    fontSize: responsiveFontSizeOS(16),
  },
  imgNext: {
    height: responsiveSizeOS(14),
    width: responsiveSizeOS(9),
  },
  txtItemLeft: {
    fontSize: responsiveFontSizeOS(15),
    color: 'rgb(4, 4, 4)',
    // fontFamily: Fonts.Regular,
    width: '40%',
    textAlign: 'left',
  },
  txtItemRight: {
    fontSize: responsiveFontSizeOS(15),
    color: 'rgb(4, 4, 4)',
    // fontFamily: Fonts.Regular,
    width: '60%',
    textAlign: 'right',
  },
  viewLine: {
    borderColor: 'rgb(203, 203, 203)',
    marginVertical: responsiveSizeOS(6),
    // width: '100%',
    borderWidth: responsiveSizeOS(0.7),
    borderStyle: 'dotted',
    borderRadius: responsiveSizeOS(1),
  },

  viewInputButton: {
    bottom: 0,
    position: 'absolute',
    backgroundColor: Colors.btnSubmit,
    borderRadius: responsiveSizeOS(15),
    justifyContent: 'center',
    alignItems: 'center',
    height: responsiveSizeOS(45),
    width: screenWidth - responsiveSizeOS(45),
    marginBottom: responsiveSizeOS(20),
    alignSelf: 'center',
    marginTop: responsiveSizeOS(20),
  },
  viewInputButton_Disabled: {
    backgroundColor: Colors.bgGray,
  },
  txtSubmit: {
    fontSize: responsiveFontSizeOS(16),
    color: 'white',
  },
  title: {
    fontSize: responsiveFontSizeOS(16),
    fontWeight: '400',
    color: '#818C9C',
  },
  viewTextOption: {
    marginTop: responsiveSizeOS(12),
    marginBottom: responsiveSizeOS(4),
  },
  viewInputText: {
    fontSize: responsiveFontSizeOS(16),
    color: 'rgb(11, 11, 11)',
    marginLeft: responsiveSizeOS(8),
    textAlign: 'left',
    width: '85%',
  },
});
