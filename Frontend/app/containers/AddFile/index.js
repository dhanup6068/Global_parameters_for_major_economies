/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { memo } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import { makeSelectFileAdded, makeSelectParentData, makeSelectLoading } from './selectors';
import { addFile } from './actions';
import reducer from './reducer';
import saga from './saga';
import { Form, Input, Card, Button, Upload, message, Spin, Modal } from 'antd';
import { InboxOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const key = 'addFile';

class AddFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { addFileSelector: 1, fileList: [] };
  }

  componentDidUpdate(prevProps) {
    const { match: { params } } = this.props;
    if (this.props.addFileSelector !== prevProps.addFileSelector)
      this.props.history.push(`/${params.db}?parentId=${params.parentId}`);
  }

  addFile(values) {
    const { fileList } = this.state;
    if (!fileList.length) return message.error('Please upload a file');
    const formData = new FormData();
    formData.append('fileName', values.fileName);
    formData.append('partitionOn', values.partitionOn);
    formData.append('file', fileList[0].originFileObj);
    const { params = {} } = this.props.match;
    formData.append('parentId', params.parentId);
    this.props.addFile({ formData, db: params.db, parentId: params.parentId });
  }

  normFile({ fileList }) {
    this.setState({ fileList });
  };

  goBack = () => {
    const { params: { db, parentId } } = this.props.match;
    this.props.history.push(`/${db}/?parentId=${parentId}`);
  }

  render() {
    const { parent = {} } = this.props;
    const { name: parentName = null } = parent;
    return (
      <div>
        <Helmet>
          <title>Add File</title>
        </Helmet>
        <Modal visible={this.props.addFileLoader} footer={null} closable={false} style={{ margin: "0 auto", textAlign: "center" }} width={"10%"} centered>
          <Spin tip="Adding file..." />
        </Modal>
        <Card
          title={
            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
              <ArrowLeftOutlined onClick={() => this.goBack()} />
              <p style={{ margin: 0, marginLeft: "2%" }}>{parentName ? `Add file to "${parentName}"` : "AddFile"}</p>
            </div>
          }
          style={{ width: "50%", margin: "0 auto" }}
          headStyle={{ fontWeight: "bold" }}
        >
          <Form onFinish={values => this.addFile(values)}>
            <Form.Item
              name="fileName"
              label="File Name"
              rules={[{ required: true, message: 'Please input your File name!' }]}
            >
              <Input style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Dragger">
              <Form.Item name="dragger" valuePropName="fileList" getValueFromEvent={e => this.normFile(e)} noStyle >
                <Upload.Dragger name="files" maxCount={1} disabled={this.state.fileList.length} style={{ width: "100%" }} accept=".csv">
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag file to this area to upload</p>
                  <p className="ant-upload-hint">One file at a time.</p>
                </Upload.Dragger>
              </Form.Item>
            </Form.Item>
            <Form.Item
              name="partitionOn"
              label="Partition On"
              rules={[{ required: true, message: 'Please mention the key to partition!' }]}
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

AddFile.propTypes = {};

const withReducer = injectReducer({ key, reducer });
const withSaga = injectSaga({ key, saga });

const mapStateToProps = createStructuredSelector({
  addFileSelector: makeSelectFileAdded(),
  addFileLoader: makeSelectLoading(),
  parent: makeSelectParentData(),
});

export function mapDispatchToProps(dispatch) {
  return {
    addFile: file => dispatch(addFile(file))
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
)(AddFile);
