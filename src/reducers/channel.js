import { SET_CURRENT_CHANNEL } from '../actions/types';

const INITIAL_STATE = {
  currentChannel: null
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_CURRENT_CHANNEL:
      return {
        ...state,
        currentChannel: action.payload.currentChannel
      };
    default:
      return state;
  }
};
