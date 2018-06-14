import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Popover, OverlayTrigger } from 'patternfly-react';
import './OptionTooltip.scss';

class OptionTooltip extends Component {
  constructor(props) {
    super(props);

    this.state = {
      options: this.props.options,
      toolTipOpen: false,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.renderTooltip = this.renderTooltip.bind(this);
  }

  handleInputChange(event, index) {
    const options = { ...this.state.options };
    options[index].value = event.target.checked;
    this.setState(options);
    this.props.onChange(options);
  }
  renderTooltip() {
    return (
      <Popover id="optionTooltip" className="option-tooltip">
        <ul>
          {
            this.state.options.map((option, index) => (
              <li key={option.key}>
                <input type="checkbox" checked={option.value} name={option.key} id={option.key} onChange={e => this.handleInputChange(e, index)} />
                <span>{option.label}</span>
              </li>
            ))
          }
        </ul>
      </Popover>
    );
  }
  render() {
    const { options } = this.state;
    const { icon } = this.props;
    const rootClose = true;
    const onOpen = () => {
      this.setState({ toolTipOpen: true });
    };
    const onClose = () => {
      this.props.onClose(options);
      this.setState({ toolTipOpen: false });
    };

    return (
      <OverlayTrigger
        overlay={this.renderTooltip()}
        placement="bottom"
        trigger={['click']}
        rootClose={rootClose}
        onEnter={onOpen}
        onExit={onClose}
      >
        <i className={classNames('fa', icon, 'tooltip-button', { 'tooltip-open': this.state.toolTipOpen })} />
      </OverlayTrigger>
    );
  }
}

OptionTooltip.propTypes = {
  icon: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};
OptionTooltip.defaultProps = {
  onChange: () => {},
};
export default OptionTooltip;
