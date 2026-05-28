import { Box, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { DataContext } from '../../contexts/DataContext';
import Loading from '../Loading/Loading';
import Form from './components/Form';

const Home = () => {
  const { operarios, maquinas, tiposCalidad, loading } =
    useContext(DataContext);

  return loading ? <Loading /> : <Form />;
};

export default Home;
