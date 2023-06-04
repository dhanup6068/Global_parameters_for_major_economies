/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { memo } from 'react';
import ReactJson from 'react-json-view'
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import { } from './selectors';
import { } from './actions';
import reducer from './reducer';
import saga from './saga';
import { Card } from "antd";
import { ArrowLeftOutlined } from '@ant-design/icons';

const key = 'catJSON';

class CatJSON extends React.Component {
  constructor(props) {
    super(props);
    this.state = { addFolderSelector: 1 };
  }

  componentDidUpdate(prevProps) { }


  render() {

    return (
      <div>
        <Helmet>
          <title>cat JSON</title>
        </Helmet>
        <Card
          title={
            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
              {this.props.onBack && _.get(this.props, "files.parent.parentInode") != 1 ? <ArrowLeftOutlined onClick={() => this.props.onBack()} /> : null}
              <p style={{ margin: 0, marginLeft: "2%" }}>{this.props.fileName || this.props.file.fileName || "cat command output"}</p>
            </div>
          }
          headStyle={{ fontWeight: "bold" }}
          style={{ width: this.props.contentWidth || "50%", margin: "0 auto" }}
          extra={this.props.extra && this.props.extra()}
        >
          <ReactJson src={this.props.file.data} />
        </Card>
      </div >
    );
  }
}

CatJSON.propTypes = {};

const withReducer = injectReducer({ key, reducer });
const withSaga = injectSaga({ key, saga });

const mapStateToProps = createStructuredSelector({});

export function mapDispatchToProps(dispatch) {
  return {};
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withReducer,
  withSaga,
  withConnect,
  memo,
)(CatJSON);
