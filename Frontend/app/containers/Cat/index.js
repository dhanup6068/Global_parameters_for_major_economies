import React, { memo } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import { makeSelectFile } from './selectors';
import { getFileData, getPartitions, getPartitionData, resetCat } from './actions';
import reducer from './reducer';
import saga from './saga';
import CatJSON from '../CatJSON/Loadable';
import CatCSV from '../CatCSV/Loadable.js';
import { InfoCircleTwoTone } from '@ant-design/icons';
import { Modal, Button, Spin } from 'antd';

const key = 'cat';

class Cat extends React.Component {
  constructor(props) {
    super(props);
    this.state = { addFolderSelector: 1, showPartitions: false, showPartitionData: false };
  }

  componentDidMount() {
    const { params: { ext = "json", inode, db } } = this.props.match;
    this.props.getFileData(inode, db);
    this.props.getPartitions(inode, db);
  }

  componentWillUnmount() {
    this.props.resetCat();
  }

  onBack = () => {
    const { params: { db } } = this.props.match;
    this.props.history.push(`/${db}/?parentId=${this.props.file.parentInode}`);
  }

  showPartitions = visible => {
    this.setState({ showPartitions: visible });
  }

  navigateToAnalytics = () => {
    const { params: { db, inode, ext } } = this.props.match;
    this.props.history.push(`/${db}/analytics/${ext}/${inode}`);
  }

  onExtra = () => {
    return <div style = {{display: "flex", justifyContent: "center"}}>
      <Button type="link" onClick={() => this.showPartitions(true)} style={{ marginRight: 10 }}>
        Partitions
      </Button>
      <Button type="link" onClick={() => this.navigateToAnalytics()}>Search and Analytics</Button>
    </div>
  }

  getPartitionData = (partition) => {
    const { params: { db } } = this.props.match;
    this.props.getPartitionData(db, partition.blockId);
    this.setState({ showPartitionData: true, chosenParition: partition.partitionValue });
  }

  listPartitions() {
    return <Modal
      title={<p style={{ fontWeight: "bold", margin: 0 }}>{`Partition key: ${this.props.file.partitionedOn}`}</p>}
      centered
      visible={this.state.showPartitions}
      onCancel={() => this.showPartitions(false)}
      footer={null}
    >
      {this.props.file.partitions.map((partition, index) => {
        return <Button
          key={index}
          onClick={() => this.getPartitionData(partition)}
          type="link"
        >
          {partition.partitionValue}
        </Button>
      })}
    </Modal>
  }

  showPartitionData() {
    const { params: { ext = "json" } } = this.props.match;
    const CatComponent = ext === "json" ? CatJSON : CatCSV;
    return <Modal
      title={<p style={{ fontWeight: "bold", margin: 0 }}>{`Partition value: "${this.state.chosenParition}"`}</p>}
      centered
      visible={this.state.showPartitionData}
      onCancel={() => this.setState({ showPartitionData: false })}
      footer={null}
      width={"80%"}
    >
      {<CatComponent file={{ data: this.props.file.partitionData }} contentWidth={"100%"} fileName={"Partition Data"} />}
    </Modal>
  }

  render() {
    const { params: { ext = "json" } } = this.props.match;
    const CatComponent = ext === "json" ? CatJSON : CatCSV;
    return (
      <div>
        <Helmet>
          <title>cat JSON</title>
        </Helmet>
        <Modal
          visible={this.props.file.loadingCat || this.props.file.loadingParts}
          footer={null}
          closable={false}
          style={{ margin: "0 auto", textAlign: "center" }}
          width={"10%"}
          centered
        >
          <Spin tip="Reading file..." />
        </Modal>
        {this.listPartitions()}
        {this.showPartitionData()}
        <CatComponent file={this.props.file} onBack={this.onBack} extra={this.onExtra} />
      </div>
    );
  }
}

Cat.propTypes = {};

const withReducer = injectReducer({ key, reducer });
const withSaga = injectSaga({ key, saga });

const mapStateToProps = createStructuredSelector({
  file: makeSelectFile(),
});

export function mapDispatchToProps(dispatch) {
  return {
    getFileData: (inode, db) => dispatch(getFileData(inode, db)),
    getPartitions: (inode, db) => dispatch(getPartitions(inode, db)),
    getPartitionData: (inode, db, blockId) => dispatch(getPartitionData(inode, db, blockId)),
    resetCat: () => dispatch(resetCat())
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
)(Cat);
