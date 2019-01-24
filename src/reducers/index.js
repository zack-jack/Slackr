import { combineReducers } from 'redux';

import user from './user';
import channel from './channel';
import colors from './colors';

export default combineReducers({
  user,
  channel,
  colors
});
