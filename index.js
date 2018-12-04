import React, { Component } from 'react'
import {
    View,
    Text,
    Image,
    Modal,
    Animated,
    TouchableOpacity,
    ActivityIndicator,
    TouchableWithoutFeedback,
    StyleSheet
} from 'react-native'

import { deviceWidth, deviceHeight, px2dp } from 'react-native-style-adaptive'

import TabView from './TabView'

const Icon = require('./icon-close-base')

export default class extends Component {
    static defaultProps = {
        prompt: '请选择',
        titleStyle: {
            content: {},
            text: {}
        },
        loading: true
    }
    
    constructor (props) {
        super(props)

        this.initH = parseInt(deviceHeight() * 4 / 6)

        this.state = {
            progress: new Animated.Value(this.initH),
            visible: false,
            initPage: 0,
            address: [],
            tabs: [],
            tags: []
        }

        this.timer = null
        this.onBackClicked = this.onBackClicked.bind(this)
        this.setAddress = this.setAddress.bind(this)
    }

    async load () {
        let tabs = this.props.tabs.length ? this.props.tabs : [this.props.prompt]
        let address = new Array(tabs.length)
        let tags = this.state.tags

        await tabs.reduce(async (prev, next, index) => {
            if (!prev && !!index) return null
            
            const eachAddress = await this.getAddress(await prev, index)
            const result = await this._than(eachAddress, next)
            const tag = parseInt(result.key)

            address[index] = eachAddress
            tags[index] = isNaN(tag) ? '' : tag

            return result.option
        }, null)

        this.setState({ address, tags, tabs, initPage: tabs.length - 1 })
    }

    _than (data, target) {
        if (!target && target != 0) return { option: null, key: '' }

        if (Array.isArray(data)) {
            for (let key of Object.keys(data)) {
                if (typeof target === 'object') {
                    if (data[key] === target) {
                        return { option: data[key], key }
                    } else {
                        return this._deepComparison(data[key], target)
                    }
                } else {
                    if (data[key] === target) return { option: data[key], key }

                    if (typeof data[key] === 'object') {
                        for (let keys of Object.keys(data[key])) {
                            if (data[key][keys] === target) {
                                return { option: data[key], key }
                            }
                        }
                    }
                }
            }
        }

        return { option: null, key: '' }
    }

    _deepComparison (data, target) {
        if (Object.prototype.toString(data) !== Object.prototype.toString(target)) return { option: null, key: '' }

        for (let key of Object.keys(data)) {
            if (data[key] === target[key]) return { option: data[key], key }
        }

        return { option: null, key: '' }
    }

    async getAddress (target, index, tabs) {
        const address = await this.props.load(target, index)

        if (!address) {
            this.setState({ tabs, initPage: tabs.length - 1 })
            this.props.result(tabs)
            this.close()

            return false
        }

        if (!Array.isArray(address)) throw Error(`The load method expects an Array type value, but it is actually an ${Object.prototype.toString.call(address).match(/^\[object (.*?)\]$/)[1] } type value`)

        return address
    }

    async setAddress (target, index, tabs) {

        const address = await this.getAddress(target, index, tabs)

        if (!address) return false
        
        await this.tabView.setNativeProps(address)
    }
    
    render () {
        const { visible, progress, initPage, address, tags, tabs } = this.state
        const { titleStyle, contentStyle, prompt, listStyle, tabStyle, activeColor, loading } = this.props

        return (
            <Modal
                animationType="none"
                transparent={ true }
                visible={ visible }
                onRequestClose={ () => this.onBackClicked.bind(this) }
                style={ styles.container }
            >
                <TouchableWithoutFeedback
                    onPress={ () => this.close() }
                >
                    <Animated.View
                        style={ [styles.mask, {
                            opacity: progress.interpolate({
                                inputRange:[0, this.initH],
                                outputRange:[0.7, 0]
                            })
                        }] }
                    />
                </TouchableWithoutFeedback>
                <Animated.View style={ [styles.content, {
                    transform: [
                        { translateY: progress }
                    ]
                }] }>
                    <View style={ [styles.titleMain, titleStyle.content] }>
                        <Text style={ [styles.title, titleStyle.text] }>配送至</Text>
                        <TouchableOpacity style={ styles.icons } activeOpacity={0.8} onPress={() => this.close()}>
                            <Image
                                style={ styles.close }
                                source={ { uri: Icon } }
                            />
                        </TouchableOpacity>
                    </View>
                    { !tabs.length ? 
                        <View style={ [styles.tabViewLoad, contentStyle] }>
                            <ActivityIndicator size="large" color="#ccc" />
                        </View>
                        : <TabView
                            style={ [styles.tabView, contentStyle] }
                            ref={ ref => this.tabView = ref }
                            initPage={ initPage }
                            address={ address }
                            tags={ tags }
                            selected={ this.setAddress }
                            tabs={ tabs }
                            prompt={ prompt }
                            listStyle={ listStyle }
                            tabStyle={ tabStyle }
                            activeColor={ activeColor }
                            loading={ loading }
                        />}
                </Animated.View>
            </Modal>
        )
    }

    onBackClicked () {
        this.close()
    }

    open () {
        this.load()
        this.setState({ visible: true }, () => {
            Animated.spring(
                this.state.progress,
                {
                    toValue: 0,
                    velocity: 40,
                    tension: 10,
                }
            ).start()
        })
    }

    close () {
        Animated.spring(
            this.state.progress,
            {
                toValue: this.initH,
                velocity: 10,
                tension: 30,  
            }
        ).start()

        this.timer = setTimeout(() => {
            clearTimeout(this.timer)
            this.setState({ visible: false, tabs: [] })
        }, 1000)
    }

    componentWillUnmount () {
        this.state.visible && this.close()
        clearTimeout(this.timer)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
    mask: {
        flex: 1,
        backgroundColor: '#000',
        opacity: 0
    },
    content: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: deviceWidth(),
        height: parseInt(deviceHeight() * 4 / 6),
    },
    tabView: {
        backgroundColor: '#fff'
    },
    tabViewLoad: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleMain: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: px2dp(80),
        backgroundColor: '#fff',
        borderBottomColor: '#EEE',
        borderBottomWidth: 1,
        position: 'relative'
    },
    title: {
        position: 'absolute',
        left: 0,
        right: 0,
        flex: 1,
        fontSize: px2dp(30),
        color: '#222',
        textAlign: 'center'
    },
    icons: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: px2dp(80),
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: 999
    },
    close: {
        width: px2dp(21),
        height: px2dp(21)
    }
})