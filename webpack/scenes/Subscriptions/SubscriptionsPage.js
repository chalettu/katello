import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import { LinkContainer } from 'react-router-bootstrap';
import { Grid, Row, Col, Form, FormGroup } from 'react-bootstrap';
import { Button } from 'patternfly-react';
import TooltipButton from 'react-bootstrap-tooltip-button';
import OptionTooltip from '../../move_to_pf/OptionTooltip';
import { notify } from '../../move_to_foreman/foreman_toast_notifications';
import helpers from '../../move_to_foreman/common/helpers';
import ModalProgressBar from '../../move_to_foreman/components/common/ModalProgressBar';
import ManageManifestModal from './Manifest/';
import SubscriptionsTable from './SubscriptionsTable';
import Search from '../../components/Search/index';
import { orgId } from '../../services/api';

import {
  BLOCKING_FOREMAN_TASK_TYPES,
  MANIFEST_TASKS_BULK_SEARCH_ID,
  BULK_TASK_SEARCH_INTERVAL,
} from './SubscriptionConstants';

class SubscriptionsPage extends Component {
  constructor(props) {
    super(props);
    const options = [
      {
        key: 'id',
        label: __('Name'),
        value: false,
      },
      {
        key: 'product_id',
        label: __('SKU'),
        value: false,
      },
      {
        key: 'contract_number',
        label: __('Contract'),
        value: false,
      },
      {
        key: 'start_date',
        label: __('Start Date'),
        value: false,
      },
      {
        key: 'end_date',
        label: __('End Date'),
        value: false,
      },
      {
        key: 'virt_who',
        label: __('Requires Virt-Who'),
        value: false,
      },
      {
        key: 'consumed',
        label: __('Consumed'),
        value: false,
      },
      {
        key: 'quantity',
        label: __('Entitlements'),
        value: false,
      },
    ];
    this.state = {
      manifestModalOpen: false,
      subscriptionDeleteModalOpen: false,
      disableDeleteButton: true,
      polledTask: null,
      showTaskModal: false,
      tableColumns: options,
      defaultColumns: [
        'id',
        'product_id',
        'contract_number',
        'start_date',
        'end_date',
      ],
    };
  }

  componentDidMount() {
    this.loadData();
  }

  getDisabledReason(deleteButton) {
    const { tasks, subscriptions } = this.props;
    const { disconnected } = subscriptions;
    let disabledReason = null;

    if (disconnected) {
      disabledReason = __('This is disabled because disconnected mode is enabled.');
    } else if (tasks.length > 0) {
      disabledReason = __('This is disabled because a manifest related task is in progress.');
    } else if (deleteButton && !disabledReason) {
      disabledReason = __('This is disabled because no subscriptions are selected');
    }

    return disabledReason;
  }

  showTaskModal(show) {
    if (this.state.showTaskModal !== show) {
      this.setState({ showTaskModal: show });

      if (show && this.state.manifestModalOpen) {
        this.setState({ manifestModalOpen: false });
      }
    }
  }

  loadData() {
    this.props.pollBulkSearch({
      search_id: MANIFEST_TASKS_BULK_SEARCH_ID,
      type: 'all',
      active_only: true,
      action_types: BLOCKING_FOREMAN_TASK_TYPES,
    }, BULK_TASK_SEARCH_INTERVAL);

    this.props.loadSetting('content_disconnected');
    this.props.loadSubscriptions();
    this.props.loadColumns('Katello::Subscriptions').then(() => {
      this.renderTableColumnOptions();
    });
  }

