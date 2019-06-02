import React, { Component } from 'react';
import {
    Linking,
    Text,
    View,
} from 'react-native';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';

import { Button, StyleSheet } from 'react-native';
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogButton,
  SlideAnimation,
  ScaleAnimation,
} from 'react-native-popup-dialog';

// Native Modules
import ChffrPlus from '../../native/ChffrPlus';

// Utils
import pluralize from '../../utils/pluralize';
import { farenToCel } from '../../utils/conversions';
import { formatSize } from '../../utils/bytes';

// UI
import { HOME_BUTTON_GRADIENT } from '../../styles/gradients';
import X from '../../themes';
import Styles from './HomeStyles';
import PrimaryButton from '../PrimaryButton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogContentView: {
    // flex: 1,
    paddingLeft: 18,
    paddingRight: 18,
    // backgroundColor: '#000',
    // opacity: 0.4,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  navigationBar: {
    borderBottomColor: '#b5b5b5',
    borderBottomWidth: 0.5,
    backgroundColor: '#ffffff',
  },
  navigationTitle: {
    padding: 10,
  },
  navigationButton: {
    padding: 10,
  },
  navigationLeftButton: {
    paddingLeft: 20,
    paddingRight: 40,
  },
  navigator: {
    flex: 1,
    // backgroundColor: '#000000',
  },
  customBackgroundDialog: {
    opacity: 0.5,
    backgroundColor: '#000',
  },
});

class Home extends Component {
    state = {
            customBackgroundDialog: false,
            defaultAnimationDialog: false,
            scaleAnimationDialog: false,
            slideAnimationDialog: false,
          };

    static navigationOptions = {
      header: null,
    };

    handlePressedStartDrive = () => {
        this.props.onNewDrivePressed();
    }

    handlePressedSettings = () => {
        ChffrPlus.sendBroadcast("ai.comma.plus.offroad.NAVIGATED_TO_SETTINGS");
        this.props.openSettings();
    }

    renderTestDialog() {
        const {
            remoteUpdate
        } = this.props;
        if (!remoteUpdate) {
            return null;
        } else {
            this.setState({
                defaultAnimationDialog: true,
            });
        }

        return (
          <View style={{ flex: 1 }}>
            <Dialog
              onDismiss={() => {
                this.setState({ defaultAnimationDialog: false });
              }}
              width={0.9}
              visible={this.state.defaultAnimationDialog}
              rounded
              actionsBordered
              // actionContainerStyle={{
              //   height: 100,
              //   flexDirection: 'column',
              // }}
              dialogTitle={
                <DialogTitle
                  title="Popup Dialog - Default Animation"
                  style={{
                    backgroundColor: '#F7F7F8',
                  }}
                  hasTitleBar={false}
                  align="left"
                />
              }
              footer={
                <DialogFooter>
                  <DialogButton
                    text="CANCEL"
                    bordered
                    onPress={() => {
                      this.setState({ defaultAnimationDialog: false });
                    }}
                    key="button-1"
                  />
                  <DialogButton
                    text="OK"
                    bordered
                    onPress={() => {
                      this.setState({ defaultAnimationDialog: false });
                    }}
                    key="button-2"
                  />
                </DialogFooter>
              }
            >
              <DialogContent
                style={{
                  backgroundColor: '#F7F7F8',
                }}
              >
                <Text>Default Animation</Text>
                <Text>No onTouchOutside handler. will not dismiss when touch overlay.</Text>
              </DialogContent>
            </Dialog>
          </View>
        );
      }

    renderNewDestination() {
        const { destination } = this.props;

        return (
            <PrimaryButton
                onPress={ this.props.onNewDestinationPressed }>
                { destination !== null ?
                    <View style={ Styles.homeActionsPrimaryButtonBody }>
                        <X.Text
                            color='white'
                            weight='light'
                            size='small'
                            style={ Styles.homeActionsPrimaryButtonHeader }>
                            Destination:
                        </X.Text>
                        { destination.address.length > 0
                            && destination.city.length > 0
                            && destination.state.length > 0 ?
                            <View>
                                <X.Text
                                    color='white'>
                                    { destination.address }
                                </X.Text>
                                <X.Text
                                    color='white'>
                                    { `${ destination.city }, ${ destination.state }` }
                                </X.Text>
                            </View>
                            :
                            <X.Text
                                color='white'>
                                { destination.title }
                            </X.Text>
                        }
                        <View style={ Styles.homeActionsPrimaryButtonOption }>
                            <View style={ Styles.homeActionsPrimaryButtonOptionIcon }>
                                <X.Image
                                    source={ require('../../img/icon_plus.png') } />
                            </View>
                            <X.Text
                                color='white'
                                size='small'
                                weight='semibold'>
                                New Destination
                            </X.Text>
                        </View>
                    </View>
                    :
                    <View style={ Styles.homeActionsPrimaryButtonBody }>
                        <View style={ Styles.homeActionsPrimaryButtonIcon }>
                            <X.Image
                                source={ require('../../img/icon_plus.png') } />
                        </View>
                        <X.Text
                            color='white'
                            weight='semibold'
                            size='medium'>
                            New Destination
                        </X.Text>
                    </View>
                }
            </PrimaryButton>
        );
    }

