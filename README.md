# react-native-city-picker

[Chinese](https://github.com/AaronBank/react-native-city-picker/blob/master/README.ZH.md) | [English](https://github.com/AaronBank/react-native-city-picker/blob/master/README.md)

![](https://img.shields.io/badge/licence-MIT-%2332CD32.svg)  ![](https://img.shields.io/badge/npm-6.4.1-%2332CD32.svg)  ![](https://img.shields.io/badge/react--native-%3E%3D0.42.0-%234169E1.svg)

**React-native imitates JD multi-level linkage address selector for Ios and Android platforms**

<img src="http://qiniu.h1z166.com//file/2018/12/81f4fecfe7af4b6cb6b3132b947adaf0_image.png" style="width: 200px; margin: 0 auto; display: block;">


## Installation ##
`npm install react-native-city-picker --save`


## Usage ##

> App.js
```javascript

import React, { Component } from 'react'
import { View, Text, Button } from 'react-native'

import data from './data.json'

import Address from 'react-native-city-picker'

export default class extends Component{
    constructor () {
        super()

        this.state = {
            selectAddress: [],
            provinceList: []
        }

        this.addressList = []
    }

    render () {
        return (
            <View style={ { flex: 1 } }>
                <Text>{ this.state.selectAddress }</Text>
                <Address
                    ref={ ref => this.address = ref }
                    load={ this.initPage.bind(this) }
                    tabs={ this.state.selectAddress }
                    prompt="请选择"
                    result={ selectAddress => this.setState({ selectAddress }) }
                />
                <Button title="Select address" onPress={ () => this.address.open() }></Button>
            </View>
        )
    }

    async componentDidMount() {
        let provinceList = []

        for (let i in data) {
            for (let j in data[i]) {
                provinceList.push(j)
            }
        }

        this.addressList.push(localAddress)
        this.setState({ provinceList })
    }

    // Processing provincial data
    dispatchData (prev, index) {
        const prevAddress = this.addressList[index - 1]
        let result = []

        if (typeof prevAddress[0] === 'string') return false

        let firstFilter = prevAddress.filter(address => {
            let current = Object.keys(address)[0]
            return current === prev
        })[0]

        result = firstFilter[prev]
        this.addressList[index] = firstFilter[prev]

        if (typeof firstFilter[prev][0] === 'object') {
            result = firstFilter[prev].map(item => Object.keys(item)[0])
        }

        return result
    }

    // Data call and initialization
    async initPage (prev, index) {
        if (index === 0) {
            return await promises(this.state.provinceList)
        }

        return await promises(this.dispatchData(prev, index))
    }

    // Analog data (required for real requests)
    promises (data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(data)
            }, 1000)
        })
    }
}

```

> data.json

```javascript
[{"北京市":[{"北京市":["东城区","西城区","朝阳区","丰台区","石景山区","海淀区","门头沟区","房山区","通州区","顺义区","昌平区","大兴区","怀柔区","平谷区","密云县","延庆县"]}]},{"天津市":[{"天津市":["和平区","河东区","河西区","南开区","河北区","红桥区","东丽区","西青区","津南区","北辰区","武清区","宝坻区","滨海新区","宁河县","静海县","蓟县"]}]}]}]
```



## Props ##

Prop                   | Type       | Optional    | Default     | Description
---------------------- | --------- | ------- | --------- | -----------
load                   | function  | No      |           | Data transfer method
tabs                   | Array     | No      |           | Tab collection
prompt                 | string    | Yes      | '请选择'   | Default tab display text
result                 | function  | No      |           | Choose to complete the callback
titleStyle             | object    | Yes      |           | Box top style
contentStyle           | object    | Yes      |           | Bullet box content area style
listStyle              | object    | Yes      |           | List style
tabStyle               | object    | Yes      |           | Tab style
activeColor            | string    | Yes      | `#e4393c` | Check color color value


## Parameter details  ##

### load ###

Initialization and select an item in the list will invoke this method, and receive two parameters, (prev: selected item at the next higher level, the index: current level needs to display data linkage series, starting from 0, 0 represents the initialized first, 1 represents the second, and so on), the method must provide * * * *, the return value when there is a lower level will be expected to return to the next level data collection, if not to return false. When false is returned, the pop-up closes and the result method is called to return the selected set of text

### result ###

This method accepts a parameter, the parameter type value of ` Array ` selected text collection, this method will after the choice will be executed


## 样式修改案例  ##

```javascript

import React, { Component } from 'react'
import { View, Text, Button } from 'react-native'

import data from './data.json'

import Address from 'react-native-city-picker'
import { px2dp } from 'react-native-style-adaptive'

export default class extends Component{
    constructor () {
        super()

        this.state = {
            selectAddress: [],
            provinceList: []
        }

        this.addressList = []
    }

    render () {
        return (
            <View style={ { flex: 1 } }>
                <Text>{ this.state.selectAddress }</Text>
                <Address
                    ref={ ref => this.address = ref }
                    load={ this.initPage.bind(this) }
                    tabs={ this.state.selectAddress }
                    prompt="请选择"
                    titleStyle={ {
                        content: { borderTopLeftRadius: px2dp(22), borderTopRightRadius: px2dp(22) }
                    } }
                    contentStyle={ { backgroundColor: '#F1F1F1' } }
                    listStyle={ {
                        content: {},
                        text: { color: '#666', fontSize: px2dp(28) }
                    } }
                    activeColor="red"
                    result={ selectAddress => this.setState({ selectAddress }) }
                />
                <Button title="选择地址" onPress={ () => this.address.open() }></Button>
            </View>
        )
    }

    async componentDidMount() {
        let provinceList = []

        for (let i in data) {
            for (let j in data[i]) {
                provinceList.push(j)
            }
        }

        this.addressList.push(localAddress)
        this.setState({ provinceList })
    }

    // Processing provincial data
    dispatchData (prev, index) {
        const prevAddress = this.addressList[index - 1]
        let result = []

        if (typeof prevAddress[0] === 'string') return false

        let firstFilter = prevAddress.filter(address => {
            let current = Object.keys(address)[0]
            return current === prev
        })[0]

        result = firstFilter[prev]
        this.addressList[index] = firstFilter[prev]

        if (typeof firstFilter[prev][0] === 'object') {
            result = firstFilter[prev].map(item => Object.keys(item)[0])
        }

        return result
    }

    // Data call and initialization
    async initPage (prev, index) {
        if (index === 0) {
            return await promises(this.state.provinceList)
        }

        return await promises(this.dispatchData(prev, index))
    }

    // Analog data (required for real requests)
    promises (data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(data)
            }, 1000)
        })
    }
}

```

### Modified effect ###

<img src="" style="width: 200px; margin: 0 auto; display: block;">

## Licence ##
**MIT**
