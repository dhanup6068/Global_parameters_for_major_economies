/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { memo } from 'react';
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
import { Card, Table } from "antd";
import { ArrowLeftOutlined } from '@ant-design/icons';
import _ from 'lodash';
import moment from 'moment';

const key = 'catCSV';

class CatCSV extends React.Component {
  constructor(props) {
    super(props);
    this.state = { addFolderSelector: 1 };
  }

  renderCSV = () => {
    let columns = [
      {
        title: "Time Stamp",
        dataIndex: "timeStamp",
        key: "timeStamp",
        width: 150,
        align: "center",
        render: val => <pre>{moment(val).format("YYYY-MM-DD HH:mm:ss")}</pre>
      },
      {
        title: "Month",
        dataIndex: "month",
        key: "month",
        width: 100,
        align: "center",
        render: val => <pre>{val}</pre>
      }
    ];
    const fileData = _.get(this.props, "file.data", [])
    const uniqColumns = _.uniq(_.flatten(fileData.map(Object.keys)))

    if(uniqColumns.find(col => col === "stock")) 
      columns.push({
        title: "Stock",
        dataIndex: "stock",
        key: "stock",
        width: 100,
        align: "center",
        render: val => <pre>{val}</pre>
      })
    const otherColumns = uniqColumns
      .filter(el => el !== "timeStamp" && el !== "month" && el !== "stock")
      .map((col, index) => {
        return {
          title: col,
          dataIndex: col,
          key: index,
          align: "center",
          width: 150,
          render: val => {
            if (typeof val === "object")
              return <pre>{JSON.stringify(val, null, 2)}</pre>
            if (typeof val === "string") {
              if (+val == val)
                return (+val).toFixed(4)
              if (val.length > 50)
                return <pre>{val.slice(0, 50)}...</pre>
              if (val.length < 10)
                return <pre>{`${"    "}${val}${"    "}`}</pre>
              return <pre>{val}</pre>
            }
            if (typeof val === "boolean")
              return <pre>{val ? "true" : "false"}</pre>
            return val
          }
        }
      });

    return <Table
      columns={[...columns, ...otherColumns]}
      dataSource={this.props.file.data}
      pagination={{ hideOnSinglePage: true, pageSize: 25 }}
      size={"small"}
      scroll={{ x: columns.reduce((width, el) => width + el.width, 0) }}
      bordered
    />
  }

  render() {
    return (
      <div>
        <Helmet>
          <title>cat csv</title>
        </Helmet>
        <Card
          title={
            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
              {this.props.onBack && _.get(this.props, "files.parent.parentInode") != 1 ? <ArrowLeftOutlined onClick={() => this.props.onBack()} /> : null}
              <p style={{ margin: 0, marginLeft: "2%" }}>{this.props.fileName || this.props.file.fileName || "cat command output"}</p>
            </div>
          }
          headStyle={{ fontWeight: "bold" }}
          style={{ width: "100%", margin: "0 auto" }}
          extra={this.props.extra && this.props.extra()}
        >
          {this.renderCSV()}
        </Card>
      </div >
    );
  }
}

CatCSV.propTypes = {};

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
)(CatCSV);
