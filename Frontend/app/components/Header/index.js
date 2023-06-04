import React from 'react';
import { FormattedMessage } from 'react-intl';

import NavBar from './NavBar';
import HeaderLink from './HeaderLink';
import messages from './messages';

function Header() {
  return (
    <div>
      <NavBar>
        <HeaderLink to="/">
          <FormattedMessage {...messages.mysql} />
        </HeaderLink>
        <HeaderLink to="/mongodb">
          <FormattedMessage {...messages.mongodb} />
        </HeaderLink>
        <HeaderLink to="/firebase">
          <FormattedMessage {...messages.firebase} />
        </HeaderLink>
      </NavBar>
    </div>
  );
}

export default Header;
