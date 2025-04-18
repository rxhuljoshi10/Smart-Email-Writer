import { useState } from 'react'
import Container from '@mui/material/Container';
import { Box, Button, AppBar, Toolbar, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';
import Slider from '@mui/material/Slider';
import Card from '@mui/material/Card';
import LabeledTextarea from './components/LabeledTextArea.jsx';


function App() {
  const[emailContent, setEmailContent] = useState("");
  const[tone, setTone] = useState("");
  const [replyLength, setReplyLength] = useState();
  const[intent, setIntent] = useState("");
  const[generatedReply, setGeneratedReply] = useState("");
  const[loading, setLoading] = useState(false);
  const[modifyLoading, setModifyLoading] = useState(false);
  const[error, setError] = useState("");
  const [replyHistory, setReplyHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [customKeywords, setCustomKeywords] = useState("");
  const [format, setFormat] = useState("");
  const MAX = 15;
  const MIN = 1;
  const marks = [
    { value: MIN, label: '' },
    { value: MAX, label: '' },
  ];


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
        length : replyLength,
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
    <>
    <Box sx={{ py: 3, borderRadius: 2, my: 4 }}>
      <Typography 
        variant='h2' 
        component="h1" 
        textAlign='center' 
        color="#000000"
        sx={{ fontWeight: 'bold', fontFamily: 'serif' }}>
        Smart Email Reply Generator
      </Typography>
      <Typography variant='subtitle1' textAlign='center' color="textSecondary">
        Your AI-powered response assistant
      </Typography>
    </Box>

    <Container sx={{width:'950px'}}>
      <Card 
        sx={{
          mb:6,
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)', // soft shadow
          borderRadius: '20px', // rounded corners
          padding: 3, // spacing inside
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)', // slight lift on hover
            boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.2)', // stronger shadow
          }
        }}>

        <LabeledTextarea
          label="Email Content"
          placeholder="Paste the email here to get response..."
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 2 }}>
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

          {/* <FormControl sx={{mb: 2, mr:2, width: '250px'}}>
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
          </FormControl> */}

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

          <Box sx={{ width: 400 }}>
            <Typography variant="subtitle2" gutterBottom>
              Length Preference
            </Typography>
            <Slider
              marks={marks}
              step={1}
              value={replyLength}
              valueLabelDisplay="auto"
              min={MIN}
              max={MAX}
              onChange={(_, newValue) => setReplyLength(newValue)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer' }}>
                {MIN} Min
              </Typography>
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer' }}>
                {MAX} Max
              </Typography>
            </Box>
          </Box>

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
          fullWidth
          sx={{height:'50px'}}>
          {loading ? <CircularProgress size={24}/> : "Generate Reply"}
        </Button>
        
        {error && (
          <Typography color='error' sx={{mb:2}}>
          {error}
        </Typography>
        )}
      </Card>

      {generatedReply && (
        <Card 
          sx={{
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)', // soft shadow
            borderRadius: '20px', // rounded corners
            padding: 3, // spacing inside
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)', // slight lift on hover
              boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.2)', // stronger shadow
            }
          }}>

          <LabeledTextarea
            label="Generated Reply"
            placeholder=""
            value={generatedReply}
            onChange={(e) => setGeneratedReply(e.target.value)}
          />

          <Box sx={{ mt:5}}>
            {/* <Typography variant='h6' gutterBottom>
              Generated Reply
            </Typography> */}

            {/* <Box sx={{ position: 'relative', width: '100%' }}> */}
              <Box sx={{ display: 'flex', alignItems: 'center' , position: 'relative'}}>
                <Button onClick={handleLeftArrow} disabled={currentIndex <= 0} sx={{ minWidth: '40px' }}>
                  ⬅️
                </Button>
{/* 
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  variant='outlined'
                  value={generatedReply || ""}
                  onChange={(e) => setGeneratedReply(e.target.value)}
                  inputProps={{ "aria-readonly": true }}
                /> */}

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
        </Card>
      )}
    </Container>
    </>
  )
}

export default App
