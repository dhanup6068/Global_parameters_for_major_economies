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
import { makeSelectAnalytics } from './selectors';
import { getFileColumns, search, resetSearch } from './actions';
import CatCSV from '../CatCSV';
import reducer from './reducer';
import saga from './saga';
import { Table, Button, Card, Form, Input, Modal, Spin, Select, Row, Col, message, DatePicker } from 'antd';
import moment from 'moment';
import { DeleteFilled, ArrowLeftOutlined } from '@ant-design/icons';
import _ from 'lodash';
const key = 'analytics';

class Analytics extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isSearch: false };
  }

  componentDidMount() {
    const { db, inode } = this.props.match.params;
    this.props.getFileColumns(db, inode);
  }
  chooseMethod = (value) => {
    this.setState({ isSearch: value === "search" });
  }

  chooseComparator = (value) => {
    this.setState({ comparator: value });
  }

  chooseColumn = (value) => {
    this.setState({ column: value });
  }

  submitForm = (values) => {

    const { db, inode } = this.props.match.params;
    const { column, method, searchValue, operator = "===", from, to } = values;
    if (method === "search") {
      const searchFields = { column, searchValue, operator, operator, from, to };
      if (column === "timeStamp") {
        searchFields["fromDate"] = this.state.fromDate;
        searchFields["toDate"] = this.state.toDate;
        searchFields["searchValue"] = this.state.searchValue;
      }
      this.props.search({ db, inode, searchFields });
    } else {
      message.warn("Analyse is not implemented yet!");
    }
  }

  resetSearch = () => this.props.resetSearch();

  goBack = () => {
    const { db, inode, ext } = this.props.match.params;
    this.props.history.push(`/${db}/cat/${ext}/${inode}`);
  }

  setDate = (key, dt) => {
    this.setState({ [key]: moment(dt).format("YYYY-MM-DD HH:mm:ss") });
  }

  render() {
    console.log("this.state:", this.state);
    return (
      <div>
        <Helmet>
          <title>Search & Analytics</title>
          <meta name="description" content="EDFS Project for group" />
        </Helmet>

        {/* loading modal */}
        <Modal visible={this.props.analytics.loading} footer={null} closable={false} style={{ margin: "0 auto", textAlign: "center" }} width={"10%"} centered>
          <Spin size="large" tip={_.get(this.props, "analytics.loadingString", "Loading")} />
        </Modal>

        {/* search results modal */}
        <Modal visible={_.get(this.props, "analytics.searchResults.length", 0)} width={"80%"} centered footer={false} closable={false} onCancel={this.resetSearch}>
          <CatCSV file={{ data: _.get(this.props, "analytics.searchResults", []), fileName: `Search Results` }} />
        </Modal>


        <Card
          title={
            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
              <ArrowLeftOutlined onClick={this.goBack} />
              <span style={{ marginLeft: 0, marginLeft: "2%" }}>Search & Analytics</span>
            </div>
          }
          headStyle={{ fontWeight: 'bold' }}
          style={{ width: "100%", margin: "0 auto" }}
        >
          <Form onFinish={this.submitForm}>
            <Row gutter={16}>
              {/* Search or analyse */}
              <Col span={12}>
                <Form.Item
                  name="method"
                  label="Search or analyse"
                  rules={[
                    {
                      required: true,
                      message: 'Please choose a method!',
                    },
                  ]}
                >
                  <Select onChange={this.chooseMethod}>
                    <Select.Option value="search">Search</Select.Option>
                    <Select.Option value="analyse">Analyse</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="column"
                  label="Choose Column"
                  rules={[
                    {
                      required: true,
                      message: 'Please choose a column!',
                    },
                  ]}
                >
                  <Select onChange={this.chooseColumn}>
                    {_.get(this.props, "analytics.fileColumns", []).map((col, index) => {
                      return <Select.Option key={index} value={col}>{col}</Select.Option>
                    })}
                  </Select>
                </Form.Item>
              </Col>

              {this.state.isSearch ?
                <Col span={24}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="operator"
                        label="Operator"
                        rules={[
                          {
                            required: true,
                            message: 'Please choose an operation!',
                          },
                        ]}
                      >
                        <Select onChange={this.chooseComparator}>
                          <Select.Option key={0} value={"==="}>Exact Match</Select.Option>
                          <Select.Option key={1} value={"<"}>Lesser Than</Select.Option>
                          <Select.Option key={2} value={">"}>Greater Than</Select.Option>
                          <Select.Option key={3} value={"<="}>Lesser Than Equal</Select.Option>
                          <Select.Option key={4} value={">="}>Greater Than Equal</Select.Option>
                          <Select.Option key={5} value={"between"}>Between</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    {this.state.comparator === "between" ? (
                      this.state.column === "timeStamp" ? (
                        <Col span={12}>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                name="fromDate"
                                label="From Date"
                                rules={[{ required: true, message: 'Select start date.', }]}
                              >
                                <DatePicker onChange={dt => this.setDate("fromDate", dt)} showTime />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name="toDate"
                                label="To Date"
                                rules={[{ required: true, message: 'Select end date.', }]}
                              >
                                <DatePicker onChange={dt => this.setDate("toDate", dt)} showTime />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                      ) : (
                        <Col span={12}>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                name="from"
                                label="From"
                                rules={[{ required: true, message: 'Please enter a lower boundary(included).', }]}
                              >
                                <Input />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name="to"
                                label="To"
                                rules={[{ required: true, message: 'Please enter an upper boundary(included).', }]}
                              >
                                <Input />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                      )
                    ) : (
                      this.state.column === "timeStamp" ? (
                        <Col span={12}>
                          <Form.Item
                            name="searchValue"
                            label="Date"
                            rules={[{ required: true, message: 'Select a date.', }]}
                          >
                            <DatePicker onChange={dt => this.setDate("searchValue", dt)} showTime />
                          </Form.Item>
                        </Col>
                      ) : (
                        <Col span={12}>
                          <Form.Item
                            name="searchValue"
                            label="Value"
                            rules={[{ required: true, message: 'Please enter a value.', }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                      )
                    )}
                  </Row>
                </Col>
                : null}
              <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    {this.state.isSearch ? "Search" : "Analyse"}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card >

      </div >
    );
  }
}

Analytics.propTypes = {
  loading: PropTypes.bool
};

const withReducer = injectReducer({ key, reducer });
const withSaga = injectSaga({ key, saga });

const mapStateToProps = createStructuredSelector({
  analytics: makeSelectAnalytics()
});

export function mapDispatchToProps(dispatch) {
  return {
    getFileColumns: (db, inode) => dispatch(getFileColumns(db, inode)),
    search: (params) => dispatch(search(params)),
    resetSearch: () => dispatch(resetSearch())
    // deleteFile: (inode, db, parentId) => dispatch(deleteFile(inode, db, parentId)),
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
)(Analytics);
