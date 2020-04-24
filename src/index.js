import React from 'react';
import ReactDOM from 'react-dom';
import StackBlur from 'stackblur-canvas';
import './styles/index.css';

// Get cursor coordinates
function getCoords(e){
  const coords = {x: 0, y: 0};
  if (e.pageX || e.pageY){
    coords.x = e.pageX;
    coords.y = e.pageY;
  } else if (e.clientX || e.clientY){
    coords.x = e.clientX;
    coords.y = e.clientY;
  }
  return coords;
}

// Main viewport
class View extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      playlist: ['video2.mp4', 'video.mp4', 'video3.mp4'],
      currentVid: ''
    };
    this.p = 1;
  }
  setBack(){
    const video = document.getElementById('sxt');
    const canvas = document.getElementById('videoBack');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video,0,0,1280,720);
    StackBlur.canvasRGB(canvas,0,0,1280,720,10);
  }
  render(){
    window.onload = () => this.setBack();
    return(
      <div className='container-fluid viewport'>
        <canvas id='videoBack'></canvas>
        <div className='row'>
          <div className='col previewRecommended'>
            <img id='lp' alt='Previous video' src='files/photo5.jpeg'
             onClick={(e) => {
               this.p -= 1;
               if (this.p < 0){
                 this.p = this.state.playlist.length - 1;
               }
               this.setState({currentVid: this.state.playlist[this.p]});
             }}
             className='leftVideo'/>
          </div>
          <Player
           onPause={this.setBack}
           preview = 'files/channels.jpg'
           src={this.state.currentVid ? this.state.currentVid : this.state.playlist[this.p]}/>
          <div className='col previewRecommended'>
            <img id='rp' alt='Next video' src='files/photo3.jpeg'
             onClick={(e) => {
               this.p += 1;
               if (this.p > this.state.playlist.length - 1){
                 this.p = 0;
               }
               this.setState({currentVid: this.state.playlist[this.p]});
             }}
             className='previewRecommended rightVideo'/>
          </div>
        </div>
        <SubscriptionList />
      </div>
    );
  }
}

