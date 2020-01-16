import * as React from 'react';
import {FlatList, Text, View, StatusBar, StyleSheet} from 'react-native';
import FloatHeaderScrollView from './FloatHeaderScrollView';

export default class App extends React.PureComponent {
  renderItem = ({item}) => <Text style={{color: '#000', fontSize: 20, margin: 15}}>{item}</Text>

  renderFloatHeader = () => <View style={{height: 180, backgroundColor: '#E91E63'}} />

  render() {
    return (
      <>
        <StatusBar translucent />
        <View style={styles.header}>
          <Text style={styles.title}>首页</Text>
        </View>
        <View style={{flex: 1, overflow: 'hidden'}}>
          <FloatHeaderScrollView
            renderFloatHeader={this.renderFloatHeader}
            ScrollComponent={FlatList}
            data={Array(60).fill('').map((v, i) => i)}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            refreshControl={{
              refreshing: false,
              tintColor: '#FFA700',
            }}
          />
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 25, 
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: 'rgb(166, 166, 166)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
        position: 'relative',
      },
    }),
  },
  title: {
    fontSize: 18, 
    fontWeight: '900',
  },
});