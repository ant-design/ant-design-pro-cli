import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'antd';

import styles from './index.less';

export default class Component extends PureComponent {
  static defaultProps = {};

  state = {};

  componentWillMount() {

  }

  componentDidMount() {

  }

  componentReceiveProps() {

  }

  shouldComponentUpdate() {

  }

  componentWillUnmount() {

  }

  render() {
    return (
      <div className={styles.component}>
        <Button>Component Sample</Button>
      </div>
    );
  }
}
