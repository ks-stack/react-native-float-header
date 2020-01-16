import * as React from 'react';
import {View, StyleSheet, Platform, RefreshControl} from 'react-native';
import Animated from 'react-native-reanimated';

const {
  event,
  Value,
  diffClamp,
  multiply,
  cond,
  set,
  add,
  startClock,
  clockRunning,
  stopClock,
  Clock,
  sub,
  lessThan,
  spring,
  max,
  eq,
  or,
  min,
  onChange,
} = Animated;

let FloatHeaderHeight = 0;
const AnimatedFloatHeaderHeight = new Value(FloatHeaderHeight);
const IsDraging = new Value(0);
const ContainerHeight = new Value(0);
const ScrollHeight = new Value(0);

function runSpring({
  clock,
  from,
  velocity,
  toValue,
  snapOffset,
  diffClampNode,
}) {
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };

  const config = {
    damping: 1,
    mass: 1,
    stiffness: 50,
    overshootClamping: true,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
    toValue: new Value(0),
  };

  return [
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.velocity, velocity),
      set(state.position, from),
      set(config.toValue, toValue),
      startClock(clock),
    ]),
    spring(clock, state, config),
    cond(state.finished, [
      set(
        snapOffset,
        cond(
          eq(toValue, 0),
          add(snapOffset, multiply(diffClampNode, -1)),
          add(snapOffset, sub(AnimatedFloatHeaderHeight, diffClampNode)),
        ),
      ),
      stopClock(clock),
    ]),
    state.position,
  ];
}

export default class FloatHeaderScrollView extends React.PureComponent {
  constructor(props) {
    super(props);
    const {ScrollComponent, floatHeaderHeight} = this.props;
    if (floatHeaderHeight) {
      FloatHeaderHeight = floatHeaderHeight;
      AnimatedFloatHeaderHeight.setValue(floatHeaderHeight);
    }
    this.AnimatedScrollComponent = Animated.createAnimatedComponent(
      ScrollComponent,
    );
    this.scrollY = new Value(0);
    this.snapOffset = new Value(0);

    const diffClampNode = diffClamp(
      add(
        min(max(sub(ScrollHeight, ContainerHeight), 0), max(this.scrollY, 0)),
        this.snapOffset,
      ),
      0,
      AnimatedFloatHeaderHeight,
    );

    const inverseDiffClampNode = multiply(diffClampNode, -1);

    const clock = new Clock();

    const snapPoint = cond(
      or(
        lessThan(this.scrollY, AnimatedFloatHeaderHeight),
        lessThan(diffClampNode, multiply(AnimatedFloatHeaderHeight, 0.5)),
      ),
      0,
      multiply(AnimatedFloatHeaderHeight, -1),
    );

    this.headerTranslateY = cond(IsDraging, inverseDiffClampNode, [
      onChange(this.scrollY, stopClock(clock)),
      runSpring({
        clock,
        from: inverseDiffClampNode,
        velocity: 0,
        toValue: snapPoint,
        snapOffset: this.snapOffset,
        diffClampNode,
      }),
    ]);
    this.state = {
      paddingTop: null,
    };
  }

  measureHeader = e => {
    FloatHeaderHeight = e.nativeEvent.layout.height;
    AnimatedFloatHeaderHeight.setValue(FloatHeaderHeight);
    this.setState(
      {
        paddingTop: FloatHeaderHeight,
      },
      () => {
        if (Platform.OS === 'ios') {
          setTimeout(() => {
            if (this.animatedScrollComponent._component.scrollToOffset) {
              this.animatedScrollComponent._component.scrollToOffset({
                offset: -FloatHeaderHeight,
                animated: false,
              });
            } else if (this.animatedScrollComponent._component.scrollTo) {
              this.animatedScrollComponent._component.scrollTo({
                y: -FloatHeaderHeight,
                animated: false,
              });
            }
          });
        }
      },
    );
  };

  onScrollEndDrag = () => {
    IsDraging.setValue(0);
  };

  onScrollBeginDrag = () => {
    IsDraging.setValue(1);
  };

  containerOnLayout = e => {
    ContainerHeight.setValue(e.nativeEvent.layout.height + FloatHeaderHeight);
  };

  render() {
    const {renderFloatHeader, refreshControl} = this.props;
    const {paddingTop} = this.state;
    const AnimatedScrollComponent = this.AnimatedScrollComponent;
    return (
      <View style={styles.container}>
        {paddingTop && (
          <AnimatedScrollComponent
            {...this.props}
            scrollEventThrottle={1}
            onLayout={this.containerOnLayout}
            contentInset={{
              top: paddingTop,
              bottom: 0,
              left: 0,
              right: 0,
            }}
            scrollIndicatorInsets={{
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
            ref={v => {
              this.animatedScrollComponent = v;
            }}
            contentContainerStyle={{
              paddingTop: Platform.OS === 'ios' ? 0 : paddingTop,
            }}
            refreshControl={
              <RefreshControl
                {...refreshControl}
                progressViewOffset={paddingTop}
              />
            }
            onScroll={event(
              [
                {
                  nativeEvent: {
                    contentOffset: {
                      y: this.scrollY,
                    },
                    contentSize: {
                      height: ScrollHeight,
                    },
                  },
                },
              ],
              {useNativeDriver: true},
            )}
            onScrollEndDrag={this.onScrollEndDrag}
            onScrollBeginDrag={this.onScrollBeginDrag}
          />
        )}
        <Animated.View
          onLayout={this.measureHeader}
          style={[
            styles.header,
            {transform: [{translateY: this.headerTranslateY}]},
          ]}>
          {renderFloatHeader()}
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
