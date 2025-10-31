// Funções de exportação para transações

/**
 * Exporta transações para CSV
 * @param {Array} transactions - Array de transações
 * @param {Array} categories - Array de categorias
 */
export const exportToCSV = (transactions, categories) => {
  if (!transactions || transactions.length === 0) {
    alert('Não há transações para exportar');
    return;
  }

  // Cabeçalhos
  const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Observações'];
  
  // Converter transações para linhas CSV
  const rows = transactions.map(transaction => {
    const category = categories.find(c => c.id === transaction.categoryId);
    const date = new Date(transaction.date).toLocaleDateString('pt-BR');
    const type = transaction.type === 'income' ? 'Receita' : 'Despesa';
    const amount = transaction.amount.toFixed(2).replace('.', ',');
    const categoryName = category ? category.name : 'Sem categoria';
    const notes = transaction.notes || '';

    return [
      date,
      `"${transaction.description.replace(/"/g, '""')}"`,
      type,
      `"${categoryName}"`,
      amount,
      `"${notes.replace(/"/g, '""')}"`
    ];
  });

  // Combinar cabeçalhos e linhas
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Adicionar BOM para UTF-8 (Excel compatibility)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Criar link de download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exporta transações para PDF simples (usando window.print ou criação de documento HTML)
 * Nota: Para PDF mais avançado, seria necessário jsPDF
 */
export const exportToPDF = (transactions, categories) => {
  if (!transactions || transactions.length === 0) {
    alert('Não há transações para exportar');
    return;
  }

  // Criar conteúdo HTML para o PDF
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Transações - Relatório</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #3B82F6;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #3B82F6;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .income {
          color: #10B981;
          font-weight: bold;
        }
        .expense {
          color: #EF4444;
          font-weight: bold;
        }
        .summary {
          margin-top: 30px;
          padding: 15px;
          background-color: #f0f0f0;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <h1>Relatório de Transações</h1>
      <p><strong>Data de Exportação:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
      <p><strong>Total de Transações:</strong> ${transactions.length}</p>
      
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Valor</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Adicionar linhas da tabela
  transactions.forEach(transaction => {
    const category = categories.find(c => c.id === transaction.categoryId);
    const date = new Date(transaction.date).toLocaleDateString('pt-BR');
    const type = transaction.type === 'income' ? 'Receita' : 'Despesa';
    const amount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(transaction.amount);
    const categoryName = category ? category.name : 'Sem categoria';
    const notes = transaction.notes || '-';
    const typeClass = transaction.type === 'income' ? 'income' : 'expense';

    htmlContent += `
      <tr>
        <td>${date}</td>
        <td>${transaction.description}</td>
        <td class="${typeClass}">${type}</td>
        <td>${categoryName}</td>
        <td class="${typeClass}">${amount}</td>
        <td>${notes}</td>
      </tr>
    `;
  });

  // Calcular resumos
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  htmlContent += `
        </tbody>
      </table>
      
      <div class="summary">
        <h2>Resumo</h2>
        <p><strong>Total de Receitas:</strong> <span class="income">${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(totalIncome)}</span></p>
        <p><strong>Total de Despesas:</strong> <span class="expense">${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(totalExpense)}</span></p>
        <p><strong>Saldo:</strong> <span style="color: ${balance >= 0 ? '#10B981' : '#EF4444'}; font-weight: bold;">${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(balance)}</span></p>
      </div>
    </body>
    </html>
  `;

  // Criar blob e abrir em nova janela para impressão
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  
  printWindow.onload = () => {
    printWindow.print();
  };
};


