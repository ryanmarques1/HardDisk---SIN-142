  
import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    width: 100vw;
    height: 100vh;

    .image {
      position: relative;
      width: 50vw;
      height: 100vh;
    }

    .content {
      width: 50vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center; /* Centraliza o conteúdo, você pode ajustar conforme necessário */
    }
  `}
`;