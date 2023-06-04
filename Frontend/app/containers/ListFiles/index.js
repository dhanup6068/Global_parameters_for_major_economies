/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import { makeSelectListFiles } from './selectors';
import CenteredSection from './CenteredSection';
import { getFiles, deleteFile } from './actions';
import reducer from './reducer';
import saga from './saga';
import { Table, Button, Card } from 'antd';
import moment from 'moment';
import { DeleteFilled, ArrowLeftOutlined } from '@ant-design/icons';
import _ from 'lodash';
const key = 'files';

class ListFiles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getFiles = () => {
    const url = new URL(window.location);
    const parentId = url.searchParams.get('parentId');
    const { db } = this.props.match.params;
    this.props.getFiles(db, parentId);
  }

  componentDidMount() {
    this.getFiles();
  }

  shouldComponentUpdate(prevProps, prevState) {
    return _.get(this.props, "history.location.pathname") !== _.get(prevState, "history.location.pathname");
  }

  componentDidUpdate(prevProps) {
    if(_.get(this.props, "match.params.db") != _.get(prevProps, "match.params.db")) 
      this.getFiles();
  }

  deleteFile(inode) {
    const { db } = this.props.match.params;
    const { parent } = this.props.files;
    this.props.deleteFile(inode, db, parent.inode);
  }

  searchFile(value) {
    const url = new URL(window.location);
    url.searchParams.set('parentId', value);
    window.history.pushState(null, '', url.toString());
    const { db } = this.props.match.params;
    this.props.getFiles(db, value);
  }

  listFiles() {
    const { files, match: { params } } = this.props;

    const columns = [
      {
        title: 'File Name',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
        render: (text, row) => row.type === 0 ? <Button type="link" onClick={() => this.searchFile(row.inode)}>{text}</Button> : <Button type="text">{text}</Button>,
      },
      {
        title: 'cat',
        dataIndex: 'cat',
        key: 'cat',
        align: 'center',
        render: (text, row) => row.type === 1 ? <Button type="link" onClick={() => this.props.history.push(`/${params.db}/cat/${row.extension}/${row.inode}`)}>view</Button> : null,
      },
      {
        title: 'File Size',
        dataIndex: 'size',
        key: 'size',
        align: 'center',
        render: text => `${+text / 1024 > 1024 ? (+text / (1024 * 1024)).toFixed(2) + "MB": (+text / 1024).toFixed(2) + "KB"} `
      },
      {
        title: 'partitioned On',
        dataIndex: 'partitionedOn',
        key: 'partitionedOn',
        align: 'center',
        // render: val => val === 0 ? "Folder" : "File"
      },
      {
        title: 'Extension',
        dataIndex: 'extension',
        key: 'extension',
        align: 'center',
        render: text => text ? text : ""
      },
      // {
      //   title: 'Created At',
      //   dataIndex: 'createdTime',
      //   key: 'createdTime',
      //   align: 'center',
      //   render: val => moment(val).format('MM-DD-YYYY hh:mm:ss A')
      // },
      {
        title: 'Delete',
        dataIndex: 'delete',
        key: 'delete',
        align: 'center',
        render: (text, row) => <div style={{ textAlign: "center" }}>
          {row.type === 1 ?
            <DeleteFilled
              style={{ color: "red" }}
              onClick={() => this.deleteFile(row.inode)}
            />
            : null}
        </div>
      }
    ];
    return (
      <Card
        title={
          files.parent && files.parent.name &&
          <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
            {_.get(this.props, "files.parent.parentInode") != 1 ? <ArrowLeftOutlined onClick={() => this.searchFile(this.props.files.parent.parentInode)} /> : null}  <p style = {{margin: 0, marginLeft: "2%"}}>{files.parent.name}</p>
          </div>
          || "Folder"}
        headStyle={{ textAlign: "left", fontWeight: "bold" }}
        extra={
          <div>
            <Button
              type="link"
              onClick={() => this.props.history.push(`/${params.db}/addFile/${files.parent.inode}`)}
            >
              Add File
            </Button>
            <Button
              type="link"
              onClick={() => this.props.history.push(`/${params.db}/addFolder/${files.parent.inode}`)}
            >
              Add Folder
            </Button>
          </div>
        }
      >
        {files.files.length ? <Table columns={columns} dataSource={files.files} rowKey="inode" pagination={{ hideOnSinglePage: true, pageSize: 100 }} /> : <p>No files</p>}
      </Card>
    );
  }

  render() {
    const { db } = this.props.match.params;

    return (
      <div>
        <Helmet>
          <title>Home</title>
          <meta name="description" content="EDFS Project for group" />
        </Helmet>
        <div>
          <CenteredSection>
            {["mysql", "mongodb", "firebase"].includes(db.toLowerCase()) ? this.listFiles() : <p>Yet to implement EDFS in this db</p>}
          </CenteredSection>
        </div>
      </div>
    );
  }
}

ListFiles.propTypes = {
  loading: PropTypes.bool
};

const withReducer = injectReducer({ key, reducer });
const withSaga = injectSaga({ key, saga });

const mapStateToProps = createStructuredSelector({
  files: makeSelectListFiles()
});

export function mapDispatchToProps(dispatch) {
  return {
    getFiles: (db, parentId) => dispatch(getFiles(db, parentId)),
    deleteFile: (inode, db, parentId) => dispatch(deleteFile(inode, db, parentId)),
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
)(ListFiles);