    renderDrivePrompt() {
        return (
          <PrimaryButton
              onPress={ this.handlePressedStartDrive }>
              <View style={ Styles.homeActionsPrimaryButtonBody }>
                  <View style={ Styles.homeActionsPrimaryButtonIcon }>
                      <X.Image
                          source={ require('../../img/icon_plus.png') } />
                  </View>
                  <X.Text
                      color='white'
                      weight='semibold'
                      size='medium'>
                      New Drive
                  </X.Text>
              </View>
          </PrimaryButton>
        );
    }

    renderUploadStatus() {
        const {
            uploadsPrettySizeOnDisk,
        } = this.props;

        if (uploadsPrettySizeOnDisk > 0) {
            return (
                <X.Text
                    color='white'
                    size='small'
                    weight='light'>
                    { uploadsPrettySizeOnDisk } to upload
                </X.Text>
            );
        } else {
            return null;
        }
    }

    render() {
        const {
            isPaired,
            destination,
            isNavAvailable,
            summaryDate,
            summaryCity,
        } = this.props;

        return (
            <X.Gradient color='dark_blue'>
                <View style={ Styles.home }>
                    <View style={ Styles.homeWelcome }>
                        <View style={ Styles.homeWelcomeSummary }>
                            <View style={ Styles.homeWelcomeSummaryDate }>
                                <X.Text
                                    color='white'
                                    weight='light'>
                                    { summaryDate }
                                </X.Text>
                            </View>
                            <View style={ Styles.homeWelcomeSummaryCity }>
                                <X.Text
                                    color='white'
                                    size={ summaryCity.length > 20 ? 'big' : 'jumbo' }
                                    numberOfLines={ 1 }
                                    weight='semibold'>
                                    { summaryCity }
                                </X.Text>
                            </View>
                            { this.renderUploadStatus() }
                        </View>
                    </View>
                    <View style={ Styles.homeActions }>
                        <View style={ Styles.homeActionsPrimary }>
                            { this.renderDrivePrompt() }
                        </View>
                        <View style={ Styles.homeActionsSecondary }>
                            <View style={ Styles.homeActionsSecondaryAction }>
                                <X.Button
                                    color='transparent'
                                    size='full'
                                    onPress={ isPaired ? null : this.props.openPairing }>
                                    <X.Gradient
                                        colors={ HOME_BUTTON_GRADIENT }
                                        style={ Styles.homeActionsSecondaryButton }>
                                        { isPaired ?
                                            <View style={ Styles.homeActionsSecondaryButtonBody }>
                                                <View style={ Styles.homeActionsSecondaryButtonIcon }>
                                                    <X.Image
                                                        source={ require('../../img/icon_road.png') } />
                                                </View>
                                                <X.Text
                                                    color='white'
                                                    weight='semibold'>
                                                    EON Paired
                                                </X.Text>
                                            </View>
                                            :
                                            <View style={ Styles.homeActionsSecondaryButtonBody }>
                                                <View style={ Styles.homeActionsSecondaryButtonIcon }>
                                                    <X.Image
                                                        source={ require('../../img/icon_user.png') } />
                                                </View>
                                                <X.Text
                                                    color='white'
                                                    weight='semibold'>
                                                    Pair EON
                                                </X.Text>
                                            </View>
                                        }
                                    </X.Gradient>
                                </X.Button>
                            </View>
                            <View style={ Styles.homeActionsSecondaryAction }>
                                <X.Button
                                    color='transparent'
                                    size='full'
                                    onPress={ this.handlePressedSettings }>
                                    <X.Gradient
                                        colors={ HOME_BUTTON_GRADIENT }
                                        style={ Styles.homeActionsSecondaryButton }>
                                        <View style={ Styles.homeActionsSecondaryButtonBody }>
                                            <View style={ Styles.homeActionsSecondaryButtonIcon }>
                                                <X.Image
                                                    source={ require('../../img/icon_settings.png') } />
                                            </View>
                                            <X.Text
                                                color='white'
                                                weight='semibold'>
                                                Settings
                                            </X.Text>
                                        </View>
                                    </X.Gradient>
                                </X.Button>
                            </View>
                        </View>
                    </View>
                </View>
            </X.Gradient>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isPaired: state.host.device && state.host.device.is_paired,
        destination: state.driving.destination,
        isNavAvailable: state.host.isNavAvailable,
        uploadsPrettySizeOnDisk: formatSize(state.host.thermal.unuploadedBytes),
        latitude: state.environment.latitude,
        longitude: state.environment.longitude,
        summaryCity: state.environment.city,
        summaryDate: state.environment.date,
    };
};

const mapDispatchToProps = (dispatch) => ({
    openSettings: () => {
        dispatch(NavigationActions.navigate({ routeName: 'Settings' }));
    },
    openPairing: () => {
        dispatch(NavigationActions.navigate({ routeName: 'PairAfterSetup' }))
    },
    openDrives: () => {
        dispatch(NavigationActions.navigate({ routeName: 'DrivesOverview' }));
    },
    onNewDestinationPressed: () => {
        ChffrPlus.sendBroadcast("ai.comma.plus.frame.NEW_DESTINATION");
    },
    onNewDrivePressed: () => {
        ChffrPlus.sendBroadcast("ai.comma.plus.frame.ACTION_SHOW_START_CAR");
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
