import styled from 'styled-components';
import { motion } from 'framer-motion';
import theme from '../../styles/theme';
import { BarStyleProps, DotStyleProps } from './types';

export const ShortcutContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;


  flex-direction: column;

  width: 151px;
  height: 131px;

  padding: 14px;

  background-color: #FFF;

  border-radius: 10px;

  box-shadow: 0px 0px 23px -1px rgba(0, 0, 0, 0.1);

  div {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 71px;
    width: 71px;

    border-radius: 71px;

    background-color: #E8E8F0;
  }

  p {
    line-height: 1.5rem;
    margin-top: 8px;
    font-weight: 500;
    font-size: 0.75rem;
    color: #7A7A80
  }
`;

export const BasicContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;

  padding: 21px;

  border-radius: 10px;

  box-shadow: 0px 2px 3px rgba(50, 50, 50, 0.25);

  width: 100%;
  height: 100%;

  background-color: #FFF;
`;

export const CreditHeader = styled(motion.div)`
  display: flex;
  width: 100%;

  align-items: center;

  img {
    margin-right: 8px;
    width: 30px;
    height: 30px; 
  }

  p {
    font-size: 0.875rem;
    font-weight: 500;
    color: #7A7A80;

  }

  p:last-child {
    font-weight: 400;
    color: #7A7A80;

    span {
      font-weight: 500;
    }
  }

  & > span {
    margin: 0 8px;
  }
`;

export const CreditContent = styled(motion.div)`
  display: flex;
  width: 100%;

  align-items: center;
  justify-content: space-between;

  margin: 24px 0;

  @media(max-width: 720px) {
    flex-direction: column;

    & > div {
      margin-top: 1rem;
    }

    & > div:first-child {
      margin: 0;
    }
  } 
  h3{
    color: #7A7A80;
  }
`;

export const Box = styled(motion.div)`
  display: flex;
  align-items: center;

  margin-bottom: 20px; /* Espaço entre os componentes Box */


  span {
    margin-right: 10px;
  }

  div {

    p {
      font-weight: 500;
      font-size: 0.875rem;
      color: #7A7A80;
    }
  }
`;

export const Dot = styled.span<DotStyleProps>`
  width: 6px;
  height: 6px;

  border-radius: 6px;

  background-color: ${(props) => props.color};
`;

export const BarContainer = styled.div`
  display: flex;
  position: relative;

  height: 7px;
  width: 100%;

  background-color: #f3f3f3;
  border-radius: 7px;

  overflow: hidden;
`;

export const Bar = styled(motion.div)<BarStyleProps>`
  display: flex;
  height: 7px;
  // position: absolute;

  background-color: ${(props) => props.color};
  width: ${(props) => props.porcentage}%;
`;


export const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  margin-right : 15px;
  width: 100px;
  color: ${(props) => props.theme.darkGray};
`;

export const Select = styled.select`
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  appearance: none;
  cursor: pointer;

  &:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 1px #007bff;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.lightGray};
  font-size: 16px;

  /* Remove the arrows for number input in Chrome, Safari, Edge, and Opera */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Remove arrows in Firefox */
  -moz-appearance: textfield;

  /* Additional styling */
  padding: 8px;
  font-size: 16px;
`;

export const Button = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 4px;
  background-color: #0606A5;
  color: ${(props) => props.theme.white};
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  
  &:hover {
    background-color: ${(props) => props.theme.darkGray};
  }
`;

export const TitleRK = styled.h3`
  text-align: center;
  margin-bottom: 20px; /* Espaço abaixo do título */
  margin-top: 20px;    /* Espaço acima do título */
  width: 100%; 
  padding: 10px;       /* Adiciona preenchimento ao redor do título */
  // background-color: #f0f0f0; /* Cor de fundo para destacar o título */
  color: ${(props) => props.theme.darkGray};
  border-radius: 5px;  /* Bordas arredondadas para suavizar o visual */
`;


export const KeyList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  color: ${(props) => props.theme.darkGray};
  width: 100%; /* Garante que a lista ocupe toda a largura do container */
`;

export const KeyItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;

  &:hover {
    background-color: #e0e0e0;
  }
`;

export const DeleteButton = styled.button`
  background-color: #ff6b6b;
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ff4c4c;
  }

  &:focus {
    outline: none;
  }
`;

export const HistoryContainer = styled.div`
  background-color: ${props => props.theme.white};
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 15px;

  p {
    font-weight: 500;
    font-size: 0.875rem;
    color: #7A7A80;
  }
`;

export const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid ${props => props.theme.lightGray};

  p {
    margin: 0;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Message = styled.p`
  color: #333; // Cor do texto
  font-size: 16px;
  margin: 0;
`;
