import React, { Component } from 'react';
import ToolBar from '../components/ToolBar';
import Editor from '../components/Editor';

class Studio extends Component {
  render() {
    return (
      <div>
        <ToolBar click={this.handleToolBarClick} />
        <Editor />
      </div>
    )
  }
}

export default Studio;
