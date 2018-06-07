import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, OverlayTrigger } from 'patternfly-react';

class OptionTooltip extends Component {
  constructor(props) {
    super(props);

    this.state = {
      options: this.props.options,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.renderTooltip = this.renderTooltip.bind(this);
  }

  handleInputChange(event, index) {
    const options = { ...this.state.options };
    options[index].value = event.target.checked;
    this.setState(options);
  }
  renderTooltip() {
    return (
      <Popover id="optionTooltip">
        <ul>
          {
            this.state.options.map((option, index) => (
              <li key={option.key}>
                <input type="checkbox" checked={option.value} name={option.key} onChange={e => this.handleInputChange(e, index)} />
                <label>{option.label}</label>
              </li>
            ))
          }
        </ul>
      </Popover>
    );
  }
  render() {
    const { onClose } = this.props;
    const state = this.state;
    const onCloseCB = function () {
      onClose(state.options);
    };
    const rootClose = true;
    const changeTooltip = () => {
      console.log('test');
    };
    return (
      <OverlayTrigger
                    overlay={this.renderTooltip()}
                    placement="bottom"
                    trigger={['click']}
                    rootClose={rootClose}
                    onEnter={changeTooltip}
                    onExit={onCloseCB}
                  >
                    <i className="fa fa-columns"></i>
                  </OverlayTrigger>
    );
  }
}

OptionTooltip.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func,
  onClose:  PropTypes.func.isRequired

};
OptionTooltip.defaultProps = {
  onChange: () => {},
};
export default OptionTooltip;
