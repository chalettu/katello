import Immutable from 'seamless-immutable';

import {
  TABLE_COLUMNS_REQUEST,
  TABLE_COLUMNS_SUCCESS,
  TABLE_COLUMNS_FAILURE,
  CREATE_TABLE_COLUMNS,
  CREATE_TABLE_COLUMNS_SUCCESS,
  CREATE_TABLE_COLUMNS_FAILURE,
  UPDATE_TABLE_COLUMNS,
  UPDATE_TABLE_COLUMNS_SUCCESS,
  UPDATE_TABLE_COLUMNS_FAILURE,
} from '../../consts';


const initialState = Immutable({
  loading: false,
});

export default (state = initialState, action) => {
  switch (action.type) {
    case TABLE_COLUMNS_REQUEST:
    case CREATE_TABLE_COLUMNS:
    case UPDATE_TABLE_COLUMNS:
      return state.set('loading', true);

    case TABLE_COLUMNS_SUCCESS:
    case CREATE_TABLE_COLUMNS_SUCCESS:
    case UPDATE_TABLE_COLUMNS_SUCCESS:
      return Immutable({
        loading: false,
        ...action.response,
      });
    case TABLE_COLUMNS_FAILURE:
    case UPDATE_TABLE_COLUMNS_FAILURE:
    case CREATE_TABLE_COLUMNS_FAILURE: {
      return state.set('loading', false);
    }
    default:
      return state;
  }
};
