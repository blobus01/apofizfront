import React, {Component} from 'react';
import {connect} from 'react-redux';
import './index.scss';

class DevPage extends Component {
  render() {
    return (
      <React.Fragment>
      </React.Fragment>
    );
  }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(DevPage);