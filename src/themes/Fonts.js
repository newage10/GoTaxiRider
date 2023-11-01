import { Platform } from 'react-native';

const Fonts = () => {
  if (Platform.OS === 'ios') {
    return {
      Hairline: 'Lato-Hairline',
      Light: 'Lato-Light',
      Regular: 'Lato-Regular',
      SemiBold: 'Lato-Bold',
      Bold: 'Lato-Black',
      HairlineItalic: 'Lato-HairlineItalic',
      LightItalic: 'Lato-LightItalic',
      Italic: 'Lato-Italic',
      SemiBoldItalic: 'Lato-BoldItalic',
    };
  }
  return {
    Hairline: 'Lato-Hairline',
    Light: 'Lato-Light',
    Regular: 'LatoRegular',
    SemiBold: 'LatoBold',
    Bold: 'LatoBlack',
    HairlineItalic: 'Lato-HairlineItalic',
    LightItalic: 'Lato-LightItalic',
    Italic: 'LatoItalic',
    SemiBoldItalic: 'LatoBoldItalic',
  };
};

export default Fonts();
