import { PureComponent } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface IceError {
  url: string;
  address: string | null;
  port: number | null;
  errorCode: number;
  errorText: string;
  statusCode: string;
}

interface State {
  iceConnectionState: RTCIceConnectionState;
  peerConnectionState: RTCPeerConnectionState;
  iceGatheringState: RTCIceGatheringState;
  publicIp: string;
  relayIp: string;
  stunReachable: boolean;
  turnReachable: boolean;
  candidates: RTCIceCandidate[];
  errors: IceError[];
}

interface Props {
  iceServer: RTCIceServer;
  onRemove: () => void; // Callback to handle remove
}

export class IceServerState extends PureComponent<Props, State> {
  state: State = {
    iceConnectionState: 'new',
    peerConnectionState: 'new',
    iceGatheringState: 'new',
    publicIp: '',
    relayIp: '',
    stunReachable: false,
    turnReachable: false,
    candidates: [],
    errors: [],
  };
  peer?: RTCPeerConnection;

  mapIceErrorCodeToStatus(errorCode: number): string {
    const statusMap: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      408: 'Request Timeout',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };
    return statusMap[errorCode] || 'Unknown Error';
  }

  resetState() {
    this.setState({
      iceConnectionState: 'new',
      peerConnectionState: 'new',
      iceGatheringState: 'new',
      publicIp: '',
      relayIp: '',
      stunReachable: false,
      turnReachable: false,
      candidates: [],
      errors: [],
    });
  }

  startMonitor(): void {
    if (this.peer) {
      this.resetState();
      this.peer.close();
    }
    this.peer = new RTCPeerConnection({ iceServers: [this.props.iceServer] });
    this.peer.addEventListener('icecandidateerror', this.onIceCandidateError);
    this.peer.addEventListener('icecandidate', this.onIceCandidate);
    this.peer.addEventListener(
      'connectionstatechange',
      this.onConnectionStateChange,
    );
    this.peer.addEventListener(
      'icegatheringstatechange',
      this.onIceGatheringStateChange,
    );
    this.peer.addEventListener(
      'iceconnectionstatechange',
      this.onIceConnectionStateChange,
    );
    this.peer.createDataChannel('test');
    this.peer.createOffer().then(this.onCreateOffer);
  }

  onCreateOffer = async (offer: RTCSessionDescriptionInit) => {
    console.log('offer', offer);
    if (this.peer && offer) {
      await this.peer.setLocalDescription(offer);
    }
  };
  onIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    console.log('icecandidate', event);
    const candidate = event.candidate;
    if (candidate) {
      let turnReachable = this.state.turnReachable;
      let stunReachable = this.state.stunReachable;
      let publicIp = this.state.publicIp;
      if (candidate.type === 'srflx') {
        stunReachable = true;
        publicIp = candidate.address ?? '';
      }

      if (candidate.type === 'relay') {
        turnReachable = true;
      }
      this.setState((state) => {
        return {
          turnReachable,
          stunReachable,
          publicIp,
          candidates: [...state.candidates, candidate],
        };
      });
    }
  };
  onIceCandidateError = (event: RTCPeerConnectionIceErrorEvent) => {
    console.log('icecandidateerror', event);
    this.setState((state) => {
      return {
        errors: [
          ...state.errors,
          {
            url: event.url,
            port: event.port,
            address: event.address,
            errorCode: event.errorCode,
            errorText: event.errorText || 'N/A',
            statusCode: this.mapIceErrorCodeToStatus(event.errorCode),
          },
        ],
      };
    });
  };
  onIceGatheringStateChange = (event: Event) => {
    console.log(
      `iceGatheringStateChange => ${this.peer?.iceGatheringState} => `,
      event,
    );
    if (this.peer?.iceGatheringState) {
      this.setState({
        iceGatheringState: this.peer.iceGatheringState,
      });
    }
  };
  onIceConnectionStateChange = (event: Event) => {
    console.log(
      `iceConnectionStateChange => ${this.peer?.iceConnectionState} => `,
      event,
    );
    if (this.peer?.iceConnectionState) {
      this.setState({
        iceConnectionState: this.peer.iceConnectionState,
      });
    }
  };
  onConnectionStateChange = (event: Event) => {
    console.log(
      `iceConnectionStateChange => ${this.peer?.connectionState} => `,
      event,
    );
    if (this.peer?.connectionState) {
      this.setState({
        peerConnectionState: this.peer.connectionState,
      });
    }
  };

  componentDidMount() {
    if (this.props.iceServer) {
      this.startMonitor();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.iceServer !== prevProps.iceServer) {
      this.startMonitor();
    }
  }

  componentWillUnmount() {
    if (this.peer) {
      this.peer.close();
    }
  }

  handleRemove = () => {
    this.props.onRemove();
  };

  render() {
    return (
      <Card>
        <CardHeader
          title={`${this.props.iceServer.urls}`}
          titleTypographyProps={{ color: 'primary', variant: 'h6' }}
          subheaderTypographyProps={{ component: 'div' }}
          subheader={
            <Box>
              <Typography variant="body2">
                <b>Username:</b> {this.props.iceServer.username || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <b>Credential:</b> {this.props.iceServer.credential || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <b>TURN:</b>{' '}
                {this.state.turnReachable
                  ? '✅ The TURN server is reachable!'
                  : this.state.iceGatheringState === 'complete'
                    ? '❌ Not Reachable'
                    : 'Processing'}
              </Typography>
              <Typography variant="body2">
                <b>STUN:</b>{' '}
                {this.state.stunReachable
                  ? '✅ The STUN server is reachable!'
                  : this.state.iceGatheringState === 'complete'
                    ? '❌ Not Reachable'
                    : 'Processing'}
              </Typography>
              {!!this.state.publicIp && (
                <Typography variant="body2">
                  <b>PUBLIC IP:</b> ✅ Your Public IP Address is{' '}
                  {this.state.publicIp}
                </Typography>
              )}
            </Box>
          }
          action={
            <IconButton onClick={this.handleRemove} aria-label="remove">
              <DeleteIcon />
            </IconButton>
          }
        />
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Success Candidate Information
          </Typography>
          <TableContainer component={Paper} sx={{ marginBottom: '16px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Foundation</TableCell>
                  <TableCell>Component ID</TableCell>
                  <TableCell>Protocol</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Port</TableCell>
                  <TableCell>Candidate Type</TableCell>
                  <TableCell>Related Address</TableCell>
                  <TableCell>Related Port</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.candidates.map((candidate, index) => (
                  <TableRow key={index}>
                    <TableCell>{candidate.foundation}</TableCell>
                    <TableCell>{candidate.component}</TableCell>
                    <TableCell>{candidate.protocol}</TableCell>
                    <TableCell>{candidate.priority}</TableCell>
                    <TableCell>{candidate.address}</TableCell>
                    <TableCell>{candidate.port}</TableCell>
                    <TableCell>{candidate.type}</TableCell>
                    <TableCell>{candidate.relatedAddress || 'N/A'}</TableCell>
                    <TableCell>{candidate.relatedPort || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" gutterBottom>
            ICE Candidate Errors
          </Typography>
          {this.state.errors.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>URL</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Port</TableCell>
                    <TableCell>Error Code</TableCell>
                    <TableCell>Error Text</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.errors.map((error, index) => (
                    <TableRow key={index}>
                      <TableCell>{error.url}</TableCell>
                      <TableCell>{error.address || 'N/A'}</TableCell>
                      <TableCell>{error.port || 'N/A'}</TableCell>
                      <TableCell>{error.errorCode}</TableCell>
                      <TableCell>{error.errorText}</TableCell>
                      <TableCell>{error.statusCode}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <p>No ICE candidate errors.</p>
          )}
        </CardContent>
      </Card>
    );
  }
}
