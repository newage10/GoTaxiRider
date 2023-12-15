import { combineReducers } from 'redux';
import customerReducer from './customer/reduces';

const rootReducer = combineReducers({
  customer: customerReducer,
});

export default rootReducer;
