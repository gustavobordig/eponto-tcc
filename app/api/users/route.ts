import { NextResponse } from 'next/server';

interface User {
  id?: number;
  nome: string;
  dataNascimento: string;
  email: string;
  telefone: number;
  idCargo: number;
  idJornada: number;
}

// Simulando um banco de dados em memória
const users: User[] = [];

export async function GET() {
  try {
    return NextResponse.json({ 
      sucesso: true,
      mensagem: 'Usuários recuperados com sucesso',
      usuarios: users 
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ 
      sucesso: false,
      mensagem: 'Erro ao buscar usuários',
      usuarios: null 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newUser: User = {
      ...body,
      id: users.length + 1
    };
    users.push(newUser);
    
    return NextResponse.json({ 
      sucesso: true,
      mensagem: 'Usuário criado com sucesso',
      usuario: newUser 
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json({ 
      sucesso: false,
      mensagem: 'Erro ao criar usuário',
      usuario: null 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const index = users.findIndex(user => user.id === body.id);
    
    if (index === -1) {
      return NextResponse.json({ 
        sucesso: false,
        mensagem: 'Usuário não encontrado',
        usuario: null 
      }, { status: 404 });
    }

    users[index] = body;
    
    return NextResponse.json({ 
      sucesso: true,
      mensagem: 'Usuário atualizado com sucesso',
      usuario: body 
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ 
      sucesso: false,
      mensagem: 'Erro ao atualizar usuário',
      usuario: null 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        sucesso: false,
        mensagem: 'ID do usuário não fornecido',
        usuario: null 
      }, { status: 400 });
    }

    const index = users.findIndex(user => user.id === parseInt(id));
    
    if (index === -1) {
      return NextResponse.json({ 
        sucesso: false,
        mensagem: 'Usuário não encontrado',
        usuario: null 
      }, { status: 404 });
    }

    const deletedUser = users[index];
    users.splice(index, 1);
    
    return NextResponse.json({ 
      sucesso: true,
      mensagem: 'Usuário deletado com sucesso',
      usuario: deletedUser 
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return NextResponse.json({ 
      sucesso: false,
      mensagem: 'Erro ao deletar usuário',
      usuario: null 
    }, { status: 500 });
  }
} 