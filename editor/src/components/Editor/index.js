import React, { Component } from 'react';
import { connect } from 'dva';

import styles from './index.less';

@connect(state => ({
  editor: state.editor,
  config: state.config,
}))
class Editor extends Component {
  handleDragOver = (e) => {
    console.log('over', e.target);
  }

  render() {
    console.log(this.props.editor);
    return (
      <div
        editor_id="root"
        className={styles.editor}
        onDragOver={this.handleDragOver}
      />
    )
  }
}

export default Editor;
