'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TextInputProps {
  onTextChange: (text: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

export function TextInput({
  onTextChange,
  placeholder = 'Enter your grocery items here...\nExample: 2 cartons of eggs, 1 gallon of milk, Tide Pods',
  className,
  maxLength = 1000,
}: TextInputProps) {
  const [text, setText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onTextChange(newText);
  };

  return (
    <div className={cn('w-full', className)}>
      <Textarea
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="min-h-[180px] text-base"
      />
      
      {/* Character Counter */}
      <div className="mt-2 flex justify-end">
        <span className="text-xs text-muted-foreground">
          {text.length} / {maxLength} characters
        </span>
      </div>
    </div>
  );
}

