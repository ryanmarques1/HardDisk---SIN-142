import styled, { css } from 'styled-components';

export const Wrapper = styled.form`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 100;
  height: 100%;
  width: 60%;
  flex-direction: column;
  background-color: #ffffff;
  border-top-left-radius: 3vw;
  border-bottom-left-radius: 3vw;
  .FormL{
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-left: 8vw;
    padding-right: 8vw;
  }
  h1{
    color: #000;
    margin-bottom: 2vh;
  }
  .ProgresBarButtons{
      display: flex;
      flex-direction: row;
      margin-bottom: 4vh;
  }
  .Button-P{
    padding: 0vw;
  }
`;

export const ButtonWrapper = styled.div``;

export const ErrorMessage = styled.p`
  ${({ theme }) => css`
    background: ${theme.colors.warning};
    color: ${theme.colors.white};
    padding: ${theme.spacings.xsmall} ${theme.spacings.small};
  `}
`;