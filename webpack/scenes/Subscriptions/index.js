import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as subscriptionActions from './SubscriptionActions';

import * as taskActions from '../Tasks/TaskActions';
import * as settingActions from '../../move_to_foreman/Settings/SettingsActions';
import * as tableActions from '../../redux/actions/Settings/tables';
import reducer from './SubscriptionReducer';

import SubscriptionsPage from './SubscriptionsPage';
import './Subscriptions.scss';

// map state to props
const mapStateToProps = state => ({
  subscriptions: state.katello.subscriptions,
  tasks: state.katello.subscriptions.tasks,
  settings: state.katello.settings,
});

// map action dispatchers to props
const actions = {
  ...subscriptionActions,
  ...taskActions,
  ...settingActions,
  ...tableActions,
};
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

// export reducers
export const subscriptions = reducer;

// export connected component
export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionsPage);
