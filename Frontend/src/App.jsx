import { useState } from 'react'
import Container from '@mui/material/Container';
import { Box, Button, AppBar, Toolbar, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';


function App() {
  const[emailContent, setEmailContent] = useState("");
  const[tone, setTone] = useState("");
  const[length, setLength] = useState("");
  const[intent, setIntent] = useState("");
  const[generatedReply, setGeneratedReply] = useState("");
  const[loading, setLoading] = useState(false);
  const[modifyLoading, setModifyLoading] = useState(false);
  const[error, setError] = useState("");
  const [replyHistory, setReplyHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [customKeywords, setCustomKeywords] = useState("");
  const [format, setFormat] = useState("");



  const handleRequest = async ({ url, payload, setLoadingState, updateHistory = true }) => {
    setLoadingState(true);
    setError("");
  
    try {
      const response = await axios.post(url, payload);
      const newReply = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
      setGeneratedReply(newReply);
  
      if (updateHistory) {
        setReplyHistory(prev => {
          const newHistory = [...prev, newReply];
          setCurrentIndex(newHistory.length - 1);
          return newHistory;
        });
      }
    } catch (error) {
      setError("Failed to generate email reply. Please try again!");
      console.error(error);
    } finally {
      setLoadingState(false);
    }
  };
  
  const handleSubmit = () => {
    setReplyHistory([]);
    setCurrentIndex(-1);
    
    handleRequest({
      url: "http://localhost:8081/api/email/generate",
      payload: {
        emailContent,
        tone,
        length,
        intent,
        format,
        customKeywords
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
  
  const handleRightArrow = () => {
    if (currentIndex < replyHistory.length - 1) {
      const newIndex = currentIndex + 1;
      setGeneratedReply(replyHistory[newIndex]);
      setCurrentIndex(newIndex);
    } else {
      handleRequest({
        url: "http://localhost:8081/api/email/generate",
        payload: {
          emailContent,
          tone,
          length,
        },
        setLoadingState: setModifyLoading,
        updateHistory: true,
      });
    }
  };
  
  const handleLeftArrow = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setGeneratedReply(replyHistory[newIndex]);
      setCurrentIndex(newIndex);
    }
  };
  
  
  return (
    
    <Container maxWidth="md" sx={{py:4}}>
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

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <FormControl sx={{mb: 2, mr:2, width: '250px'}}>
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

        <FormControl sx={{mb: 2, mr:2, width: '250px'}}>
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

        <FormControl sx={{mb: 2, width: '250px'}}>
          <InputLabel>Intent</InputLabel>
          <Select
            value={intent || ''}
            label={"Intent"}
            onChange={(e) => setIntent(e.target.value)}>
              <MenuItem value="">None</MenuItem>
              <MenuItem value="confirm">Confirming</MenuItem>
              <MenuItem value="decline">Declining</MenuItem>
              <MenuItem value="agree">Agreeing</MenuItem>
              <MenuItem value="clarification">Asking for Clarification</MenuItem>
              <MenuItem value="update">Giving an Update</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{mb: 2, width: '250px'}}>
          <InputLabel>Format</InputLabel>
          <Select
            value={format || ''}
            label={"Format"}
            onChange={(e) => setFormat(e.target.value)}>
              <MenuItem value="">None</MenuItem>
              <MenuItem value="paragraph">Paragraph</MenuItem>
              <MenuItem value="bullets">Bullet Points</MenuItem>
              <MenuItem value="template">Full Email Template</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Preferred Keywords (Optional)"
          variant="outlined"
          fullWidth
          value={customKeywords}
          onChange={(e) => setCustomKeywords(e.target.value)}
          helperText="Separate keywords by commas"
        />

        </Box>
    
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

          {/* <Box sx={{ position: 'relative', width: '100%' }}> */}
            <Box sx={{ display: 'flex', alignItems: 'center' , position: 'relative'}}>
              <Button onClick={handleLeftArrow} disabled={currentIndex <= 0} sx={{ minWidth: '40px' }}>
                ⬅️
              </Button>

              <TextField
                fullWidth
                multiline
                rows={6}
                variant='outlined'
                value={generatedReply || ""}
                onChange={(e) => setGeneratedReply(e.target.value)}
                inputProps={{ "aria-readonly": true }}
              />

              <Button onClick={handleRightArrow} disabled={loading} sx={{ minWidth: '40px' }}>
                ➡️
              </Button>

              {modifyLoading && (
              <CircularProgress
                size={20}
                sx={{
                  position: 'absolute',
                  top: 14,
                  right: 50,
                  // zIndex: 1,
                }}
              />)}
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
