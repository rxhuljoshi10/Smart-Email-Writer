import { useState } from 'react'
import Container from '@mui/material/Container';
import { Box, Button, AppBar, Toolbar, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';


function App() {
  const[emailContent, setEmailContent] = useState("");
  const[tone, setTone] = useState("");
  const[length, setLength] = useState("");
  const[generatedReply, setGeneratedReply] = useState("");
  const[loading, setLoading] = useState(false);
  const[modifyLoading, setModifyLoading] = useState(false);
  const[error, setError] = useState("");


  const handleRequest = async ({ url, payload, setLoadingState }) => {
    setLoadingState(true);
    setError("");
  
    try {
      const response = await axios.post(url, payload);
      setGeneratedReply(
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data)
      );
    } catch (error) {
      setError("Failed to generate email reply. Please try again!");
      console.error(error);
    } finally {
      setLoadingState(false);
    }
  };
  
  const handleSubmit = () => {
    handleRequest({
      url: "http://localhost:8081/api/email/generate",
      payload: {
        emailContent,
        tone,
        length,
      },
      setLoadingState: setLoading,
    });
  };
  
  const handleModification = (modificationType) => {
    handleRequest({
      url: "http://localhost:8081/api/email/modify-generated-reply",
      payload: {
        generatedReply,
        modification: modificationType,
      },
      setLoadingState: setModifyLoading,
    });
  };
  

  return (
    
    <Container maxWidth="md" sx={{py:4}}>
      {/* <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" component="div">
            Photos
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
       */}
      <Typography variant='h3' component="h1" gutterBottom textAlign={'center'}>
        Smart Email Reply Generator
      </Typography>

      <Box >
        <TextField
          fullWidth
          multiline
          rows={6}
          variant='outlined'
          label="Original Email Content"
          value={emailContent || ''}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{mb:2}}
        />
        <FormControl sx={{mb: 2, mr:2, width: '300px'}}>
          <InputLabel>Tone (Optional)</InputLabel>
          <Select
            value={tone || ''}
            label={"Tone (Optional)"}
            onChange={(e) => setTone(e.target.value)}>
              <MenuItem value="">None</MenuItem>
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="casual">Casual</MenuItem>
              <MenuItem value="friendly">Friendly</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{mb: 2, width: '300px'}}>
          <InputLabel>Length</InputLabel>
          <Select
            value={length || ''}
            label={"Length"}
            onChange={(e) => setLength(e.target.value)}>
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="1 line">Short (1 line)</MenuItem>
              <MenuItem value="2-3 line">Medium (2-3 line)</MenuItem>
              <MenuItem value="5-7 line">Long (5-7 line)</MenuItem>
          </Select>
        </FormControl>
    
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={!emailContent || loading}
          fullWidth>
          {loading ? <CircularProgress size={24}/> : "Generate Reply"}
        </Button>
      </Box>

      {error && (
        <Typography color='error' sx={{mb:2}}>
        {error}
      </Typography>
      )}

      {generatedReply && (
        <Box sx={{ mt:5}}>
          <Typography variant='h6' gutterBottom>
            Generated Reply
          </Typography>

          <Box sx={{ position: 'relative', width: '100%' }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant='outlined'
            value={generatedReply || ""}
            onChange={(e) => setGeneratedReply(e.target.value)}
            inputProps={{"aria-readonly": true}}
            />

          {modifyLoading && (
              <CircularProgress
                size={20}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 1,
                }}
              />
            )}
          </Box>

          {generatedReply && ( 
          <Box sx={{mt: 2}}>
            <Button variant='outlined' sx={{mr: 3}}
              onClick={() => handleModification("Expand")}
              disabled={modifyLoading} >
                Expand!
            </Button>

            <Button variant='outlined' sx={{mr: 3}}
              onClick={() => handleModification("Shorten")}
              disabled={modifyLoading} >
                Shorten!
            </Button>

            <Button variant='outlined'
              onClick={() => navigator.clipboard.writeText(generatedReply)}>
              Copy to Clipboard
            </Button>
          </Box>
          )}
        </Box>
      )}
    </Container>
  )
}

export default App
