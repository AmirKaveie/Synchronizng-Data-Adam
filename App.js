import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { set, get } from './store';
import NetInfo from '@react-native-community/netinfo';

const boolMap = {
  'true': true,
  'false': false,
};

export default function App() {
  const [message, setMessage] = useState(null);
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);
  const [third, setThird] = useState(false);

  const setters = new Map([
    ['first', setFirst],
    ['second', setSecond],
    ['third', setThird],
  ]);

  function save(key) {
    return (value) => {
      set(key, value).then(
        (connected) => {
          setters.get(key)(value);
          setMessage(connected ? null : 'Saved Offline');
        },
        (err) => {
          setMessage(err);
        }
      );
    };
  }

  useEffect(() => {
    NetInfo.fetch().then(() =>
      get().then(
        (items) => {
          for (let [key, value] of Object.entries(items)) {
            setters.get(key)(boolMap[value]);
          }
        },
        (err) => {
          setMessage(err);
        }
      )
    );
  }, []);

  return (
    <View style={styles.container}>
      <Text>{message}</Text>
      <View style={styles.switchContainer}>
        <Text>First</Text>
        <Switch
          value={first}
          onValueChange={save('first')}
        />
      </View>
      <View style={styles.switchContainer}>
        <Text>Second</Text>
        <Switch
          value={second}
          onValueChange={save('second')}
        />
      </View>
      <View style={styles.switchContainer}>
        <Text>Third</Text>
        <Switch
          value={third}
          onValueChange={save('third')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  switchContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
});
