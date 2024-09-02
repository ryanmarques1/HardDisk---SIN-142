// utils.js ou api.js
import { useSession } from "next-auth/react";
import api from "../api/axios";

export const getSaldo = async () => {
    const { data: session } = useSession();

    if (session?.user?.id) {
        try {
        const response = await api.get(`/get-saldo`, {
            params: { user_id: session.user.id },
            headers: {
            Authorization: `Bearer ${session?.accessToken}`, // Incluindo o token de acesso
            },
        });

        return response.data.saldo; // Retorna o saldo
        } catch (error) {
        console.error("Erro ao buscar o saldo:", error);
        throw error; // Opcionalmente, você pode lançar o erro para tratamento posterior
        }
    } else {
        throw new Error("Usuário não autenticado ou ID de usuário ausente");
    }
};
