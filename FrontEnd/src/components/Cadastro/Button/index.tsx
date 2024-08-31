import { ButtonHTMLAttributes } from 'react';
import * as Styled from '../../../styles/Login/LoginComponents/Button';

export type ButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({
  children,
  disabled = false,
  onClick,
  icon,
  color = 'primary',
}: ButtonProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Styled.Button disabled={disabled} onClick={handleClick} color={color}>
      {children}
      {!!icon && icon}
    </Styled.Button>
  );
};