// Main player
class Player extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      showContextMenu: false,
      playing: false,
      caching: true,
      seek: false,
      progressVisible: true
    };
    this.add = 1;
    this.t = 0;
    this.i = 0;
    this.thumbs = [];
    this.customContextMenu=this.customContextMenu.bind(this);
    this.handleClick=this.handleClick.bind(this);
    this.seekReady=this.seekReady.bind(this);
    this.seekUnready=this.seekUnready.bind(this);
    this.seekVideo=this.seekVideo.bind(this);
  }
  componentDidMount(){
    if (this.state.playing){
      document.getElementById(this.state.id).play();
      this.setState({playing: true});
    }
  }
  componentDidUpdate(){
    this.i = 0;
  }
  customContextMenu(e){
    e.preventDefault();
    const coordinates = getCoords(e);
    if ((window.innerHeight - coordinates.y - 175) < 5) {
      coordinates.y -= 175;
    } else if ((window.innerWidth - coordinates.x + 150) > window.innerWidth){
      coordinates.x -= 150;
    }
    this.setState({
      style: {
        top: coordinates.y,
        left: coordinates.x,
      },
      showContextMenu: !this.state.showContextMenu
    });
  }
  handleClick(e){
    if (this.state.playing){
      document.getElementById('sxt').pause();
      this.setState({playing: false});
    } else {
      document.getElementById('sxt').play();
      this.setState({playing: true});
    }
  }
  setStyle(e){
    return({
      top: e.target.offsetTop,
      left: e.target.offsetLeft
    });
  }
  seekReady(e){
    this.setState({seek: true});
    this.startPoint = e.clientX;
  }
  seekUnready(){
    this.setState({seek: false});
  }
  seekVideo(e){
    const video = document.getElementById('sxt');
    const elem = document.getElementById('currentProgress');
    const elem2 = document.getElementById('fullProgress');
    const width = video.offsetWidth;
    const position = video.getBoundingClientRect().x;
    let pos = 0, style = 0, borders = [0.5,99.5];
    if (this.state.seek) {
      if (e.currentTarget.id === 'progressBar') {
        borders = [1,99]
      }
      pos = e.clientX - position;
      style = (pos/width * 100);
      if (style < borders[0]){
        style = 0;
      } else if (style >= borders[1]) {
        style = 100;
      }
      elem.style.width = style + '%';
      elem2.style.width = (100 - style) + '%';
      video.currentTime = video.duration/100 * style;
    }
  }
  updateTime(){
      const vid = document.getElementById('sxt');
      const elem = document.getElementById('currentProgress');
      const elem2 = document.getElementById('fullProgress');
      let tr = vid.currentTime/vid.duration * 100;
      elem.style.width = tr + '%';
      elem2.style.width = (100 - tr) + '%';
  }
  previewClip(target,thumbs){
    let i = 0;
    this.t = setInterval(function(){
      if (i <= thumbs.length){
        target.poster = thumbs[i++]
      } else{
        return null;
      }
    },200);
  }
  render(){
    window.onclick = (e) => {
      if (this.state.showContextMenu && e.button === 0) {
        this.setState({showContextMenu: false});
      }
    }
    window.onresize = () => {
      this.setState({showContextMenu: false});
    }
    window.onmouseup = () => {
      this.seekUnready();
    }
    return(
      <div className='videoContainer col-6 col-xl-6'
       onMouseMove={this.seekVideo}
       onPause={this.props.onPause}
       onEnded={() => this.setState({playing: false})}>
       { this.state.showContextMenu ?
         <ContextMenu
           style = {this.state.style}
           onContextMenu = {(e) => e.preventDefault()}
           caching = {this.state.caching}
           cacheClick = {() => {
             this.setState({caching: !this.state.caching});
           }}
         /> : null }
        <video onContextMenu={(e) => this.customContextMenu(e)} className='mainVideo' id='sxt'
          onClick={this.handleClick}
          onPlaying={() => this.t = setInterval(this.updateTime,30)}
          onPause={() => clearInterval(this.t)}
          onLoadedMetadata={(e) => {
            if (e.target.duration > 10){
              this.add = Math.ceil(e.target.duration/5)/10;
            } else{
              this.add = 0.2;
            }}}
          src={'files/' + this.props.src}>
        </video>
        <div onMouseDown={this.seekReady} onMouseUp={this.seekVideo}
        onContextMenu={(e) => this.customContextMenu(e)}
        id='progressBar' style={{opacity: 1}} className='progressBar'>
          <div id='currentProgress' className='currentProgress'></div>
          <span id='timeControl' className='timeControl' onClick={(e) => e.stopPropagation()} onMouseDown={this.seekReady}></span>
          <div id='fullProgress' className='wholeVideo'></div>
        </div>
        <Icon style={this.state.seek ? {pointerEvents: 'none'} : {pointerEvents: 'auto'}}
         onClick={this.handleClick} id='btnPlay' name={this.state.playing ? 'pause' : 'play'} />
        <span className='videoTitle'>Note</span>
        <Icon id='btnSound' name='sound'/>
        <BottomLine vidTitle='Italian views' />
      </div>
    );
  }
}

// Bottom video infromation (appears when pressed on play button)
class BottomLine extends React.Component {
  render() {
    return(
      <div className='bottomLine' id='vidBottom'>
        <span>{this.props.vidTitle}</span>
      </div>
    );
  }
}

// Custom context context menu
class ContextMenu extends React.Component {
  render() {
    return ReactDOM.createPortal(
        <table style={this.props.style}
         className='contextMenu'
         onMouseLeave={this.props.onMouseLeave}
         onContextMenu={this.props.onContextMenu}>
          <thead>
            <tr><td>
              Copy >>
            </td></tr>
            <tr><td>Speed >></td></tr>
            <tr><td>Loop</td></tr>
          </thead>
          <tbody>
            <tr><td onClick={this.props.cacheClick}>
              {this.props.caching ? 'Pause' : 'Resume'} caching
            </td></tr>
            <tr><td>Troubleshooting >></td></tr>
          </tbody>
          <tfoot>
            <tr><td>Open in a new window</td></tr>
          </tfoot>
        </table>,
        document.getElementById('contextMenu'),
    );
  }
}

