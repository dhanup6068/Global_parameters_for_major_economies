/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Switch, Route, Redirect } from 'react-router-dom';
import 'antd/dist/antd.css';
import ListFiles from '../ListFiles/Loadable';
import AddFolder from '../AddFolder/Loadable';
import AddFile from '../AddFile/Loadable';
import HomePage from '../../containers/HomePage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import Cat from '../Cat/Loadable';
import Header from '../../components/Header';
import Analytics from '../Analytics/Loadable.js';
import Footer from 'components/Footer';

import GlobalStyle from '../../global-styles';

const AppWrapper = styled.div`
  max-width: 80%;
  margin: 0 auto;
  display: flex;
  min-height: 100%;
  padding: 0 16px;
  flex-direction: column;
`;

export default function App() {
  return (
    <AppWrapper>
      <Helmet
        titleTemplate="%s - EDFS group 75"
        defaultTitle="React.js Boilerplate"
      >
        <meta name="description" content="A React.js Boilerplate application" />
      </Helmet>
      <Header />
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/mysql" />} />
        {/* <Route exact path="/mysql" component={MySqlPage} /> */}
        <Route exact path="/:db" component={ListFiles} />
        <Route exact path="/:db/addFolder/:parentId" component={AddFolder} />
        <Route exact path="/:db/addFile/:parentId" component={AddFile} />
        <Route exact path="/:db/cat/:ext/:inode" component={Cat} />
        <Route exact path="/:db/analytics/:ext/:inode" component={Analytics} />
        {/* <Route path="/features" component={FeaturePage} /> */}
        <Route path="" component={NotFoundPage} />
      </Switch>
      {/* <Footer /> */}
      <GlobalStyle />
    </AppWrapper>
  );
}
