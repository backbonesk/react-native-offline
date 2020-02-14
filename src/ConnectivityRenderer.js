/* @flow */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { Platform } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import checkInternetAccess from './checkInternetAccess';
import reactConnectionStore from './reactConnectionStore';

type DefaultProps = {
  timeout?: number,
  pingServerUrl?: string,
  pingServerMethod?: string,
  withExtraHeadRequest?: boolean,
};

type Props = DefaultProps & {
  children: (isConnected: boolean) => React$Element<any>,
};

type State = {
  isConnected: boolean,
  unsubscribeNetInfoListener: void,
};

class ConnectivityRenderer extends Component<DefaultProps, Props, State> {
  static propTypes = {
    children: PropTypes.func.isRequired,
    timeout: PropTypes.number,
    pingServerUrl: PropTypes.string,
    pingServerMethod: PropTypes.string,
    withExtraHeadRequest: PropTypes.bool,
  };

  static defaultProps: DefaultProps = {
    timeout: 3000,
    pingServerUrl: 'https://google.com',
    pingServerMethod: 'HEAD',
    withExtraHeadRequest: true,
  };

  state = {
    isConnected: reactConnectionStore.getConnection(),
    unsubscribeNetInfoListener: () => {},
  };

  componentWillMount() {
    if (typeof this.props.children !== 'function') {
      throw new Error('You should pass a function as a children');
    }
    if (typeof this.props.timeout !== 'number') {
      throw new Error('you should pass a number as timeout prop');
    }
    if (typeof this.props.pingServerUrl !== 'string') {
      throw new Error('you should pass a string as pingServerUrl prop');
    }
    if (typeof this.props.pingServerMethod !== 'string') {
      throw new Error('you should pass a string as pingServerMethod prop');
    }
  }

  componentDidMount() {
    const unsubscribeNetInfoListener = NetInfo.addEventListener(state => {
      if (this.props.withExtraHeadRequest){
        this.checkInternet(state.isConnected); 
      } else {
        this.handleConnectivityChange(state.isConnected);
      }
    });
    // On Android the listener does not fire on startup
    if (Platform.OS === 'android') {
      NetInfo.fetch().then(state => {
        if (this.props.withExtraHeadRequest) {
          this.checkInternet(state.isConnected);
        } else {
          this.handleConnectivityChange(state.isConnected);
        }
      });
    }

    this.setState({
      ...this.state,
      unsubscribeNetInfoListener
    })
  }

  componentWillUnmount() {
    this.state.unsubscribeNetInfoListener();
  }

  checkInternet = (isConnected: boolean) => {
    if (isConnected) {
      checkInternetAccess({
        method: this.props.pingServerMethod,
        timeout: this.props.timeout,
        url: this.props.pingServerUrl,
      }).then((hasInternetAccess: boolean) => {
        this.handleConnectivityChange(hasInternetAccess);
      });
    } else {
      this.handleConnectivityChange(isConnected);
    }
  };

  handleConnectivityChange = (isConnected: boolean) => {
    reactConnectionStore.setConnection(isConnected);
    if (isConnected !== this.state.isConnected) {
      this.setState({
        isConnected,
      });
    }
  };

  render() {
    return this.props.children(this.state.isConnected);
  }
}

export default ConnectivityRenderer;
