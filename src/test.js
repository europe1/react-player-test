// Blur test
class CanvasBlur extends React.Component{
  constructor(props){
    super(props);
    this.state = {value: 0};
  }
  handleClick(radius){
    StackBlur.image('targetImg', 'blurCanvas', radius);
  }
  render(){
    return(
      <div>
        <img id='targetImg' src='files/photo5.jpeg' alt='' onClick={() => this.handleClick(this.state.value)} />
        <canvas id='blurCanvas' width='640' height='426'></canvas><br />
        <input type='text' value={this.state.value} onChange={(event) => this.setState({value: event.target.value})} />
      </div>
    );
  }
}

// Handling user input
class UserInput extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      inputText: ''
    }
  }
  render(){
    return(
      <div>
        <h2>{this.state.inputText}</h2>
        <input type='text' value={this.state.inputText} onChange={(event) => this.setState({inputText: event.target.value})}/>
      </div>
    );
  }
}

// File uploader (does nothing)
class Upload extends React.Component{
   constructor(props){
      super(props);
      this.state = {
         value: '',
         file: '',
         fileHistory: []
      };
      this.handleFile = this.handleFile.bind(this);
   }
   handleFile(event){
      this.setState({
         value: event.target.value,
         file: event.target.files[0].name
      });
      this.state.fileHistory.push(event.target.files[0].name);
   };
   render(){
      return (
         <div>
            <h2>You have uploaded:</h2>
            <ul>{this.state.fileHistory.map((file) => <li>{file}</li>)}</ul>
            <input type='file' onChange={this.handleFile} />
         </div>
      );
   }
}

import React from 'react'
import ReactDOM from 'react-dom'
import { Transition } from 'react-transition-group'

const duration = 100;

const defaultStyle = {
  transition: `opacity ${duration}ms ease-in-out`,
  opacity: 0,
  padding: 20,
  display: 'inline-block',
  backgroundColor: '#8787d8'
}

const transitionStyles = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
};

const Fade = ({ in: inProp }) => (
  <Transition in={inProp} timeout={duration}>
    {(state) => (
      <div style={{
        ...defaultStyle,
        ...transitionStyles[state]
      }}>
        Im a fade Transition!
      </div>
    )}
  </Transition>
);

import React from 'react'
import ReactDOM from 'react-dom'
import { Transition } from 'react-transition-group'

const duration = 300;

const defaultStyle = {
  transition: `opacity ${duration}ms ease-in-out`,
  opacity: 0,
  padding: 20,
  display: 'inline-block',
  backgroundColor: '#8787d8'
}

const transitionStyles = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
};

const Fade = ({ in: inProp }) => (
  <Transition in={inProp} timeout={duration}>
    {(state) => (
      <div style={{
        ...defaultStyle,
        ...transitionStyles[state]
      }}>
        Im a fade Transition!
      </div>
    )}
  </Transition>
);

class Example extends React.Component {
  state = { show: false }

  handleToggle() {
    this.setState(({ show }) => ({
      show: !show
    }))
  }

  render() {
    const { show } = this.state
    return (
      <div>
        <button onClick={() => this.handleToggle()}>
          Click to toggle
        </button>
        <div>
          <Fade in={!!show} />
        </div>
      </div>
    )
  }
}

ReactDOM.render(<Example />, document.getElementById('root'));

class TestCanvas extends React.Component{
  render(){
    window.onload = () => {
      const image = document.getElementById('testv');
      const canvas = document.getElementById('testc');
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image,0,0,cw,ch);
    }
    return(
      <div className='testviewport'>
        <MainNavigation />
        <div className='testCanv'>
          <canvas id='testc'></canvas>
        </div>
        <div className='videoContainer'>
          <video id='testv' height='540' controls>
            <source src='files/video.mp4' />
          </video>
        </div>
      </div>
    );
  }
}

let t;
let i = 0;
const video = this.video;
const thumbs = [];

video.onloadeddata = () => {
  video.currentTime = i;
}
video.onseeked = () => {
  let add = 0;
  if (video.duration > 10){
    add = Math.ceil(video.duration/5)/10;
  } else{
    add = 0.2;
  }
  generateThumbnail();
  i += add;
  if (i <= video.duration) {
    video.currentTime = i;
  }
}

video.src = 'files/video.mp4';
video.preload = 'auto';

function generateThumbnail() {
  var c = document.createElement('canvas');
  var ctx = c.getContext('2d');
  c.width = 1280;
  c.height = 720;
  ctx.drawImage(video, 0, 0, 1280, 720);
  c.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    thumbs.push(url);
  });
}
function previewClip(e){
  let i = 0;
  t = setInterval(function(){
    if (i <= thumbs.length){
      document.getElementById('sxt').poster = thumbs[i++]
    } else{
      return null;
    }
  },200);
}
// Generate an unique 8-char ID
function generateId(){
  const random = Math.ceil(Math.random()*100000000);
  return random;
}

// Video thumbnail
onLoadedMetadata={(e) => {
  if (e.target.duration > 10){
    this.add = Math.ceil(e.target.duration/5)/10;
  } else{
    this.add = 0.2;
  }}}
onLoadedData={(e) => {e.target.currentTime = this.i}}
onSeeked={(e) => {this.getFrames(e.target, this.add)}}
onMouseOver={(e) => this.previewClip(e.target,this.thumbs)}
onMouseLeave={() => clearInterval(this.t)}
