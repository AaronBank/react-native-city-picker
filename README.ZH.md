# react-native-city-picker

[Chinese](https://github.com/AaronBank/react-native-city-picker/blob/master/README.ZH.md) | [English](https://github.com/AaronBank/react-native-city-picker/blob/master/README.md)

![](https://img.shields.io/badge/licence-MIT-%2332CD32.svg)  ![](https://img.shields.io/badge/npm-6.4.1-%2332CD32.svg)  ![](https://img.shields.io/badge/react--native-%3E%3D0.42.0-%234169E1.svg)

**react-native 模仿JD多级联动地址选择器， 适用于Ios及Android平台**

<img src="http://qiniu.h1z166.com//file/2018/12/81f4fecfe7af4b6cb6b3132b947adaf0_image.png" style="width: 200px; margin: 0 auto; display: block;">


## 安装 ##
`npm install react-native-city-picker --save`


## 使用 ##

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

    // 处理省份数据
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

    // 数据调用及初始化
    async initPage (prev, index) {
        if (index === 0) {
            return await promises(this.state.provinceList)
        }

        return await promises(this.dispatchData(prev, index))
    }

    // 模拟数据(真实请求则不需要)
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

Prop                   | 类型       | 可选    | 默认值     | 说明
---------------------- | --------- | ------- | --------- | -----------
load                   | function  | 否      |           | 数据传递方法
tabs                   | Array     | 否      |           | tab集合
prompt                 | string    | 是      | '请选择'   | 默认tab展示文字
result                 | function  | 否      |           | 选择完成回调
titleStyle             | object    | 是      |           | 弹框顶部样式
contentStyle           | object    | 是      |           | 弹框内容区样式
listStyle              | object    | 是      |           | 列表样式
tabStyle               | object    | 是      |           | tab样式
activeColor            | string    | 是      | `#e4393c` | 选中颜色色值


## 参数详细信息  ##

### load ###

初始化及选中列表中某一项都将调用此方法，并且接受两个参数，(prev: 上一级被选中项, index: 当前级别需要展示数据联动级数，从0开始，0代表初始化第一项，1代表第二项，以此类推)，该方法必须提供**返回值**，当存在下一级则需返回下一级数据集合，若不存则返回false即可。返回false时，弹窗将收起，并且调用result方法传回选中后的文字集合

### result ###

该方法接受一个参数，参数类型值为`Array`的选中后的文字集合，该方法会在选择完成后将被执行


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

    // 处理省份数据
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

    // 数据调用及初始化
    async initPage (prev, index) {
        if (index === 0) {
            return await promises(this.state.provinceList)
        }

        return await promises(this.dispatchData(prev, index))
    }

    // 模拟数据(真实请求则不需要)
    promises (data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(data)
            }, 1000)
        })
    }
}

```

### 修改后效果 ###

<img src="" style="width: 200px; margin: 0 auto; display: block;">

## Licence ##
**MIT**