  handleDoneTask(taskToPoll) {
    const POLL_TASK_INTERVAL = 5000;

    if (!this.state.polledTask) {
      this.setState({ polledTask: taskToPoll });
      this.props.pollTaskUntilDone(taskToPoll.id, {}, POLL_TASK_INTERVAL).then((task) => {
        function getErrors() {
          return (
            <ul>
              {
                task.humanized.errors.map(error => <li key={error}> {error} </li>)
              }
            </ul>
          );
        }

        const message = (
          <span>
            <span>{__(`Task ${task.humanized.action} completed with a result of ${task.result}`)} </span>
            {task.errors ? getErrors() : ''}
            <a href={helpers.urlBuilder('foreman_tasks/tasks', '', task.id)}>
              {__('Click here to go to the tasks page for the task.')}
            </a>
          </span>
        );

        notify({ message: ReactDOMServer.renderToStaticMarkup(message), type: task.result });

        this.props.loadSubscriptions();
      });
    }
  }
  // This method sets default columns for the table or the columns that come back from redux. 
  renderTableColumnOptions() {
    const { settings } = this.props;
    let enabledColumns = [];
    const { tableColumns } = this.state;
    // if no columns are defined for this table then choose default columns
    if (settings.tables.columns.length === 0) {
      enabledColumns = this.state.defaultColumns;
    } else {
      enabledColumns = settings.tables.columns;
    }
    const configuredOptions = tableColumns.map((option) => {
      const currentOption = option;
      if (enabledColumns.indexOf(option.key) > -1) {
        currentOption.value = true;
      }
      return currentOption;
    });
    this.setState({ tableColumns: configuredOptions });
  }
  render() {
    const { tasks, subscriptions, settings } = this.props;
    const { disconnected } = subscriptions;
    const taskInProgress = tasks.length > 0;
    const disableManifestActions = taskInProgress || disconnected;
    let task = null;

    if (taskInProgress) {
      [task] = tasks;
      this.handleDoneTask(task);
    }

    if (task) {
      this.showTaskModal(true);
    } else {
      this.showTaskModal(false);
    }

    const onSearch = (search) => {
      this.props.loadSubscriptions({ search });
    };

    const getAutoCompleteParams = search => ({
      endpoint: '/subscriptions/auto_complete_search',
      params: {
        organization_id: orgId,
        search,
      },
    });
    const showManageManifestModal = () => {
      this.setState({ manifestModalOpen: true });
    };

    const onManageManifestModalClose = () => {
      this.setState({ manifestModalOpen: false });
    };

    const showSubscriptionDeleteModal = () => {
      this.setState({ subscriptionDeleteModalOpen: true });
    };

    const onSubscriptionDeleteModalClose = () => {
      this.setState({ subscriptionDeleteModalOpen: false });
    };

    const onDeleteSubscriptions = (selectedRows) => {
      this.props.deleteSubscriptions(selectedRows);
      onSubscriptionDeleteModalClose();
    };

    const toggleDeleteButton = (rowsSelected) => {
      this.setState({ disableDeleteButton: !rowsSelected });
    };

    const toolTipOnclose = (columns) => {
      const enabledColumns = [];
      columns.forEach((column) => {
        if (column.value) {
          enabledColumns.push(column.key);
        }
      });
      if (!settings.tables.id) {
        this.props.createColumns({ name: 'Katello::Subscriptions', columns: enabledColumns });
      } else {
        const options = { ...settings.tables };
        options.columns = enabledColumns;
        this.props.updateColumns(options);
      }
    };
    const columns = settings.tables.columns || this.state.defaultColumns;
    return (
      <Grid bsClass="container-fluid">
        <Row>
          <Col sm={12}>
            <h1>{__('Red Hat Subscriptions')}</h1>

            <Row className="toolbar-pf table-view-pf-toolbar-external">
              <Col sm={12}>
                <Form className="toolbar-pf-actions">
                  <FormGroup className="toolbar-pf-filter">
                    <Search onSearch={onSearch} getAutoCompleteParams={getAutoCompleteParams} />
                  </FormGroup>
                  <div className="option-tooltip-container">
                    <OptionTooltip options={this.state.tableColumns} icon="fa-columns" onClose={toolTipOnclose} />
                  </div>
                  <div className="toolbar-pf-action-right">
                    <FormGroup>
                      <LinkContainer to="subscriptions/add" disabled={disableManifestActions}>
                        <TooltipButton
                          tooltipId="add-subscriptions-button-tooltip"
                          tooltipText={this.getDisabledReason()}
                          tooltipPlacement="top"
                          title={__('Add Subscriptions')}
                          disabled={disableManifestActions}
                          bsStyle="primary"
                        />
                      </LinkContainer>

                      <Button onClick={showManageManifestModal}>
                        {__('Manage Manifest')}
                      </Button>

                      <Button>
                        {__('Export CSV')}
                      </Button>

                      <TooltipButton
                        bsStyle="danger"
                        onClick={showSubscriptionDeleteModal}
                        tooltipId="delete-subscriptions-button-tooltip"
                        tooltipText={this.getDisabledReason(true)}
                        tooltipPlacement="top"
                        title={__('Delete')}
                        disabled={disableManifestActions || this.state.disableDeleteButton}
                      />

                    </FormGroup>
                  </div>
                </Form>
              </Col>
            </Row>

            <ManageManifestModal
              showModal={this.state.manifestModalOpen}
              taskInProgress={taskInProgress}
              disableManifestActions={disableManifestActions}
              disabledReason={this.getDisabledReason()}
              onClose={onManageManifestModalClose}
            />

            <div id="subscriptions-table" className="modal-container">
              <SubscriptionsTable
                loadSubscriptions={this.props.loadSubscriptions}
                tableColumns={columns}
                updateQuantity={this.props.updateQuantity}
                subscriptions={this.props.subscriptions}
                subscriptionDeleteModalOpen={this.state.subscriptionDeleteModalOpen}
                onSubscriptionDeleteModalClose={onSubscriptionDeleteModalClose}
                onDeleteSubscriptions={onDeleteSubscriptions}
                toggleDeleteButton={toggleDeleteButton}
              />
              <ModalProgressBar
                show={this.state.showTaskModal}
                container={document.getElementById('subscriptions-table')}
                task={task}
              />
            </div>
          </Col>
        </Row>
      </Grid>
    );
  }
}

SubscriptionsPage.propTypes = {
  loadSubscriptions: PropTypes.func.isRequired,
  updateQuantity: PropTypes.func.isRequired,
  subscriptions: PropTypes.shape().isRequired,
  pollBulkSearch: PropTypes.func.isRequired,
  pollTaskUntilDone: PropTypes.func.isRequired,
  loadSetting: PropTypes.func.isRequired,
  loadColumns: PropTypes.func.isRequired,
  createColumns: PropTypes.func.isRequired,
  updateColumns: PropTypes.func.isRequired,
  settings: PropTypes.shape({}).isRequired,
  tasks: PropTypes.arrayOf(PropTypes.shape({})),
  deleteSubscriptions: PropTypes.func.isRequired,
};

SubscriptionsPage.defaultProps = {
  tasks: [],
};

export default SubscriptionsPage;
