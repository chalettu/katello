import Immutable from 'seamless-immutable';
import { initialApiState } from '../../../services/api';

import {
  TABLE_COLUMNS_REQUEST,
  TABLE_COLUMNS_SUCCESS,
  TABLE_COLUMNS_FAILURE,
  UPDATE_TABLE_COLUMNS,
  UPDATE_TABLE_COLUMNS_SUCCESS,
  UPDATE_TABLE_COLUMNS_FAILURE,
  DELETE_TABLE_COLUMNS,
  DELETE_TABLE_COLUMNS_SUCCESS,
  DELETE_TABLE_COLUMNS_FAILURE,
} from '../../consts';
import { GET_SETTING_SUCCESS } from '../../../move_to_foreman/Settings/SettingsConstants';

const initialState = Immutable({
  ...initialApiState,
});

export default (state = initialState, action) => {
  switch (action.type) {
    case TABLE_COLUMNS_REQUEST:
      return state.set('loading', true);

    case TABLE_COLUMNS_SUCCESS:
    console.log('here is the response');
    console.log(action.response);
    action.response.test = 'blah';
      return state.set(...action.response);
    case TABLE_COLUMNS_FAILURE: {
      // deal with this
      return state.merge({
      });
    }

    default:
      return state;
  }
};
