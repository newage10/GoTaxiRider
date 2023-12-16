import axios from 'axios';
import { Alert } from 'react-native';
import { getToken } from '~/configs/storageUtils';

const API_BASE_URL = 'http://35.220.201.164/v1';

// Tạo Axios Instance
const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tạo Interceptor để thêm Token vào Headers
apiService.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      //Bearer
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    // Xử lý lỗi
    return Promise.reject(error);
  }
);

//Hàm đăng nhập app
export const loginApp = async (loginData) => {
  try {
    const response = await apiService.post('/customers/login', loginData);
    return response.data;
  } catch (error) {
    let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại';

    // Kiểm tra xem có phản hồi từ server không và có thông báo lỗi không
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message; // Giả sử 'message' là một chuỗi
    } else if (error?.response?.data) {
      errorMessage = JSON.stringify(error.response.data); // Chuyển đối tượng thành chuỗi
    }

    return Alert.alert('Thông báo', errorMessage);
  }
};

//Hàm đăng xuất app
export const logoutApp = async () => {
  try {
    const response = await apiService.post('/customers/logout');
    return response.data;
  } catch (error) {
    let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại';

    // Kiểm tra xem có phản hồi từ server không và có thông báo lỗi không
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message; // Giả sử 'message' là một chuỗi
    } else if (error?.response?.data) {
      errorMessage = JSON.stringify(error.response.data); // Chuyển đối tượng thành chuỗi
    }

    return Alert.alert('Thông báo', errorMessage);
  }
};

//Hàm đăng ký app
export const registerApp = async (registerData) => {
  try {
    const response = await apiService.post('/customers/register', registerData);
    return response.data;
  } catch (error) {
    let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại';

    // Kiểm tra xem có phản hồi từ server không và có thông báo lỗi không
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message; // Giả sử 'message' là một chuỗi
    } else if (error?.response?.data) {
      errorMessage = JSON.stringify(error.response.data); // Chuyển đối tượng thành chuỗi
    }

    return Alert.alert('Thông báo', errorMessage);
  }
};

//Hàm lấy loại xe
export const getCarTypes = async () => {
  try {
    const response = await apiService.get('/cartypes');
    return response.data;
  } catch (error) {
    let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại';

    // Kiểm tra xem có phản hồi từ server không và có thông báo lỗi không
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message; // Giả sử 'message' là một chuỗi
    } else if (error?.response?.data) {
      errorMessage = JSON.stringify(error.response.data); // Chuyển đối tượng thành chuỗi
    }

    return Alert.alert('Thông báo', errorMessage);
  }
};

// Hàm lấy tất cả các dịch vụ
export const getAllServices = async () => {
  try {
    const response = await apiService.get('/services');
    return response.data;
  } catch (error) {
    let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại';

    // Kiểm tra xem có phản hồi từ server không và có thông báo lỗi không
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message; // Giả sử 'message' là một chuỗi
    } else if (error?.response?.data) {
      errorMessage = JSON.stringify(error.response.data); // Chuyển đối tượng thành chuỗi
    }

    return Alert.alert('Thông báo', errorMessage);
  }
};

// Hàm lấy thông tin khách hàng
export const getCustomerInfo = async (customerId) => {
  try {
    const response = await apiService.get(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại';

    // Kiểm tra xem có phản hồi từ server không và có thông báo lỗi không
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message; // Giả sử 'message' là một chuỗi
    } else if (error?.response?.data) {
      errorMessage = JSON.stringify(error.response.data); // Chuyển đối tượng thành chuỗi
    }

    return Alert.alert('Thông báo', errorMessage);
  }
};

export const calculateDistance = async (distanceData) => {
  try {
    const response = await apiService.post('/distance', distanceData);
    return response.data;
  } catch (error) {
    let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại';

    // Kiểm tra xem có phản hồi từ server không và có thông báo lỗi không
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message; // Giả sử 'message' là một chuỗi
    } else if (error?.response?.data) {
      errorMessage = JSON.stringify(error.response.data); // Chuyển đối tượng thành chuỗi
    }

    return Alert.alert('Thông báo', errorMessage);
  }
};

export const updateCustomerInfo = async (customerId, customerData) => {
  try {
    const response = await apiService.put(`/customers/updatecustomerinfo/${customerId}`, customerData);
    return response.data;
  } catch (error) {
    let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại';

    // Kiểm tra xem có phản hồi từ server không và có thông báo lỗi không
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message; // Giả sử 'message' là một chuỗi
    } else if (error?.response?.data) {
      errorMessage = JSON.stringify(error.response.data); // Chuyển đối tượng thành chuỗi
    }

    return Alert.alert('Thông báo', errorMessage);
  }
};

export const bookRide = async (bookingData) => {
  try {
    const response = await apiService.post('/booking/bookRide', bookingData);
    return response.data;
  } catch (error) {
    let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại';

    // Kiểm tra xem có phản hồi từ server không và có thông báo lỗi không
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message; // Giả sử 'message' là một chuỗi
    } else if (error?.response?.data) {
      errorMessage = JSON.stringify(error.response.data); // Chuyển đối tượng thành chuỗi
    }

    return Alert.alert('Thông báo', errorMessage);
  }
};

export default apiService;
