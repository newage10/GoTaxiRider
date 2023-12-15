import { SET_CUSTOMER_ID } from './types';

export const setCustomerId = (driverId) => ({
  type: SET_CUSTOMER_ID,
  payload: driverId,
});
