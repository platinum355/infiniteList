import React from 'react';
import ReactDOM from 'react-dom'
import InfiniteList from './InfiniteList'
require('./style.css')

let testData = []
for(let i=0;i<1000000;i++){
    testData.push({id:i, name:`Name_${i}`})
}

let DataModel = {
    loading:false,
    load(offset, length, cb){
        console.log('load')
        if(this.loading)
            return
        this.loading = true
        this.data = testData.slice(offset, offset+length)
        this.loading = false
        if(cb)
            cb()
    },
    data:[],
    maxLength:1000000
}

class Row extends React.Component{
    render(){
        return <div className={'row'}>{
            ['id', 'name'].map((value, key)=>{
                return <div className={'column'}>{this.props.data[value]}</div>
            })
        }</div>
    }
}

class App extends React.Component{
    render(){
        return <div style={{display:'flex'}}>
            <InfiniteList dataModel={DataModel} length={100} offsetDelta={30} row={Row}/>
            <div className={'readme'}>
                {`
                // 1 000 000 rows
                `}
            </div>
        </div>
    }
}

ReactDOM.render(<App/>, document.getElementById('App'))