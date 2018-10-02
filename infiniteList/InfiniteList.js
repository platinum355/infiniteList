import React from 'react';

function getCoords(elem) {
    let box = elem.getBoundingClientRect();
    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };
}

class InfiniteList extends React.Component{
    constructor(props){
        super(props)
        this.state = {preOffset:0, offset:0, offsetDelta:this.props.offsetDelta, length:this.props.length, model:this.props.dataModel, scrollBlock:false, lastDirection:null}
    }
    componentDidUpdate(){
        this.refs.full_loader.classList.add('hidden')
        this.state.offset = this.state.preOffset
        this.refs.loaderBottom.classList.add('hidden')
        this.refs.loaderTop.classList.add('hidden')
        if(this.state.focus !== undefined){
            let elem = this.refs.rows.children[this.state.focus]
            if(elem)
                elem.focus()
            this.state.focus = null
        }
        this.state.scrollBlock = false
        this.scrollRender()
    }
    componentDidMount(){
        this.scrollRender()
    }
    scrollRender(){
        if(this.state.model.maxLength){
            if(this.state.scrollBlock)
                return
            let CH = this.refs.list.clientHeight
            let MH = this.state.model.maxLength
            let SH = this.refs.rows.scrollHeight
            let ST = this.refs.rows.scrollTop
            let length = this.state.length
            let offset = this.state.offset
            let avgRowHeight = SH/length
            let avgSBBHeight = CH / (MH*avgRowHeight)
            if(avgSBBHeight < CH/5)
                avgSBBHeight = 35
            this.refs.sbb.style.height = avgSBBHeight + 'px'
            let margin = ((CH-avgSBBHeight)*(ST + (avgRowHeight * offset)))/(avgRowHeight*MH-CH)
            this.refs.sbb.style.marginTop = margin + 'px'
        }
    }
    scroll(e) {
        if(this.state.scrollBlock)
            return
        let target = e.currentTarget
        let SH = target.scrollHeight - target.clientHeight
        if(target.scrollTop > SH - target.clientHeight && e.deltaY > 0){
            this.state.scrollBlock = true
            this.refs.loaderBottom.classList.remove('hidden')
            this.state.preOffset += this.state.offsetDelta
            if(this.state.preOffset > this.state.model.maxLength - this.state.length)
                this.state.preOffset = this.state.model.maxLength - this.state.length
            this.state.lastDirection = 2
            this.state.model.load(this.state.preOffset, this.state.length, ()=>{this.forceUpdate()})
        }
        if(target.scrollTop < SH - target.scrollHeight/2 && e.deltaY < 0){
            this.state.scrollBlock = true
            if(this.state.offset === 0)
            {
                this.state.scrollBlock = false
                return
            }
            this.refs.loaderTop.classList.remove('hidden')
            if(this.state.preOffset > 0)
                this.state.preOffset -= this.state.offsetDelta
            if(this.state.preOffset < 0)
                this.state.preOffset = 0
            this.state.lastDirection = 1
            this.state.model.load(this.state.preOffset, this.state.length, ()=>{this.forceUpdate()})
        }
    }
    sbtRender(){
        this.refs.sbt.innerHTML = Math.floor(this.state.model.maxLength*(this.refs.sbb.style.marginTop.split('px')[0]/(this.refs.list.clientHeight-this.refs.sbb.clientHeight)))
    }
    sbMouseDown(e){
        let coords = getCoords(this.refs.sbb);
        let shiftY = e.pageY - coords.top;
        let listY = getCoords(this.refs.list).top;
        if(this.state.model.maxLength!==undefined)
        {
            this.sbtRender()
            this.refs.sbt.classList.add('show')
        }
        this.refs.full_loader.classList.remove('hidden')
        document.onmouseup = ()=>{
            document.onmouseup = null
            document.onmousemove = null
            let numb = Math.floor(this.state.model.maxLength*(this.refs.sbb.style.marginTop.split('px')[0]/(this.refs.list.clientHeight-this.refs.sbb.clientHeight)))
            this.state.preOffset = numb - this.props.offsetDelta
            this.state.length = this.props.length + this.props.offsetDelta
            if(this.state.preOffset > this.state.model.maxLength - this.state.length)
                this.state.preOffset = this.state.model.maxLength - this.state.length
            if(this.state.preOffset < 0)
                this.state.preOffset = 0
            if(numb >= this.state.model.maxLength)
                numb = this.state.model.maxLength-1
            if(numb ===0)
                numb = 1
            this.state.focus = numb - this.state.preOffset
            this.state.model.load(this.state.preOffset, this.state.length, ()=>{this.forceUpdate()})
            this.refs.sbt.classList.remove('show')
        }
        document.onmousemove = (e)=>{
            let y = e.pageY - shiftY - listY
            if(y < 0)
                y = 0
            if(y > this.refs.list.clientHeight - this.refs.sbb.clientHeight)
                y = this.refs.list.clientHeight - this.refs.sbb.clientHeight
            this.refs.sbb.style.marginTop = y + 'px';
            this.sbtRender()
        }
    }
    render(){
        let model = this.state.model
        let data = model.data
        if(!data.length){
            model.load(this.state.offset, this.state.length, ()=>{this.forceUpdate()})
        }
        return <div className={'InfiniteList_container'}>
                <div style={{position:'relative'}}>
                    <div ref='list' className={"InfiniteList"} >
                        <div ref={'full_loader'} className={"InfiniteList_loader full"}><img src="img/preloader.gif"/></div>
                        <div ref={'rows'} className={'InfiniteList_data'} onWheel={(e)=>{this.scroll(e)}} onScroll={()=>{this.scrollRender()}}>
                            <div key={'loaderTop'} ref={'loaderTop'} className={"InfiniteList_loader hidden"}><img src="img/preloader.gif"/></div>
                            {
                                data.length ? data.map((val, key) => {
                                        return <div className={"InfiniteList_row"} key={this.state.preOffset + key} tabIndex="0" style={{outline:'none'}}><this.props.row data={val}/></div>
                                    })
                                    : null
                            }
                            <div key={'loaderBottom'} ref={'loaderBottom'} className={"InfiniteList_loader hidden"}><img src="img/preloader.gif"/></div>
                        </div>
                    </div>
                    <div ref='sb' key={'scrollbar'} className={'InfiniteList_scrollbar'}>
                        <div ref='sbb' className={'InfiniteList_scrollbar_body'} onMouseDown={(e)=>{this.sbMouseDown(e)}}>
                            <div ref='sbt' className={'InfiniteList_scrollbar_title'}/>
                        </div>
                    </div>
                </div>
        </div>
    }
}


export default InfiniteList