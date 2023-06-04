/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import { makeSelectFolderAdded, makeSelectParentData } from './selectors';
import { addFolder, resetAddFolder } from './actions';
import reducer from './reducer';
import saga from './saga';
import { Form, Input, Card, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const key = 'addFolder';

class AddFolder extends React.Component {
  constructor(props) {
    super(props);
    this.state = { addFolderSelector: 1 };
  }

  componentDidUpdate(prevProps) {
    const { match: { params } } = this.props;
    if (this.props.addFolderSelector !== prevProps.addFolderSelector)
      this.props.history.push(`/${params.db}?parentId=${this.props.match.params.parentId}`);
  }

  addFolder(values) {
    const { params = {} } = this.props.match;
    this.props.addFolder({ ...values, parentId: params.parentId, db: params.db });
  }

  goBack = () => {
    const { params: { db } } = this.props.match;
    this.props.history.push(`/${db}/?parentId=${this.props.parent.inode}`);
  }

  render() {
    const { parent: { name: parentName = null } } = this.props;

    return (
      <div>
        <Helmet>
          <title>Add Folder</title>
        </Helmet>
        <Card
          title={
            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
              <ArrowLeftOutlined onClick={() => this.goBack()} />
              <p style={{ margin: 0, marginLeft: "2%" }}>{parentName ? `Add folder to "${parentName}"` : `Add Folder`}</p>
            </div>
          }
          style={{ width: "50%", margin: "0 auto" }}
          headStyle={{ fontWeight: "bold" }}
        >
          <Form onFinish={values => this.addFolder(values)}>
            <Form.Item
              name="folderName"
              label="Folder Name"
              rules={[{ required: true, message: 'Please input your folder name!' }]}
            >
              <Input style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item style={{ textAlign: "center" }}>
              <Button type="primary" htmlType="submit" style={{ width: "40%", borderRadius: "10px" }}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }
}

AddFolder.propTypes = {};

const withReducer = injectReducer({ key, reducer });
const withSaga = injectSaga({ key, saga });

const mapStateToProps = createStructuredSelector({
  addFolderSelector: makeSelectFolderAdded(),
  parent: makeSelectParentData(),
});

export function mapDispatchToProps(dispatch) {
  return {
    addFolder: folder => dispatch(addFolder(folder)),
    resetAddFolder: () => dispatch(resetAddFolder())
  };
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
)(AddFolder);
