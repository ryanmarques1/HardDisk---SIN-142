import React, { useEffect, useState } from "react";
import { Bar, BarContainer, BasicContainer, Box, CreditContent, CreditHeader, Dot, ShortcutContainer, HistoryContainer, HistoryItem } from "./styles";
import { ShortcutCardProps } from "./types";
import { useSession } from "next-auth/react";
import api from "../../api/axios";

export const ShortcutCard = ({ title, icon }: ShortcutCardProps) => {
  return (
    <ShortcutContainer whileHover={{ y: -4 }}>
      <div>
        {icon}
      </div>
      <p>{title}</p>
    </ShortcutContainer>
  );
}

const theme = {
  background: '#F7F7FF',
  primary: '#820AD1',
  black: '#323232',
  white: '#FFF',
  lightGray: '#E8E8F0',
  darkGray: '#7A7A80',
  purpleGray: '#DED2ED',
  orange: '#FF7900',
  green: '#00DD16',
  blue: '#009BDD',
}

export const CreditCard = () => {
  const { data: session } = useSession();
  const [saldo, setSaldo] = useState<number>(0);
  const [entrada, setEntrada] = useState<number>(0); // Iniciar com 0
  const [saida, setSaida] = useState<number>(0); // Iniciar com 0
  const [historico, setHistorico] = useState<Array<{ date: string, description: string, amount: number }>>([]);

  useEffect(() => {
    const fetchSaldo = async () => {
      if (session?.user?.id) {
        try {
          const response = await api.get(`/get-saldo`, {
            params: { user_id: session.user.id },
            headers: {
              Authorization: `Bearer ${session?.accessToken}`, // Incluindo o token de acesso
            },
          });

          setSaldo(response.data.saldo); // Assume que o saldo está retornando na chave 'saldo'
        } catch (error) {
          console.error("Erro ao buscar o saldo:", error);
        }
      }
    };
    
    const fetchHistorico = async () => {
      if (session?.user?.id) {
        try {
          const response = await api.get(`/operacoes`, {
            params: { user_id: session.user.id },
            headers: {
              Authorization: `Bearer ${session?.accessToken}`, // Incluindo o token de acesso
            },
          });
          
          const historicoData = response.data; // Assume que o histórico está retornando na chave 'historico'
          setHistorico(historicoData);

          // Calcular entradas e saídas
          const totalEntrada = historicoData
            .filter((item: any) => item.tipo === "dPix")
            .reduce((acc: number, curr: any) => acc + curr.valor, 0);

          const totalSaida = historicoData
            .filter((item: any) => item.tipo === "sPix")
            .reduce((acc: number, curr: any) => acc + curr.valor, 0);

          setEntrada(totalEntrada);
          setSaida(totalSaida);

        } catch (error) {
          console.error("Erro ao buscar o histórico:", error);
        }
      }
    };

    fetchHistorico();
    fetchSaldo();
    
  }, [session]);

  const total = saldo + entrada - saida; 
  return (
    <>
      <BasicContainer>
        <CreditHeader>
          <img src="/saldobank.svg" alt="card" />
          <p>Dados da Conta</p>
        </CreditHeader>

        <CreditContent>
          <Box>
            <Dot color={theme.green} />
            <div>
              <h3>R$ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}</h3>
              <p>Saldo Atual</p>
            </div>
          </Box>

          <Box>
            <Dot color={theme.blue} />
            <div>
              <h3>R$ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entrada)}</h3>
              <p>Valor de Entrada</p>
            </div>
          </Box>

          <Box>
            <Dot color={theme.orange} />
            <div>
              <h3>R$ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saida)}</h3>
              <p>Valor de Saída</p>
            </div>
          </Box>
        </CreditContent>

        
        <BarContainer>
          {saldo + entrada + Math.abs(saida) > 0 ? (
            <>
              <Bar color={theme.green} porcentage={(saldo / total)*100} />
              <Bar color={theme.blue} porcentage={(entrada / total)*100} />
              <Bar color={theme.orange} porcentage={(Math.abs(saida) / total)*100} />
            </>
          ) : (
            // Se saldo + entrada + Math.abs(saida) for 0, evitar divisão por zero
            <>
              <Bar color={theme.green} porcentage={0} />
              <Bar color={theme.blue} porcentage={0} />
              <Bar color={theme.orange} porcentage={0} />
            </>
          )}
        </BarContainer>

      </BasicContainer>
    </>
  )
}
