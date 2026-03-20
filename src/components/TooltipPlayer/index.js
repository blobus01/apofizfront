import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setTooltipPlayer} from '../../store/actions/commonActions';
import './index.scss';

const generateID = () => {
  return Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36)
}

class TooltipPlayer extends Component {
  constructor(props) {
    super(props);
    this.playerRef = React.createRef();
    this.state = {
      isPlaying: false
    }
    this.id = generateID()
  }

  componentDidMount() {
    if (this.playerRef) {
      this.playerRef.current.addEventListener('ended', this.onEnd);
      this.playerRef.current.addEventListener('pause', this.onEnd);
    }
  }

  componentWillUnmount() {
    if (this.playerRef) {
      this.playerRef.current.removeEventListener('ended', this.onEnd)
      this.playerRef.current.removeEventListener('pause', this.onEnd)
    }
    if (this.props.tooltipPlayer) {
      this.props.setTooltipPlayer(null)
    }
  }

  onEnd = () => {
    this.setState({...this.state, isPlaying: false});
  }

  togglePlayer = () => {
    const { tooltipPlayer, setTooltipPlayer } = this.props;
    if (this.playerRef) {
      if (this.state.isPlaying) {
        // Stop player
        this.playerRef.current.currentTime = 0;
        this.playerRef.current.pause();
        this.playerRef.current.currentTime = 0;
        this.setState({ isPlaying: false });
      } else {
        if (tooltipPlayer) {
          const audio = document.getElementById(tooltipPlayer)
          if (audio) {
            audio.currentTime = 0;
            audio.pause();
            audio.currentTime = 0;
          }
        }

        setTooltipPlayer(this.id);
        this.playerRef.current.play();
        this.setState({ isPlaying: true });
      }
    }
  }

  render() {
    const { isPlaying } = this.state;
    const { sources } = this.props;
    return (
      <button className="tooltip-player" onClick={this.togglePlayer}>
        <audio ref={this.playerRef} id={this.id}>
          {sources && sources.map((src, index) => (
            <source src={src} type="audio/mpeg" key={index} />
          ))}
        </audio>
        <div className="tooltip-player__icon">
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="12" height="12" rx="1" fill="white"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.23528 0.096967L11.5848 5.36393C11.9803 5.56517 12.1172 6.01314 11.8907 6.36448C11.8178 6.47764 11.7122 6.57147 11.5848 6.63628L1.23526 11.9029C0.839809 12.1042 0.335621 11.9825 0.109127 11.6311C0.03762 11.5202 0 11.3946 0 11.2667V0.733138C0 0.328237 0.369435 0 0.825157 0C0.969042 0 1.11043 0.0334279 1.23528 0.096967Z" fill="white"/>
            </svg>
          )}
        </div>
      </button>
    );
  }
}

const mapStateToProps = state => ({
  tooltipPlayer: state.commonStore.tooltipPlayer,
})

const mapDispatchToProps = dispatch => ({
  setTooltipPlayer: value => dispatch(setTooltipPlayer(value))
})

export default connect(mapStateToProps, mapDispatchToProps)(TooltipPlayer);