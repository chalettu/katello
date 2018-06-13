import { foremanApi, userId } from '../../../services/api';

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

const getResponseError = ({ data }) => data && (data.displayMessage || data.error);

export const loadColumns = (table = '') => (dispatch) => {
  dispatch({ type: TABLE_COLUMNS_REQUEST, params: table });

  return foremanApi
    .get(`/users/${userId}/table_preferences/${table}`, {})
    .then(({ data }) => {
      dispatch({
        type: TABLE_COLUMNS_SUCCESS,
        response: data,
      });
    })
    .catch((result) => {
      const { response } = result;
      const errorMessage = `Resource table_preference not found by id '${table}'`;
      if (response.status === 404 && response.data.error.message === errorMessage) {
        dispatch({
          type: TABLE_COLUMNS_SUCCESS,
          response: {
            id: null,
            name: table,
            columns: [],
          },
        });
      } else {
        dispatch({
          type: TABLE_COLUMNS_FAILURE,
          error: getResponseError(response),
        });
      }
    });
};

export const createColumns = (params = {}) => (dispatch) => {
  dispatch({ type: CREATE_TABLE_COLUMNS, params });

  return foremanApi
    .post(`/users/${userId}/table_preferences`, params)
    .then(({ data }) => {
      dispatch({
        type: CREATE_TABLE_COLUMNS_SUCCESS,
        response: data,
      });
    })
    .catch((result) => {
      dispatch({
        type: CREATE_TABLE_COLUMNS_FAILURE,
        error: getResponseError(result.response),
      });
    });
};
export const updateColumns = (params = {}) => (dispatch) => {
  dispatch({ type: UPDATE_TABLE_COLUMNS, params });
  const updateParams = { columns: params.columns };
  return foremanApi
    .put(`/users/${userId}/table_preferences/${params.name}`, updateParams)
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
