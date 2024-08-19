import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

let connected = false;
const fakeNetworkData = {};
const unsynced = [];

NetInfo.fetch().then((state) => {
  connected = state.isConnected;
});

NetInfo.addEventListener((state) => {
  connected = state.isConnected;

  if (connected) {
    unsynced.forEach((key) => {
      AsyncStorage.getItem(key).then((value) => {
        fakeNetworkData[key] = value;
        AsyncStorage.removeItem(key);
      });
    });
    unsynced.length = 0; // Clear the unsynced array
  }
});

export function set(key, value) {
  return new Promise((resolve, reject) => {
    if (connected) {
      fakeNetworkData[key] = value;
      resolve(true);
    } else {
      AsyncStorage.setItem(key, value.toString()).then(
        () => {
          unsynced.push(key);
          resolve(false);
        },
        (err) => reject(err)
      );
    }
  });
}

export function get(key) {
  return new Promise((resolve, reject) => {
    if (connected) {
      resolve(key ? fakeNetworkData[key] : fakeNetworkData);
    } else if (key) {
      AsyncStorage.getItem(key).then(
        (item) => resolve(item),
        (err) => reject(err)
      );
    } else {
      AsyncStorage.getAllKeys().then(
        (keys) =>
          AsyncStorage.multiGet(keys).then(
            (items) => resolve(Object.fromEntries(items)),
            (err) => reject(err)
          ),
        (err) => reject(err)
      );
    }
  });
}
