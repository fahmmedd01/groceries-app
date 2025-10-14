import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextInput } from '@/components/TextInput';

describe('TextInput Component', () => {
  it('should render textarea', () => {
    const mockOnTextChange = jest.fn();
    render(<TextInput onTextChange={mockOnTextChange} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('should call onTextChange when text is entered', () => {
    const mockOnTextChange = jest.fn();
    render(<TextInput onTextChange={mockOnTextChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'eggs, milk, bread' } });
    
    expect(mockOnTextChange).toHaveBeenCalledWith('eggs, milk, bread');
  });

  it('should display character counter', () => {
    const mockOnTextChange = jest.fn();
    render(<TextInput onTextChange={mockOnTextChange} maxLength={1000} />);
    
    const counter = screen.getByText(/0 \/ 1000 characters/);
    expect(counter).toBeInTheDocument();
  });

  it('should update character count', () => {
    const mockOnTextChange = jest.fn();
    render(<TextInput onTextChange={mockOnTextChange} maxLength={1000} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'test' } });
    
    const counter = screen.getByText(/4 \/ 1000 characters/);
    expect(counter).toBeInTheDocument();
  });

  it('should respect maxLength', () => {
    const mockOnTextChange = jest.fn();
    render(<TextInput onTextChange={mockOnTextChange} maxLength={10} />);
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(10);
  });

  it('should use custom placeholder', () => {
    const mockOnTextChange = jest.fn();
    const placeholder = 'Enter items here';
    render(<TextInput onTextChange={mockOnTextChange} placeholder={placeholder} />);
    
    const textarea = screen.getByPlaceholderText(placeholder);
    expect(textarea).toBeInTheDocument();
  });
});

