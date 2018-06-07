import { foremanApi, userId } from '../../../services/api';

import {
  TABLE_COLUMNS_REQUEST,
  TABLE_COLUMNS_SUCCESS,
  TABLE_COLUMNS_FAILURE,
  UPDATE_TABLE_COLUMNS,
  UPDATE_TABLE_COLUMNS_SUCCESS,
  UPDATE_TABLE_COLUMNS_FAILURE,
} from '../../consts';

import { propsToSnakeCase } from '../../../services/index';

const getResponseError = ({ data }) => data && (data.displayMessage || data.error);

export const loadColumns = (table = '') => (dispatch) => {
  dispatch({ type: TABLE_COLUMNS_REQUEST, params: table });

  return foremanApi
    .get(`/users/${userId}/table_preferences`, {})
    .then(({ data }) => {
      let prefs = {};
      if (data.results.length > 0) {
        data.results.forEach((result) => {
          if (result.name === table) {
            prefs = result;
          }
        });
      }
      dispatch({
        type: TABLE_COLUMNS_SUCCESS,
        response: prefs,
      });
    })
    .catch((result) => {
      dispatch({
        type: TABLE_COLUMNS_FAILURE,
        error: getResponseError(result.response),
      });
    });
};


export const updateColumns = (columns = {}) => (dispatch) => {
  dispatch({ type: UPDATE_TABLE_COLUMNS, columns });

  const params = {
    columns,
  };

  return foremanApi
    .put(`/users/${userId}/table_preferences`, params)
    .then(({ data }) => {
      dispatch({
        type: UPDATE_TABLE_COLUMNS_SUCCESS,
        response: data,
      });
    })
    .catch((result) => {
      dispatch({
        type: UPDATE_TABLE_COLUMNS_FAILURE,
        error: getResponseError(result.response),
      });
    });
};
export default loadColumns;
