import { VStack, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button, useToast, Box, Divider, Flex, Text } from '@chakra-ui/react';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

const Login = () => {
  const router = useRouter();

  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: 'Please Fill all the Feilds',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
      return;
    }

    // console.log(email, password);
    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };

      const { data } = await axios.post('/api/user/login', { email, password }, config);

      // console.log(JSON.stringify(data));
      toast({
        title: 'Login Successful',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      router.push('/chats');
    } catch (error: any) {
      toast({
        title: 'Error Occured!',
        description: error.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
    }
  };

  return (
    <>
      <VStack spacing="10px">
        <FormControl id="email" isRequired>
          <FormLabel>Email Address</FormLabel>
          <Input value={email} type="email" placeholder="Enter Your Email Address" onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup size="md">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? 'text' : 'password'} placeholder="Enter password" />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <Button colorScheme="blue" width="100%" style={{ marginTop: 15 }} onClick={submitHandler} isLoading={loading}>
          Login
        </Button>
        <Button
          variant="solid"
          colorScheme="red"
          width="100%"
          onClick={() => {
            setEmail('guest@example.com');
            setPassword('123456');
          }}
        >
          Get Guest User Credentials
        </Button>
      </VStack>
      <Box width={'100%'} mt="20px" mb="30px" position={'relative'}>
        <Divider />
        <Text as={'span'} background="white" position="absolute" left={'50%'} top="50%" px={'20px'} transform={'translate(-50%, -50%)'}>
          or
        </Text>
      </Box>
      <Flex justifyContent={'center'} gap="3rem">
        <Box cursor={'pointer'}>
          <Image src={'/icons/chrome.png'} width={30} height={30} alt={''} />
        </Box>
        <Box cursor={'pointer'}>
          <Image src={'/icons/facebook.png'} width={30} height={30} alt={''} />
        </Box>
      </Flex>
    </>
  );
};

export default Login;
