import { SET_CUSTOMER_ID } from './types';

const initialState = {
  customerId: null,
};

const customerReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CUSTOMER_ID:
      return {
        ...state,
        customerId: action.payload,
      };
    default:
      return state;
  }
};

export default customerReducer;
