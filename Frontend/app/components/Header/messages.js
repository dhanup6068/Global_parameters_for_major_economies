/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage component.
 */
import { defineMessages } from 'react-intl';

export const scope = 'boilerplate.components.Header';

export default defineMessages({
  mysql: {
    id: `${scope}.mysql`,
    defaultMessage: 'MySQL',
  },
  mongodb: {
    id: `${scope}.mongodb`,
    defaultMessage: 'MongoDB',
  },
  firebase: {
    id: `${scope}.firebase`,
    defaultMessage: 'Firebase',
  }
});
