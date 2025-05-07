import { useState, useEffect } from 'react'
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import axios from 'axios';
import Slider from '@mui/material/Slider';
import Card from '@mui/material/Card';
import LabeledTextarea from './components/LabeledTextArea.jsx';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useMemo } from 'react'
import { createTheme, ThemeProvider, CssBaseline, IconButton} from '@mui/material'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Brightness4, Brightness7 } from '@mui/icons-material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DynamicSelect from './components/DynamicSelect.jsx';

function App() {
  const base_url = import.meta.env.VITE_BASE_URL;

  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("");
  const [intent, setIntent] = useState("");
  const [format, setFormat] = useState("");
  const [language, setLanguge] = useState("English")
  const [toneOptions, setToneOptions] = useState(() => {
    const savedToneOptions = JSON.parse(localStorage.getItem('savedToneOptions'));
    return savedToneOptions || ['Professional', 'Casual', 'Friendly']
  });
  const [intentOptions, setIntentOptions] = useState(() => {
    const savedIntentOptions = JSON.parse(localStorage.getItem('savedIntentOptions'));
    return savedIntentOptions || ['Confirming', 'Declining', 'Agreeing', "Clarification", "Give Update"]
  });
  const [formatOptions, setFormatOptions] = useState(() => {
    const savedFormatOptions = JSON.parse(localStorage.getItem('savedFormatOptions'));
    return savedFormatOptions || ['Paragraph', 'Bullet Points', 'Email Format']
  });

  const [langOptions, setLangOptions] = useState(['English', 'Hindi', 'Marathi']);
  const [replyLength, setReplyLength] = useState(0);
  const [generatedReply, setGeneratedReply] = useState("");
  const [generatedSubject, setGeneratedSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [modifyLoading, setModifyLoading] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyHistory, setReplyHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [customKeywords, setCustomKeywords] = useState("");
  const [tabIndex, setTabIndex] = useState('one');
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('mode');
    return savedMode ? savedMode : 'light';
  });

  useEffect(() => {
    const savedMode = localStorage.getItem('mode');
    if (savedMode) {
      setMode(savedMode);
    } 
  }, []);

  useEffect(() => {
    localStorage.setItem('mode', mode); 
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('savedToneOptions', JSON.stringify(toneOptions));
  }, [toneOptions])
  
  useEffect(() => {
    localStorage.setItem('savedIntentOptions', JSON.stringify(intentOptions));
  }, [intentOptions])

  useEffect(() => {
    localStorage.setItem('savedFormatOptions', JSON.stringify(formatOptions));
  }, [formatOptions])

  const MAX = 15;
  const MIN = 0;
  const marks = [
    { value: MIN, label: '' },
    { value: MAX, label: '' },
  ];


  const theme = useMemo(
    () => 
      createTheme({
        palette: {
          mode: mode || 'light',
        },
        typography: {
          fontSize: 12,
        },
        components: {
          MuiFormControl: {
            defaultProps: {
              size: 'small',
            },
          },
        },
      }),
    [mode]
  );

  const toggleDarkMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

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
      url: `${base_url}/api/email/generate`,
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
      url: `${base_url}/api/email/generate`,
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
      url: `${base_url}/api/email/modify-generated-reply`,
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

        {/* Header  */}
        <Box sx={{ 
          position: 'fixed',
          top: 0, 
          left: 0, 
          width: '100%', 
          zIndex: 1000, 
          backgroundColor: theme.palette.background.paper,
          py: 3, 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography 
            variant='h2' 
            component="h1" 
            textAlign='center' 
            color="textPrimary"
            sx={{ 
              fontWeight: 'bold', 
              fontFamily: 'serif',
              fontSize: { xs: '1.8rem', sm: '2.7rem', md: '3rem' },
              }}>
            Smart Email Reply Generator
          </Typography>
          <Typography variant='subtitle1' textAlign='center' color="textSecondary">
            Your AI-powered response assistant
          </Typography>
        </Box>

        <Box 
          sx={{ maxWidth: "720px", 
            px: 2, mx: "auto" , 
            mt: {
              xs: 13,   // small screens
              sm: 14,  // small to medium
              md: 15,  // medium and up
              lg: 16   // large screens and up
          }}}>

          {/* Tabs */}
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

          {/* Main Box */}
          <Box sx={{my:1}}>
            {tabIndex === "one" && (
            <Card 
              sx={{
                boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.1)', 
                borderRadius: '20px',
                padding: 3, 
                // transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                // '&:hover': {
                //   transform: 'translateY(-5px)',
                //   boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.2)',
                // }
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
              
              {/* Optional Fields */}
              <Box sx={{my:1, p:2,  border: '1px solid grey' , borderRadius: '12px'}}>
                <Box sx={{ display: 'flex', gap: 2}}>
                  <DynamicSelect 
                    label="Tone"
                    options={toneOptions}
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    onOptionsChange={setToneOptions}
                  />

                  <DynamicSelect
                    label="Intent"
                    options={intentOptions}
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    onOptionsChange={setIntentOptions}
                  />

                  <DynamicSelect
                    label="Format"
                    options={formatOptions}
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    onOptionsChange={setFormatOptions}
                  />
                </Box>

                <TextField size='small' sx={{my:2}}
                  label="Preferred Keywords"
                  variant="outlined"
                  fullWidth
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  helperText="Separate keywords by commas"
                />

                <Box sx={{display:'flex', gap:5, alignItems:'center'}}>
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
                
                  <DynamicSelect 
                    label="Language"
                    options={langOptions}
                    value={language}
                    onChange={(e) => setLanguge(e.target.value)}
                    onOptionsChange={setLangOptions}
                  />
                </Box>
              </Box>
          
              <Button
                variant='contained'
                onClick={handleSubmit}
                disabled={!emailContent || loading}
                fullWidth
                sx={{height:'42px', borderRadius:3, mt:2}}>
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
                boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.1)', 
                borderRadius: '20px',
                padding: 3, 
                // transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                // '&:hover': {
                //   transform: 'translateY(-5px)', // slight lift on hover
                //   boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.2)', // stronger shadow
                // }
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
        </Box>
      </Box>
    
    </ThemeProvider>
  )
}

export default App
