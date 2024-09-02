import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { ShortcutCard } from "../Cards";
import { Container } from "./style";
import { useRouter } from 'next/router';

const options = [
  {
    index: 0,
    title: 'DashBoard',
    icon: <img src='/dashboard.svg' />,
    link: '/app/dashboard'
  },
  {
    index: 1,
    title: 'Área pix',
    icon: <img src='/pix.svg' />,
    link: '/app/pix'
  },
  {
    index: 2,
    title: 'Cadastrar Pix',
    icon: <img src='/pix.svg' />,
    link: '/app/cpix'
  },
  {
    index: 3,
    title: 'Realizar Depósito',
    icon: <img src='/deposit.svg' />,
    link: '/app/deposito'
  },
  {
     index: 4,
     title: 'Realizar Saque',
     icon: <img src='/transfer.svg' />,
     link: '/app/retirar'
  },
  {
     index: 5,
     title: 'Pegar Emprestimo para o Transplante',
     icon: <img src='/money.svg' />,
     link: '/app/dashboard'
  },
  {
    index: 6,
    title: 'Doe Dinheiro para um Calvo',
    icon: <img src='/money.svg' />,
    link: '/app/dashboard'
  },
];

interface ShortcutDTO {
  index: number;
  title: string;
  icon: any;
  link: string;
}

export const ShortcutsSession = () => {
  const [shortcuts, setShortcuts] = React.useState<ShortcutDTO[]>(options);
  const router = useRouter();

  const reorder = (list: any, startIndex: any, endIndex: any) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
  };

  function onDragEnd(result: any) {
    if (!result.destination) {
      return;
    }

    const items: any = reorder(
      shortcuts,
      result.source.index,
      result.destination.index
    );

    setShortcuts(items);
  }

  const handleCardClick = (link: string) => {
    router.push(link);
  };

  return(
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="shortcut" direction="horizontal">
          {(provided, snapshot) => (
            <Container
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {shortcuts.map(option => (
                <Draggable
                  key={option.index}
                  draggableId={String(option.index)}
                  index={option.index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => handleCardClick(option.link)}
                      style={{ cursor: 'pointer' }}  // Indica que o item é clicável
                    >
                      <ShortcutCard 
                        title={option.title}
                        icon={option.icon}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
