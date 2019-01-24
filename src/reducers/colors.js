import { SET_COLORS } from '../actions/types';

const INITIAL_STATE = {
  primaryColor: '#4c3c4c',
  secondaryColor: '#eeeeee'
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_COLORS:
      return {
        ...state,
        primaryColor: action.payload.primaryColor,
        secondaryColor: action.payload.secondaryColor
      };
    default:
      return state;
  }
};
