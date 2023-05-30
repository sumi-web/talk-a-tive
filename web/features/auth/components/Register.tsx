import { useRegister } from '@/lib/auth';
import { getGoogleOAuthURL } from '@/utils/constant';
import { VStack, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button, useToast, Flex, Divider, Box, Text } from '@chakra-ui/react';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

const imageMimeType = /image\/(png|jpg|jpeg)/i;

const Register = () => {
  const router = useRouter();

  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { mutate } = useRegister();

  const submitHandler = async () => {
    setIsLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: 'Please Fill all the Feilds',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      setIsLoading(false);
      return;
    }

    if (!imagePreview || !image) {
      toast({
        title: 'Please select an image',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      setIsLoading(false);
      return;
    }

    try {
      const data = mutate({ name, email, password, image });

      console.log(data);
      toast({
        title: 'Registration Successful',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setIsLoading(false);
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
      setIsLoading(false);
    }
  };

  const selectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (!files || !files.length) {
      toast({
        title: 'Please Select an Image!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setImagePreview('');
      return;
    }

    const file = files[0];

    if (!file.type.match(imageMimeType)) {
      toast({
        title: '!Image mime type is not valid',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setImagePreview('');

      return;
    }

    if (file) {
      const fileReader = new FileReader();

      fileReader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;

        if (result) {
          setImagePreview(result.toString());
        }
      };

      setImageFile(files[0]);

      fileReader.readAsDataURL(file);
    }
  };

  const postDetails = (pics: File | null) => {
    setIsLoading(true);
    if (pics === undefined || pics === null) {
      toast({
        title: 'Please Select an Image!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      return;
    }
    console.log(pics);
    if (pics.type === 'image/jpeg' || pics.type === 'image/png') {
      const data = new FormData();
      data.append('file', pics);
      data.append('upload_preset', 'chat-app');
      data.append('cloud_name', 'piyushproj');
      fetch('https://api.cloudinary.com/v1_1/piyushproj/image/upload', {
        method: 'post',
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setImageFile(data.url.toString());
          console.log(data.url.toString());
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    } else {
      toast({
        title: 'Please Select an Image!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setIsLoading(false);
      return;
    }
  };

  return (
    <>
      <VStack spacing="5px">
        <FormControl id="first-name" isRequired>
          <FormLabel>Name</FormLabel>
          <Input placeholder="Enter Your Name" onChange={(e) => setName(e.target.value)} />
        </FormControl>
        <FormControl id="email" isRequired>
          <FormLabel>Email Address</FormLabel>
          <Input type="email" placeholder="Enter Your Email Address" onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup size="md">
            <Input type={show ? 'text' : 'password'} placeholder="Enter Password" onChange={(e) => setPassword(e.target.value)} />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup size="md">
            <Input type={show ? 'text' : 'password'} placeholder="Confirm password" onChange={(e) => setConfirmPassword(e.target.value)} />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl id="pic">
          <FormLabel>Upload your Picture</FormLabel>
          <Input type="file" p={1.5} accept="image/*" onChange={selectImage} />
        </FormControl>
        {imagePreview && (
          <Box>
            <Image src={imagePreview} width={100} height={100} alt="preview" />
          </Box>
        )}

        <Button
          colorScheme="blue"
          width="100%"
          style={{ marginTop: 15 }}
          onClick={() => {
            mutate({ name, password, email, image: image as File });
          }}
          isLoading={isLoading}
        >
          Sign Up
        </Button>
      </VStack>
      <Box width={'100%'} mt="20px" mb="30px" position={'relative'}>
        <Divider />
        <Text as={'span'} background="white" position="absolute" left={'50%'} top="50%" px={'20px'} transform={'translate(-50%, -50%)'}>
          or
        </Text>
      </Box>
      <Flex justifyContent={'center'} gap="3rem">
        <a href={getGoogleOAuthURL()}>
          <Box cursor={'pointer'}>
            <Image src={'/icons/chrome.png'} width={30} height={30} alt={''} />
          </Box>
        </a>
        <Image src={'/icons/facebook.png'} width={30} height={30} alt={''} />
      </Flex>
    </>
  );
};

export default Register;
