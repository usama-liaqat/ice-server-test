import { Box, Button, Stack, TextField } from '@mui/material';
import { useCallback, useState } from 'react';
import { IceServerState } from '../components';

export function TurnTesting() {
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([]);

  const addIceServer = useCallback(
    (server: RTCIceServer) => {
      setIceServers((prevState) => [...prevState, server]);
    },
    [setIceServers],
  );

  const removeIceServer = useCallback(
    (index: number) => {
      setIceServers((prevState) => {
        return prevState.filter((_, currentIndex) => {
          return currentIndex !== index;
        });
      });
    },
    [setIceServers],
  );

  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAddServer = useCallback(() => {
    if (!url) {
      alert('URL is required');
      return;
    }
    addIceServer({ urls: url, username, credential: password });
    setUrl('');
    setUsername('');
    setPassword('');
  }, [addIceServer, setUrl, setUsername, setPassword, url, username, password]);
  return (
    <Stack spacing={3}>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxWidth: '100%',
          margin: 'auto',
          padding: 2,
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <TextField
          label="URL"
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddServer}
          fullWidth
        >
          Add Server
        </Button>
      </Box>
      {iceServers.map((iceServer, index) => {
        return (
          <IceServerState
            key={index}
            iceServer={iceServer}
            onRemove={() => removeIceServer(index)}
          />
        );
      })}
    </Stack>
  );
}
