import * as Styled from '../../../styles/Login/LoginComponents/Wrapper';
import CaFeliz from '../../../../../public/CaFeliz.svg'
import Image from 'next/image';
export type WrapperProps = {
  children: React.ReactNode;
};

export function Wrapper({ children }: WrapperProps) {
  return (
    <Styled.Wrapper>
       <div className="image">
        <Image 
          src='/CaFeliz.svg'
          layout="fill"
          alt=""/>
      </div>
      <div className="content">
        {children}
      </div>
    </Styled.Wrapper>
  );
}