import React, { Component, PureComponent } from 'react'
import {
    View,
    Text,
    Animated,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet
} from 'react-native'
import ScrollAbleTabView from 'react-native-scrollable-tab-view'
import { px2dp, isIPhoneX, getBottomSpace, deviceWidth, isIos } from 'react-native-style-adaptive'

class Tab extends PureComponent {
    static defaultProps = {
        tabStyle: {
            content: {},
            text: {},
            line: {}
        }
    }
    constructor () {
        super()

        this.state = {
            tabWidth: px2dp(80),
            progress: new Animated.Value(px2dp(32))
        }

        this.touchRefs = []
        this.list = []
        this.list_len = 0
        this.contentOffsetX = 0
        this.onScrollEnd = this.onScrollEnd.bind(this)
        this.onAndroidScrollEnd = this.onAndroidScrollEnd.bind(this)
    }

    render() {
        const { activeColor, switchTabs, activeTab, tabStyle } = this.props

        return (
            <View style={ [tabStyles.container, tabStyle.content] }>
                <ScrollView
                    ref={ ref => this.scrollView = ref }
                    style={ { flex: 1 } }
                    horizontal
                    showsHorizontalScrollIndicator={ false }
                    alwaysBounceHorizontal={ false }
                    onMomentumScrollEnd={ this.onScrollEnd }
                    onScroll={ this.onAndroidScrollEnd }
                    scrollEventThrottle={15}
                >
                    {
                        switchTabs.map((tab, i) => {
                            return <TouchableOpacity
                                ref={ ref => this.touchRefs[i] = ref }
                                style={ tabStyles.tabJoke }
                                activeOpacity={ 0.9 }
                                key={ tab + i }
                                onPress={ () => this.tabOnPress(i) }
                                onLayout={ e => this.setListLayout(e.nativeEvent, i) }
                                removeClippedSubviews={false}
                            >
                                <Text style={ [tabStyles.text, tabStyle.text, activeTab == i && { color: activeColor }]}>
                                    { tab }
                                </Text>
                            </TouchableOpacity>
                        })
                    }
                    <Animated.View 
                        style={[
                            tabStyles.line, tabStyle.line, { 
                                backgroundColor: activeColor,
                                width: this.state.tabWidth,
                                left: this.state.progress
                            }
                        ]}
                    />
                </ScrollView>
            </View>

        )
    }

    componentDidUpdate () {
        this.load()
    }

    componentDidMount () {
        this.load()
    }

    load () {
        this.setX(this.props.activeTab)
        this.animation()
    }

    setListLayout(e, i) {
        this.list[i] = e.layout.width
        this.list_len = this.list.reduce((prev, next) => prev + next, 0)
    }

    setX(i) {
        let len = 0

        for (let index = 0; index < i; index++) len += this.list[index]

        if (len > deviceWidth() / 2 && len < this.list_len - deviceWidth() / 2) {
            this.scrollView.scrollTo({ x: len })
        } else if (len > this.list_len - deviceWidth() / 2) {
            this.scrollView.scrollToEnd()
        } else {
            this.scrollView.scrollTo({ x: 0 })
        }
    }

    animation () {
        this.state.progress.stopAnimation()
        this.touchRefs[this.props.activeTab].measure((frameX, frameY, width, height, pageX, pageY) => {
            this.setState({ tabWidth: width })
            this.animated = Animated.spring(
                this.state.progress,
                {
                    toValue: pageX + this.contentOffsetX,
                    velocity: 20,
                    tension: 10,
                }
            ).start()
        })
    }

    tabOnPress (i) {
        this.props.goToPage(i)
        this.setX(i)
        this.animation()
    }
    
    onScrollEnd (e) {
        this.contentOffsetX = e.nativeEvent.contentOffset.x
    }

    onAndroidScrollEnd (e) {
        if (isIos) return

        this.contentOffsetX = e.nativeEvent.contentOffset.x
        this.animation()
    }

