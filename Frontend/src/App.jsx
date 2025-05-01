import { useState } from 'react'
import Container from '@mui/material/Container';
import { Box, Button,CircularProgress, FormControl, InputLabel, MenuItem, Select, TextareaAutosize, TextField, Typography } from '@mui/material';
import axios from 'axios';
import Slider from '@mui/material/Slider';
import Card from '@mui/material/Card';
import LabeledTextarea from './components/LabeledTextArea.jsx';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useMemo } from 'react'
import { createTheme, ThemeProvider, CssBaseline, IconButton, InputAdornment} from '@mui/material'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Brightness4, Brightness7 } from '@mui/icons-material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


function App() {
  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("");
  const [replyLength, setReplyLength] = useState(0);
  const [intent, setIntent] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [generatedSubject, setGeneratedSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [modifyLoading, setModifyLoading] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyHistory, setReplyHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [customKeywords, setCustomKeywords] = useState("");
  const [format, setFormat] = useState("");
  const [tabIndex, setTabIndex] = useState('one');
  const [mode, setMode] = useState('light')
  const [language, setLanguge] = useState("english")


  const MAX = 15;
  const MIN = 0;
  const marks = [
    { value: MIN, label: '' },
    { value: MAX, label: '' },
  ];


  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        typography:{
          fontSize:12,
        }
      }),
    [mode]
  )

  const toggleDarkMode = () => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleRequest = async ({ url, payload, setLoadingState}) => {
    setLoadingState(true);
    setError("");
  
    try {
      const res = await axios.post(url, payload);
      return typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    } catch (error) {
      setError("Failed to generate email reply. Please try again!");
      console.error(error);
    } finally {
      setLoadingState(false);
    }
  };
  
  const handleSubject = () => {
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

  const handleSubmit = async () => {
    setReplyHistory([]);
    setCurrentIndex(0);
    
    const response = await handleRequest({
      url: "http://localhost:8081/api/email/generate",
      payload: {
        emailContent,
        tone,
        length : replyLength == 0 ? "" : replyLength,
        intent,
        format,
        customKeywords,
        language
      },
      setLoadingState: setLoading,
    });
    console.log(replyLength);
    const subjectMatch = response.match(/^Subject:\s*(.*)/);
    const bodyMatch = response.split('\n').slice(1).join('\n').trim();

    if (subjectMatch) {
      const extractedSubject = subjectMatch[1].trim();
      setGeneratedSubject(extractedSubject);
    }

    setGeneratedReply(bodyMatch);
    addToReplyHistory(bodyMatch);
    setTabIndex("two");

  };
  
  const handleModification = async (modificationType) => {
    const response = await handleRequest({
      url: "http://localhost:8081/api/email/modify-generated-reply",
      payload: {
        generatedReply,
        modification: modificationType,
      },
      setLoadingState: setModifyLoading,
    });

    setGeneratedReply(response);
    addToReplyHistory(response);
  };

  const addToReplyHistory = (response) => {
    setReplyHistory(prev => {
      const newHistory = [...prev, response];
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  };
  
  const handleRightArrow = async () => {
    if (currentIndex < replyHistory.length - 1) {
      const newIndex = currentIndex + 1;
      setGeneratedReply(replyHistory[newIndex]);
      setCurrentIndex(newIndex);
    } else {
      handleModification("Alternative");
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
    <ThemeProvider theme={theme}>
    <CssBaseline />
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <IconButton onClick={toggleDarkMode} color="inherit">
          {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
        </IconButton>
      </Box>

      <Box 
      sx={{
        resize: "both",
        overflow: "auto",
      }}>
        <Box sx={{ py: 3, borderRadius: 2 }}>
          <Typography 
            variant='h2' 
            component="h1" 
            textAlign='center' 
            color="textPrimary"
            sx={{ fontWeight: 'bold', fontFamily: 'serif' }}>
            Smart Email Reply Generator
          </Typography>
          <Typography variant='subtitle1' textAlign='center' color="textSecondary">
            Your AI-powered response assistant
          </Typography>
        </Box>

        <Container sx={{width:'780px'}}>
          <Box sx={{ width: '100%' }}>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              textColor="secondary"
              indicatorColor="secondary"
              aria-label="secondary tabs example"
            >
              <Tab value="one" label="Email Details" />
              <Tab value="two" label="Generated Reply" />
            </Tabs>
          </Box>

          <Box sx={{my:1}}>
            {tabIndex === "one" && (
            <Card 
              sx={{
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)', 
                borderRadius: '20px',
                padding: 3, 
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.2)',
                }
              }}>

              <LabeledTextarea
                label="Email Content"
                labelBoldness={600}
                placeholder="Paste the email here to get response..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />

              <Typography variant="subtitle1" sx={{fontWeight: '10'}}>
                Optional Fields : 
              </Typography>
              
              <Box sx={{my:1, p:2,  border: '1px solid grey' , borderRadius: '12px'}}>
                <Box sx={{ display: 'flex', gap: 2}}>
                  <FormControl sx={{flex:1}}>
                    <InputLabel>Tone</InputLabel>
                    <Select
                      value={tone || ''}
                      label={"Tone"}
                      onChange={(e) => setTone(e.target.value)}>
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="professional">Professional</MenuItem>
                        <MenuItem value="casual">Casual</MenuItem>
                        <MenuItem value="friendly">Friendly</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl sx={{ flex:1}}>
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

                  <FormControl sx={{ flex:1}}>
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
                </Box>

                <TextField sx={{my:2}}
                  label="Preferred Keywords"
                  variant="outlined"
                  fullWidth
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  helperText="Separate keywords by commas"
                />

                <Box sx={{display:'flex', gap:3}}>
                  <Box sx={{flex:1.5, ml:1}}>
                    <Typography variant="subtitle2" >
                      Length
                    </Typography>
                    <Slider
                      marks={marks}
                      step={1}
                      shiftStep={30}  
                      value={replyLength}
                      valueLabelDisplay="auto"
                      min={MIN}
                      max={MAX}
                      onChange={(_, newValue) => setReplyLength(newValue)}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography
                        variant="body2"
                        sx={{ cursor: 'pointer', flex:3}}>   
                        {MIN+1} Line (Min)
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ cursor: 'pointer' }}>
                        {MAX} Line (Max)
                      </Typography>
                    </Box>
                  </Box>
                
                  <FormControl sx={{mt: 2, marginLeft: 'auto', flex:1}}>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={language}
                      label={"Language"}
                      onChange={(e) => setLanguge(e.target.value)}>
                        <MenuItem value="english">English</MenuItem>
                        <MenuItem value="hindi">Hindi</MenuItem>
                        <MenuItem value="marathi">Marathi</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
          
              <Button
                variant='contained'
                onClick={handleSubmit}
                disabled={!emailContent || loading}
                fullWidth
                sx={{height:'45px', borderRadius:3, mt:2}}>
                {loading ? <CircularProgress size={24}/> : "Generate Reply"}
              </Button>
              
              {error && (
                <Typography color='error' sx={{mb:2}}>
                {error}
              </Typography>
              )}
            </Card>
            )}

            {tabIndex === "two" &&(
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

              <Typography variant="subtitle1" sx={{fontSize:18, fontWeight: 600,mb:2}}>
                Generated Reply:
              </Typography>


              <Box sx={{display: 'flex', gap:1, alignItems: 'center', mb:2}}>
                <LabeledTextarea 
                  label="Subject"
                  placeholder="Email Subject..."
                  value={generatedSubject}
                  minRows={1}
                  onChange={(e) => setGeneratedSubject(e.target.value)} 
                />

                <IconButton onClick={() => navigator.clipboard.writeText(generatedSubject)}>
                  <ContentCopyIcon />
                </IconButton>
                {/* <Button
                  variant='contained'
                  disabled={!generatedReply || subjectLoading}
                  sx={{height: '53px', borderRadius:'8px', fontSize:'18px'}}>
                  
                  Generate
                </Button> */}
              </Box>

              <LabeledTextarea
                label="Body"
                placeholder=""
                value={generatedReply}
                onChange={(e) => setGeneratedReply(e.target.value)}
                minRows={6}
              />

              <Box sx={{gap: 2, display: 'flex'}}>
                <Button variant='outlined' sx={{borderRadius:'10px'}}
                  onClick={() => handleModification("Polish")}
                  disabled={!generatedReply || modifyLoading} >
                    Polish!
                </Button>

                <Button variant='outlined' sx={{borderRadius:'10px'}}
                  onClick={() => handleModification("Expand")}
                  disabled={!generatedReply || modifyLoading} >
                    Expand!
                </Button>

                <Button variant='outlined' sx={{borderRadius:'10px'}}
                  onClick={() => handleModification("Shorten")}
                  disabled={!generatedReply || modifyLoading} >
                    Shorten!
                </Button>

                <Button variant='outlined' sx={{borderRadius:'10px', marginLeft: 'auto'}}
                  onClick={() => navigator.clipboard.writeText(generatedReply)}
                  disabled={!generatedReply || modifyLoading}>
                  Copy to Clipboard
                </Button>
              </Box>

              <Box sx={{display:'flex', alignItems: 'center', justifyContent: 'center', mt:1}}>
                <IconButton onClick={handleLeftArrow} disabled={!generatedReply || currentIndex <= 0}>
                  <NavigateBeforeIcon fontSize="large" />
                </IconButton>

                <Typography variant="body2" sx={{ mx: 2 }}>
                  Reply {currentIndex + 1} of {replyHistory.length}
                </Typography>

                <IconButton onClick={handleRightArrow} disabled={!generatedReply || modifyLoading}>
                  <NavigateNextIcon fontSize="large" />
                </IconButton>

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
                
            </Card>
            )}
          </Box>  
        </Container>
      </Box>
    
    </ThemeProvider>
  )
}

export default App