// Subscription list on the left of the screen
class SubscriptionList extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      show: false,
      slide: 'slideInLeft'
    }
    this.showList = this.showList.bind(this);
    this.channelsList = [];
  }
  componentDidMount(){
    this.channelsList = this.generateSubList('files/channel.jpg', 10).map((sub, i) =>
      <SubscriptionChannel
      title={sub.name}
      src={sub.img}
      slide={this.state.slide}
      order={i+2}
      key={sub.link}/>
    );
  }
  // TEMP:
  generateSubList(image, length){
    function gen() {
      return Math.floor(Math.random() * 1000000000);
    }
    const list = [];
    for (let i=0;i<length+1;i++){
      list.push({
        name: 'Channel #' + i,
        link: gen(),
        img: image
      })
    }
    return list;
  }
  showList(){
    this.setState({show: !this.state.show});
  }
  render(){
    return(
      <div className='subList'>
        <div onClick={this.showList} className='btnSubList' id='showHideSubList'>{this.state.show ? 'Hide' : 'Show'}</div>
        {this.state.show ? this.channelsList : null}
      </div>
    );
  }
}

class SubscriptionChannel extends React.Component{
  render(){
    return(
      <div className='row'>
        <div className='col-1'>
          <img className='subListChannel'
           title={this.props.title}
           style={{animationDuration: this.props.order*110 + 'ms'}}
           src={this.props.src}/>
        </div>
      </div>
    );
  }
}

// Navigation with logo
class Navigation extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      navigationVisible: false,
      page: ''
    }
    this.showNav=this.showNav.bind(this);
  }
  componentDidMount(){
    const url = document.location.href;
    if (url.indexOf('channels') >= 0) {
      this.setState({page: 'navChn'});
    }
    else if (url.indexOf('videos') >= 0) {
      this.setState({page: 'navVid'});
    }
    else if (url.indexOf('library') >= 0) {
      this.setState({page: 'navLib'});
    }
  }
  showNav(){
    this.setState({navigationVisible: !this.state.navigationVisible});
  }
  render(){
    return(
      <div className='container-fluid'>
        <div className='nav row'>
          <div className='mainNav col'>
            <span className='logo'>CH</span>
            <a id='navChn' className={this.state.page === 'navChn' ? 'active' : null} href='channels'>Channels</a>
            <a id='navVid' className={this.state.page === 'navVid' ? 'active' : null} href='videos'>Videos</a>
            <a id='navLib' className={this.state.page === 'navLib' ? 'active' : null} href='library'>Library</a>
          </div>
          <span className='search col'>
            <input type='text' id='searchField' placeholder='Search' className='searchField'/>
            <img src='files/channel.jpg' alt='Channel Name' className='yourChannelLogo'/>
          </span>
        </div>
      </div>
    );
  }
}

class Icon extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      canChangeVol: false
    }
  }
  changeVol(e){

  }
  convertPos(x,y,r,angle) {
    const angleR = (angle-90) * Math.PI / 180.0;
    return {
      x: x + (r * Math.cos(angleR)),
      y: y + (r * Math.sin(angleR))
    };
  }
  arcPath(x,y,r,startAngle,endAngle) {
    const start = this.convertPos(x, y, r, endAngle);
    const end = this.convertPos(x, y, r, startAngle);
    const lArc = endAngle - startAngle <= 180 ? "0" : "1";
    const d = ["M", start.x, start.y, "A", r, r, 0, lArc, 0, end.x, end.y].join(" ");
    return d;
  }
  render(){
    switch (this.props.name) {
      case 'play':
        return(
          <svg onClick={this.props.onClick} id={this.props.id} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"
          className="SVGButton bounceOut">
            <path className='SVGPath' d="M-4.996-3.364l-28.779 16.616v-33.231z"
              transform="matrix(1.83596 0 0 1.62407 67.613 37.47)" stroke="#fff" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'pause':
        return(
          <svg onClick={this.props.onClick} id={this.props.id} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"
          className="SVGButton">
            <path className='SVGPath' d="M11.27273 2.36364h14.18182v59.27272H11.27273zm28 0h14.18182v59.27272H39.27273z"
              transform="matrix(1.12826 0 0 .94862 -4.15082 1.6441)" stroke="#fff"
              strokeWidth="2.89982" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'sound':
        return(
          <svg onContextMenu={(e) => {e.preventDefault();}} className='btnSound' viewBox='0 0 64 64'>
            <path strokeWidth="0" onMouseDown={() => this.setState({canChangeVol: true})} onMouseMove={this.changeVol}
            fill='white'/>
          </svg>
        );
      default:
        return null;
    }
  }
}

ReactDOM.render(
  <SubscriptionList />,
  document.getElementById('subList')
);
ReactDOM.render(
   <View />,
   document.getElementById('root')
);
ReactDOM.render(
  <Navigation />,
  document.getElementById('navigation')
);
