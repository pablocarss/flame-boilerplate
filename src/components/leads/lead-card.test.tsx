import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/helpers/test-utils';
import { LeadCard } from './lead-card';
import { createMockLead } from '@/test/helpers/test-data';

describe('LeadCard', () => {
  const mockLead = createMockLead('org-123', {
    id: 'lead-123',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Corp',
    position: 'CEO',
    phone: '+55 11 99999-9999',
    value: 50000,
    notes: 'High value prospect',
    tags: ['premium', 'enterprise'],
  });

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render lead information correctly', () => {
    render(
      <LeadCard
        lead={mockLead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('CEO')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('+55 11 99999-9999')).toBeInTheDocument();
  });

  it('should display formatted value when provided', () => {
    render(
      <LeadCard
        lead={mockLead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/R\$ 50\.000,00/)).toBeInTheDocument();
  });

  it('should display tags count when tags exist', () => {
    render(
      <LeadCard
        lead={mockLead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('should display notes when provided', () => {
    render(
      <LeadCard
        lead={mockLead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('High value prospect')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <LeadCard
        lead={mockLead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByTitle('Editar lead');
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockLead);
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <LeadCard
        lead={mockLead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTitle('Deletar lead');
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockLead);
  });

  it('should not display optional fields when not provided', () => {
    const minimalLead = createMockLead('org-123', {
      name: 'Minimal Lead',
      email: 'minimal@example.com',
      company: null,
      position: null,
      phone: null,
      value: null,
      notes: null,
      tags: [],
    });

    render(
      <LeadCard
        lead={minimalLead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Minimal Lead')).toBeInTheDocument();
    expect(screen.getByText('minimal@example.com')).toBeInTheDocument();

    // Não deve exibir campos opcionais
    expect(screen.queryByText('R$')).not.toBeInTheDocument();
    expect(screen.queryByText(/\+55/)).not.toBeInTheDocument();
  });

  it('should display source label correctly', () => {
    render(
      <LeadCard
        lead={mockLead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Website')).toBeInTheDocument();
  });
});
