import { Inter } from "@next/font/google";
import { Box, Container, Flex, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import Login from "../components/auth/Login";
import Signup from "../components/auth/Signup";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <Container maxW="xl" centerContent>
      <Flex justifyContent="center" p={3} bg="white" w="100%" m="40px 0 15px 0" borderRadius="lg" borderWidth="1px">
        <Text fontSize="4xl" fontFamily="Work sans">
          Talk-A-Tive
        </Text>
      </Flex>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs isFitted variant="soft-rounded" colorScheme={"blue"}>
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}
