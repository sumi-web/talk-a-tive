import { Inter } from '@next/font/google';
import { Box, Container, Flex, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import Login from '@/features/auth/components/Login';
import Register from '@/features/auth/components/Register';
import AuthLayout from '@/components/Layout/AuthLayout';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <Container maxW="xl" centerContent mb={'20px'}>
      <Flex justifyContent="center" py={1} px={3} bg="white" w="100%" m="20px 0 5px 0" borderRadius="lg" borderWidth="1px">
        <Text fontSize="3xl" fontFamily="Work sans">
          Talk-A-Tive
        </Text>
      </Flex>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs isFitted variant="soft-rounded" colorScheme={'blue'}>
          <TabList mb="10px">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Register />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}
