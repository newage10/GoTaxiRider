export const PermissionsLocation = {
  alertRequest: {
    title: 'Thông báo cấp quyền',
    message: 'Ứng dụng Go App cần truy cập định vị vị trí để bạn có thể sử dụng bản đồ',
    buttonNeutral: 'Hỏi tôi sau',
    buttonNegative: 'Không',
    buttonPositive: 'Đồng ý',
  },
  alertGranted: 'Ứng dụng Go App cần truy cập định vị vị trí để bạn có thể sử dụng bản đồ',
  alertDenied: 'Bạn đã hủy chọn quyền truy cập định vị vị trí. Để có thể xác định vị trí khi dùng bản đồ, bạn cần kích hoạt quyền truy cập.',
};

export const searchType = {
  CURRENT: 1,
  INPUT: 2,
};

export const defaultLocation = {
  latitude: 10.771423,
  longitude: 106.698471,
};

export const currentLocation = {
  coords: {
    accuracy: 10,
    altitude: 60,
    heading: 56,
    latitude: 10.8023374,
    longitude: 106.6118853,
    speed: 0,
  },
  extras: {
    maxCn0: 0,
    meanCn0: 0,
    satellites: 0,
  },
  mocked: false,
  timestamp: 1700514171000,
};

export const VALIDATE = {
  DONE: 'DONE',
};
