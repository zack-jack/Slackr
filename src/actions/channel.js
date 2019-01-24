import {
  SET_CURRENT_CHANNEL,
  SET_PRIVATE_CHANNEL,
  SET_USER_MESSAGES
} from './types';

export const setCurrentChannel = channel => {
  return {
    type: SET_CURRENT_CHANNEL,
    payload: {
      currentChannel: channel
    }
  };
};

export const setPrivateChannel = isPrivateChannel => {
  return {
    type: SET_PRIVATE_CHANNEL,
    payload: {
      isPrivateChannel
    }
  };
};

export const setUserMessages = userMessages => {
  return {
    type: SET_USER_MESSAGES,
    payload: {
      userMessages
    }
  };
};
