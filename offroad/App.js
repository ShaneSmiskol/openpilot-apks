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
