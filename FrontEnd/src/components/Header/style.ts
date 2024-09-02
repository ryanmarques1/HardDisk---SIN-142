import styled from 'styled-components';
// import { theme } from '../../styles/theme';

export const Container = styled.header`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  
  width: 100%;
  padding: 16px 48px;

  background: rgb(8,33,92);
  background: linear-gradient(90deg, rgba(8,33,92,0.95) 0%, rgba(34,71,156,0.95) 51%, rgba(8,33,92,0.95) 100%);

  img {
    max-width: 170.2px;
    max-height: 85.1px;
  }

  @media(max-width: 720px) {
    padding: 16px 24px;
  }
`;