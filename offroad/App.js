import React, { Component } from 'react';
import {
    StatusBar,
    Platform,
    AppState,
} from 'react-native';
import { compose, createStore, applyMiddleware } from 'redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/es/integration/react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { NavigationActions } from 'react-navigation';

import RootReducer from './js/store';

import StackNavigator from './js/navigators/StackNavigator';

import UploadProgressTimer from './js/timers/UploadProgressTimer';
import UpdateChecker from './js/timers/UpdateChecker';
import HomeButtonListener from './js/utils/HomeButtonListener';
import SimStateListener from './js/utils/SimStateListener';
import DestinationListener from './js/utils/DestinationListener';
import SettingsButtonListener from './js/utils/SettingsButtonListener';
import ThermalListener from './js/utils/ThermalListener';
import AppStateListener from './js/utils/AppStateListener';
import WifiStateListener from './js/utils/WifiStateListener';
import GeocodeListener from './js/utils/GeocodeListener';

import { refreshParams } from './js/store/params/actions';
import { resetToLaunch } from './js/store/nav/actions';
import { updateDate, updateLocation } from './js/store/environment/actions';
import {
    updateSimState,
    updateWifiState,
    updateNavAvailability,
    setDeviceIds,
    refreshDeviceInfo,
    updateSshEnabled,
} from './js/store/host/actions';
import { Params } from './js/config';

import ChffrPlus from './js/native/ChffrPlus';
import { Sentry } from 'react-native-sentry';

import React, { Component } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogButton,
  SlideAnimation,
  ScaleAnimation,
} from 'react-native-popup-dialog';

if (!__DEV__) {
    const sentryDsn = Platform.select({"ios":"https://50043662792c42558b59f761be477b71:79b74f53eaae4b5494e2a3a12b307453@sentry.io/257901","android":"https://50043662792c42558b59f761be477b71:79b74f53eaae4b5494e2a3a12b307453@sentry.io/257901"});
    Sentry.config(sentryDsn).install();
}

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

function createBaseUiStore() {
    let transforms = compose(applyMiddleware(thunk));
    const store = createStore(RootReducer,
                              undefined,
                              transforms);
    let persistor = persistStore(store, { debug: true });
    return { store, persistor };
}

export default class App extends Component {
    state = {
        customBackgroundDialog: false,
        defaultAnimationDialog: false,
        scaleAnimationDialog: false,
        slideAnimationDialog: false,
      };

    constructor(props) {
        super(props);

        const { store, persistor } = createBaseUiStore();
        this.store = store;
        this.persistor = persistor;
        this.onBeforeLift = this.onBeforeLift.bind(this);
    }

    async onBeforeLift() {
        // Called after store is rehydrated from disk
        // TODO/NOTE: exceptions are swallowed in this block, can cause weird bugs during dev.

        this.store.dispatch(setDeviceIds()).then(() => this.store.dispatch(refreshDeviceInfo()));
        this.store.dispatch(resetToLaunch());
        this.store.dispatch(updateDate());
        this.store.dispatch(refreshParams());
        this.store.dispatch(updateSshEnabled());
        AppStateListener.register(this.store.dispatch);
        UploadProgressTimer.start(this.store.dispatch);
        UpdateChecker.start(this.store.dispatch);
        HomeButtonListener.register(this.store.dispatch);
        SimStateListener.register(this.store.dispatch);
        DestinationListener.register(this.store.dispatch);
        SettingsButtonListener.register(this.store.dispatch);
        ThermalListener.register(this.store.dispatch);
        WifiStateListener.register(this.store.dispatch);
        GeocodeListener.register(this.store.dispatch);
    }

    componentDidMount() {
        this.store.dispatch(updateNavAvailability());
        this.store.dispatch(updateSimState());
        this.store.dispatch(updateWifiState());
        StatusBar.setHidden(true);
    }

    componentWillUnmount() {
        UploadProgressTimer.stop();
        HomeButtonListener.unregister();
        SimStateListener.unregister();
        DestinationListener.unregister();
        UpdateChecker.stop();
        SettingsButtonListener.unregister();
        ThermalListener.unregister();
        WifiStateListener.unregister();
        GeocodeListener.unregister();
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                    <View style={styles.container}>
                      <Button
                        title="Show Dialog - Default Animation"
                        onPress={() => {
                          this.setState({
                            defaultAnimationDialog: true,
                          });
                        }}
                      />

                      <Button
                        title="Show Dialog - Scale Animation"
                        onPress={() => {
                          this.setState({
                            scaleAnimationDialog: true,
                          });
                        }}
                      />

                      <Button
                        title="Show Dialog - Slide Animation"
                        onPress={() => {
                          this.setState({
                            slideAnimationDialog: true,
                          });
                        }}
                      />

                      <Button
                        title="Show Dialog - Custom Background Style"
                        onPress={() => {
                          this.setState({
                            customBackgroundDialog: true,
                          });
                        }}
                      />
                    </View>

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

                    <Dialog
                      onTouchOutside={() => {
                        this.setState({ scaleAnimationDialog: false });
                      }}
                      width={0.9}
                      visible={this.state.scaleAnimationDialog}
                      dialogAnimation={new ScaleAnimation()}
                      onHardwareBackPress={() => {
                        console.log('onHardwareBackPress');
                        this.setState({ scaleAnimationDialog: false });
                        return true;
                      }}
                      dialogTitle={
                        <DialogTitle
                          title="Popup Dialog - Scale Animation"
                          hasTitleBar={false}
                        />
                      }
                      actions={[
                        <DialogButton
                          text="DISMISS"
                          onPress={() => {
                            this.setState({ scaleAnimationDialog: false });
                          }}
                          key="button-1"
                        />,
                      ]}
                    >
                      <DialogContent>
                        <Button
                          title="Show Dialog - Default Animation"
                          onPress={() => {
                            this.setState({ defaultAnimationDialog: true });
                          }}
                        />
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      onDismiss={() => {
                        this.setState({ slideAnimationDialog: false });
                      }}
                      onTouchOutside={() => {
                        this.setState({ slideAnimationDialog: false });
                      }}
                      visible={this.state.slideAnimationDialog}
                      dialogTitle={<DialogTitle title="Popup Dialog - Slide Animation" />}
                      dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
                    >
                      <DialogContent>
                        <Text>Slide Animation</Text>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      onDismiss={() => {
                        this.setState({ customBackgroundDialog: false });
                      }}
                      onTouchOutside={() => {
                        this.setState({ customBackgroundDialog: false });
                      }}
                      zIndex={1000}
                      backgroundStyle={styles.customBackgroundDialog}
                      dialogStyle={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
                      }}
                      dialogTitle={
                        <DialogTitle
                          title="Popup Dialog - Custom Background Style"
                          hasTitleBar={false}
                          textStyle={{ color: '#fff' }}
                        />
                      }
                      visible={this.state.customBackgroundDialog}
                    >
                      <View style={styles.dialogContentView}>
                        <Text style={{ color: '#fff' }}>Custom backgroundStyle</Text>
                      </View>
                    </Dialog>
                  </View>
                );


            <Provider store={ this.store }>
                <PersistGate
                    persistor={ this.persistor }
                    onBeforeLift={ this.onBeforeLift }>
                    <StackNavigator />
                </PersistGate>
            </Provider>
        );
    }

}
