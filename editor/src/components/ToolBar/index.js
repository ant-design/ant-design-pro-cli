import React, { Component } from 'react';
import * as antd from 'antd';

import styles from './index.less';

const Icon = antd.Icon;
const Tooltip = antd.Tooltip;
const Popover = antd.Popover;

const components = Object.keys(antd);

class ToolBar extends Component {
  state = {
    type: '',
    configVisible: false,
  }
  handleVisibleChange = () => {

  }
  handleEdit = () => {
    this.setState({
      configVisible: !this.state.configVisible,
    });
  }
  handleStep = () => {

  }
  handleSave = () => {

  }

  render() {
    const { configVisible } = this.state;

    const configContent = (
      <div className={styles.components}>
        <h3>Components</h3>
        {
          components.map(c => (
            <p>{c}</p>
          ))
        }
      </div>
    );

    return (
      <div className={styles.toolBar}>
        <ul className={styles.operator}>
          <Popover
            title={false}
            placement="bottom"
            trigger="click"
            content={configContent}
            visible={configVisible}
            onVisibleChange={this.handleVisibleChange}
          >
            <li className={styles.operatorLeft} onClick={this.handleEdit}>
              <Tooltip title="Components">
                <Icon type="appstore-o" />
              </Tooltip>
            </li>
          </Popover>
          <li>
            <Tooltip title="Prev Step" onClick={() => this.handleStep('prev')}>
              <Icon type="rollback" />
            </Tooltip>
          </li>
          <li className={styles.rollback} onClick={() => this.handleStep('next')}>
            <Tooltip title="Next Step">
              <Icon type="rollback" />
            </Tooltip>
          </li>
          <li>
            <Tooltip title="Save" onClick={this.handleSave}>
              <Icon type="save" />
            </Tooltip>
          </li>
        </ul>
      </div>
    )
  }
}

export default ToolBar;
