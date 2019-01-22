import { combineReducers } from 'redux';

import user from './user';
import channel from './channel';

export default combineReducers({
  user,
  channel
});
