import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import cx from 'classnames';
import { withModalMounter } from '/imports/ui/components/modal/service';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles.scss';
import Button from '../button/component';
import RecordingIndicator from './recording-indicator/container';
import TalkingIndicatorContainer from '/imports/ui/components/nav-bar/talking-indicator/container';
import SettingsDropdownContainer from './settings-dropdown/container';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import DesktopShare from '../actions-bar/desktop-share/component';
import JoinVideoOptionsContainer2 from '../video-provider/video-button2/container';


const intlMessages = defineMessages({
  toggleUserListLabel: {
    id: 'app.navBar.userListToggleBtnLabel',
    description: 'Toggle button label',
  },
  toggleUserListAria: {
    id: 'app.navBar.toggleUserList.ariaLabel',
    description: 'description of the lists inside the userlist',
  },
  newMessages: {
    id: 'app.navBar.toggleUserList.newMessages',
    description: 'label for toggleUserList btn when showing red notification',
  },
});

const propTypes = {
  presentationTitle: PropTypes.string,
  hasUnreadMessages: PropTypes.bool,
  shortcuts: PropTypes.string,
};

const defaultProps = {
  presentationTitle: 'Default Room Title',
  hasUnreadMessages: false,
  shortcuts: '',
};

class NavBar extends PureComponent {
  static handleToggleUserList() {
    Session.set(
      'openPanel',
      Session.get('openPanel') !== ''
        ? ''
        : 'userlist',
    );
    Session.set('idChatOpen', '');
  }

  componentDidMount() {
    const {
      processOutsideToggleRecording,
      connectRecordingObserver,
    } = this.props;

    if (Meteor.settings.public.allowOutsideCommands.toggleRecording
      || getFromUserSettings('bbb_outside_toggle_recording', false)) {
      connectRecordingObserver();
      window.addEventListener('message', processOutsideToggleRecording);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const {
      handleExitVideo,
      handleJoinVideo,
      handleExitVideo2,
      handleJoinVideo2,
      handleShareScreen,
      handleUnshareScreen,
      isVideoBroadcasting,
      amIPresenter,
      screenSharingCheck,
      screenShareEndAlert,
      isMeteorConnected,
      screenshareDataSavingSetting,
      
      enableVideo,
      enableVideo2,
      hasUnreadMessages,
      isExpanded,
      intl,
      shortcuts: TOGGLE_USERLIST_AK,
      mountModal,
      presentationTitle,
      amIModerator,
    } = this.props;


    const toggleBtnClasses = {};
    toggleBtnClasses[styles.btn] = true;
    toggleBtnClasses[styles.btnWithNotificationDot] = hasUnreadMessages;

    let ariaLabel = intl.formatMessage(intlMessages.toggleUserListAria);
    ariaLabel += hasUnreadMessages ? (` ${intl.formatMessage(intlMessages.newMessages)}`) : '';

    return (
      <div className={styles.navbar}>
        <div className={styles.left}>
          <Button
            data-test="userListToggleButton"
            onClick={NavBar.handleToggleUserList}
            ghost
            circle
            hideLabel
            label={intl.formatMessage(intlMessages.toggleUserListLabel)}
            aria-label={ariaLabel}
            icon="user"
            className={cx(toggleBtnClasses)}
            aria-expanded={isExpanded}
            accessKey={TOGGLE_USERLIST_AK}
          />
        </div>
        <div className={styles.center}>
          <AudioControlsContainer />
          <span className={styles.presentationTitleSeparator1} aria-hidden></span>
          {enableVideo
            ? (
              <JoinVideoOptionsContainer
                handleJoinVideo={handleJoinVideo}
                handleCloseVideo={handleExitVideo}
              />
            )
            : null}
            {enableVideo2
              ? (
                <JoinVideoOptionsContainer2
                  handleJoinVideo={handleJoinVideo}
                  handleCloseVideo={handleExitVideo}
                />
              )
              : null}
            <span className={styles.presentationTitleSeparator1} aria-hidden></span>
          <DesktopShare {...{
              handleShareScreen,
              handleUnshareScreen,
              isVideoBroadcasting,
              amIPresenter,
              screenSharingCheck,
              screenShareEndAlert,
              isMeteorConnected,
              screenshareDataSavingSetting,
            }}
            />
          <RecordingIndicator
            mountModal={mountModal}
            amIModerator={amIModerator}
          />
        </div>
        <div className={styles.right}>
        <h1 className={styles.presentationTitle}>{presentationTitle}</h1>
          <SettingsDropdownContainer amIModerator={amIModerator} />
        </div>
        <TalkingIndicatorContainer />
      </div>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;
export default withShortcutHelper(withModalMounter(injectIntl(NavBar)), 'toggleUserList');