    componentWillUnmount () {
        this.state.progress.stopAnimation()
    }
}

const tabStyles = StyleSheet.create({
    container: {
        height: px2dp(80),
        borderBottomColor: '#EEE',
        borderBottomWidth: 1,
        position: 'relative',
        backgroundColor: '#fff'
    },
    tabJoke: {
        height: px2dp(80),
        marginHorizontal: px2dp(32),
        flexDirection: 'row',
        alignItems: 'center'
    },
    line: {
        position: 'absolute',
        height: 2,
        bottom: 0
    },
    text: {
        fontSize: px2dp(28),
        color: '#252426'
    }
})

export default class extends Component {
    static defaultProps = {
        listStyle: {
            content: {},
            text: {}
        },
        activeColor: '#e4393c'
    }
    

    constructor (props) {
        super(props)

        this.state = {
            page: props.initPage,
            address: props.address,
            tabs: props.tabs,
            loading: false,
            tags: props.tags || []
        }
    }

    selected (item, index, i) {
        let newTabs = this.state.tabs
        let tags = this.state.tags.splice(0, index)

        newTabs[this.state.page] = typeof item === 'object' ? item.name : item
        
        tags[index] = i
        
        this.setState({ tabs: newTabs, loading: true, tags }, () => {
            this.props.selected(item, index + 1, newTabs)
        })
    }

    _renderOptions (index) {
        const { listStyle, activeColor } = this.props
        const address = this.state.address[index] || []

        return address.map((item, i) => <TouchableOpacity 
            style={ [styles.list, listStyle.content] }
            key={ i + index }
            activeOpacity={ 1 }
            onPress={ () => this.selected(item, index, i) }
        >
            <Text style={ [styles.listText, listStyle.text, this.state.tags[index] === i && { color: activeColor }] }>
                { typeof item === 'string' ? item : item.name }
            </Text>
        </TouchableOpacity>)
    }

    _renderTabView () {
        return this.state.tabs.map((item, index) => <ScrollView
            style={ styles.content }
            showsVerticalScrollIndicator={ false }
            key={ index }
            tabLabel={ item || this.props.prompt }
        >
            { this._renderOptions(index) }
        </ScrollView>)
    }

    setNativeProps (singleAddress) {
        let newTabs = []
        let newAddress = []

        const { page, tabs, address } = this.state

        if (page < tabs.length - 1) {
            newTabs = tabs.splice(0, page + 1)
            newAddress = address.splice(0, page + 1)
        } else {
            newTabs = tabs
            newAddress = address
        }

        this.setState({
            address: [...newAddress, singleAddress],
            tabs: [...newTabs, this.props.prompt],
            page: page + 1,
            loading: false
        })
    }

    render () {
        const { page, tabs } = this.state
        const { style, initPage, tabStyle, activeColor } = this.props
        return (
            <View style={ [styles.container, style] }>
                <ScrollAbleTabView
                    style={ styles.main }
                    locked
                    initialPage={ isIos ? initPage : page }
                    renderTabBar={ () => <Tab
                        activeTab={ page }
                        switchTabs={ tabs }
                        tabStyle={ tabStyle }
                        activeColor={ activeColor }
                    /> }
                    page={ page }
                    onChangeTab={ ({ i }) => this.setState({ page: i }) }
                >
                    { this._renderTabView() }
                </ScrollAbleTabView>
                {
                    this.state.loading && <View style={ styles.loading }>
                        { this.props.loading && <ActivityIndicator size="large" color="#ccc" /> }
                    </View>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        paddingBottom: isIPhoneX ? getBottomSpace() : 0
    },
    main: {
        flex: 1
    },
    content: {
        paddingHorizontal: px2dp(32),
        marginVertical: px2dp(10)
    },
    list: {
        paddingVertical: px2dp(33)
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    listText: {
        color: '#333',
        fontSize: px2dp(28)
    }
})