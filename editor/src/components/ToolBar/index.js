import React, { Component } from 'react';
import { connect } from 'dva';
import * as antd from 'antd';

import styles from './index.less';

const Icon = antd.Icon;
const Input = antd.Input;
const Tooltip = antd.Tooltip;
const Popover = antd.Popover;

const components = Object.keys(antd);

@connect(state => ({
  editor: state.editor,
  config: state.config,
}))
class ToolBar extends Component {
  state = {
    type: '',
    configVisible: false,
    components: [...components],
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

  dragStart = (e) => {
    console.log('start', e);
    // set current components
  }

  dragEnd = (e) => {
    console.log('end', e);
    // drop current components
  }

  componentSearch = (e) => {
    const value = e.target.value;
    const c = components.filter(c => new RegExp(value, 'gi').test(c));
    this.setState({
      components: c,
    });
  }

  render() {
    const { configVisible, components } = this.state;

    const configContent = (
      <div className={styles.componentBlock}>
        <Input
          className={styles.componentSearch}
          placeholder="Search Components..."
          onChange={this.componentSearch}
        />
        <div className={styles.componentList}>
          {
            components.map(c => (
              <p
                className={styles.componentItem}
                key={c}
                draggable
                onDragStart={(e) => this.dragStart(e, c)}
                onDragEnd={(e) => this.dragEnd(e, c)}
              >
                {c}
              </p>
            ))
          }
        </div>
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
