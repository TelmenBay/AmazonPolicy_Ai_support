'use client'
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { amber, blueGrey } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: blueGrey[900], // Amazon's dark blue color
    },
    secondary: {
      main: amber[700], // Amazon's orange color
    },
  },
  typography: {
    fontFamily: "'Amazon Ember', sans-serif", // Use a font similar to Amazon's
  },
});
import { Box, Stack, TextField, Button } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello, I am the Amazon Policy Support Agent, how can I assist you today?',
    },
  ]);

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      const processText = async ({ done, value }) => {
        if (done) return result;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
        return reader.read().then(processText);
      };

      await reader.read().then(processText);
    } catch (error) {
      console.error('Error fetching chat response:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vw"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor="#f3f3f3" // Amazon's light background
      >
        <Stack
          direction="column"
          width="600px"
          height="700px"
          border="1px solid #ccc" // Lighter border
          borderRadius={4}
          boxShadow={3} // Slight shadow for depth
          p={2}
          spacing={2}
          bgcolor="white"
        >
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant' ? 'primary.main' : 'secondary.main'
                  }
                  color="white"
                  borderRadius={16}
                  p={2}
                  maxWidth="80%"
                >
                  {message.content}
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Your message"
              variant="outlined"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={sendMessage}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
