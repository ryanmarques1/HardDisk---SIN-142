import { motion } from 'framer-motion';
import styled from 'styled-components';

export const ButtonContainer = styled(motion.button)`
  padding: 0.6rem 1.7rem;

  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 22px;

  border: none;

  font-weight: 600;

  font-size: 1rem;

  background: #f0f0f0 ;

  img {
     margin-right: 10px;
  }
`;

export const IconButtonContainer = styled(motion.button)`
  display: flex;

  align-items: center;
  justify-content: center;

  border: none;

  background: transparent;
`;