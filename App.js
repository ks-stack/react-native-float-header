import * as React from 'react';
import {FlatList, Text, View, StatusBar, StyleSheet} from 'react-native';
import FloatHeaderScrollView from './FloatHeaderScrollView';

export default class App extends React.PureComponent {
  renderItem = ({item}) => (
    <Text style={{color: '#000', fontSize: 20, margin: 15}}>{item}</Text>
  );

  renderFloatHeader = () => (
    <View style={{height: 180, backgroundColor: '#E91E63'}} />
  );

  render() {
    return (
      <>
        <StatusBar translucent />
        <Text style={styles.header}>首页</Text>
        <View style={{flex: 1, overflow: 'hidden'}}>
          <FloatHeaderScrollView
            renderFloatHeader={this.renderFloatHeader}
            ScrollComponent={FlatList}
            data={Array(60)
              .fill('')
              .map((v, i) => i)}
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
    marginTop: 25, 
    height: 44,
    fontSize: 18, 
    lineHeight: 44,
    fontWeight: '900',
    textAlign: 'center',
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
  }
});