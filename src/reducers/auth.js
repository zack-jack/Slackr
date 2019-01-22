import { SET_USER } from '../actions/types';

const INITIAL_STATE = {
  currentUser: null,
  isLoading: true
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        currentUser: action.payload.currentUser,
        isLoading: false
      };
    default:
      return state;
  }
};
