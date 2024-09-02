import React, { useEffect, useState } from "react";
import { Bar, BarContainer, BasicContainer, Box, CreditContent, CreditHeader, Dot, ShortcutContainer, HistoryContainer, HistoryItem } from "./styles";
import { ShortcutCardProps } from "./types";
import { useSession } from "next-auth/react";
import api from "../../api/axios";

export const ShortcutCard = ({ title, icon }: ShortcutCardProps) => {
  return (
    <ShortcutContainer
      whileHover={{ y: -4 }}
    >
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

export const History = () => {
  const { data: session } = useSession();
  const [historico, setHistorico] = useState<Array<{ date: string, description: string, amount: number }>>([]);

  useEffect(() => {
    const fetchHistorico = async () => {
      if (session?.user?.id) {
        try {
          const response = await api.get(`/operacoes`, {
            params: { user_id: session.user.id },
            headers: {
              Authorization: `Bearer ${session?.accessToken}`, // Incluindo o token de acesso
            },
          });
          
          setHistorico(response.data); // Assume que o histórico está retornando na chave 'historico'
        } catch (error) {
          console.error("Erro ao buscar o histórico:", error);
        }
      }
    };

    fetchHistorico();
  }, [session]);

  // Função para formatar a data
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    // Subtrai 3 horas
    date.setHours(date.getHours() - 3);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  

  return (
    <BasicContainer>
      <CreditHeader>
        <img src="/history.svg" alt="card" />
        <p>Histórico da Conta</p>
      </CreditHeader>
      <HistoryContainer>
        <HistoryItem>
          <p style={{ flex: 1, fontWeight: 'bold' }}>Operação</p>
          <p style={{ flex: 1, fontWeight: 'bold', textAlign: 'right' }}>Valor</p>
          <p style={{ flex: 1, fontWeight: 'bold', textAlign: 'right' }}>Data e Horário</p>
        </HistoryItem>

        {historico.length === 0 ? (
          <p>Nenhum Histórico Disponível</p>
        ) : (
          historico.map((item: any) => (
            <HistoryItem key={item.id}>
              <div style={{ flex: 1}}>
                {item.tipo === "credito" && <p>Depósito</p>}
                {item.tipo === "debito" && <p>Saque</p>}
                {item.tipo === "sPix" && <p>Saque Pix</p>}
                {item.tipo === "dPix" && <p>Depósito Pix</p>}
              </div>
              {(item.tipo === "credito" || item.tipo === "dPix") && <p style={{ flex: 1, textAlign: 'right', color: "green" }}> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}</p>}
              {(item.tipo === "debito" || item.tipo === "sPix") && <p style={{ flex: 1, textAlign: 'right', color: "red" }}> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}</p>}
                
              <p style={{ flex: 1, textAlign: 'right' }}>
                {formatDate(item.data_operacoes)}
              </p>
            </HistoryItem>
          )))}
          
      </HistoryContainer>
    </BasicContainer>
  )
}
