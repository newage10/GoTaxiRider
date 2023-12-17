// socketService.js
import io from 'socket.io-client';

// const SOCKET_URL = 'http://192.168.1.10:5000';
const SOCKET_URL = 'http://35.220.201.164';
const socket = io(SOCKET_URL, {
  transports: ['websocket'], // Sử dụng WebSockets
});

const socketService = {
  // Kết nối với server Socket.IO
  connect() {
    if (!this.isConnected()) {
      socket.connect();
      this.setupListeners();
    }
  },

  // Ngắt kết nối từ server Socket.IO
  disconnect() {
    if (this.isConnected()) {
      socket.disconnect();
    }
  },

  // Kiểm tra xem đã kết nối với server hay chưa
  isConnected() {
    return socket.connected;
  },

  // Hàm để lấy socketId của kết nối hiện tại
  getSocketId() {
    return socket.id;
  },

  // Thiết lập lắng nghe các sự kiện từ server
  setupListeners() {
    socket.on('rideRequest', (data) => {
      console.log('Ride request received:', data);
    });
    // Thêm các sự kiện khác ở đây nếu cần
  },

  // Lắng nghe một sự kiện từ server
  on(eventName, callback) {
    socket.on(eventName, callback);
  },

  // Gửi một sự kiện tới server
  emit(eventName, data) {
    if (!this.isConnected()) {
      this.connect();
    }
    socket.emit(eventName, data);
  },

  // Gửi cập nhật vị trí khách hàng lên server
  updateLocation(customerId, locationData) {
    if (this.isConnected()) {
      const locationPayload = {
        id: customerId,
        status: 'available',
        location: {
          type: 'Point',
          coordinates: [locationData.longitude, locationData.latitude],
        },
      };

      socket.emit('driver_connect', locationPayload);
    }
  },
  // Khách hàng chấp nhận cuốc xe
  acceptRide(customerId) {
    this.emit('customer_accepted', { customerId });
  },

  // Tài xế từ chối cuốc xe
  rejectRide(customerId) {
    this.emit('customer_rejected', { customerId });
  },

  //hàm nghe sự kiện rideRequest
  listenForRideRequest(callback) {
    socket.on('rideRequest', callback);
  },

  //hàm hủy nghe sự kiện
  stopListeningForRideRequest() {
    socket.off('rideRequest');
  },

  // Hàm lắng nghe sự kiện di chuyển chuyến của tài xế
  listenForBookingStatus(callback) {
    socket.on('booking_status', callback);
  },

  // Hàm hủy nghe sự kiện
  stopListeningForBookingStatus() {
    socket.off('booking_status');
  },

  //hàm nghe sự kiện driver_location
  listenForDriverLocation(callback) {
    socket.on('driver_location', callback);
  },

  //Hàm hủy sự kiện lắng nghe driver_location
  stopListeningForDriverLocation() {
    socket.off('driver_location');
  },

  // Khách hàng chấp nhận cuốc xe
  checkLocationDriver(driverId) {
    console.log('Test check_location: ', driverId);
    this.emit('check_location', { id: driverId });
  },
};

export default socketService;
