'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, X } from 'lucide-react';
import { type Variable } from '@/lib/supabase';

interface ProductVariablesProps {
  variables: Variable[];
  addVariable: () => void;
  removeVariable: (id: string) => void;
  newVariableName: string;
  setNewVariableName: (value: string) => void;
  newVariableValue: string;
  setNewVariableValue: (value: string) => void;
}

export function ProductVariables({
  variables,
  addVariable,
  removeVariable,
  newVariableName,
  setNewVariableName,
  newVariableValue,
  setNewVariableValue
}: ProductVariablesProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="variable-name" className="text-base">שם המשתנה</Label>
          <Input
            id="variable-name"
            value={newVariableName}
            onChange={(e) => setNewVariableName(e.target.value)}
            placeholder="לדוגמה: צבע, גודל, משקל"
            className="text-base"
          />
        </div>
        
        <div className="flex-1 space-y-2">
          <Label htmlFor="variable-value" className="text-base">ערך</Label>
          <Input
            id="variable-value"
            value={newVariableValue}
            onChange={(e) => setNewVariableValue(e.target.value)}
            placeholder="לדוגמה: אדום, XL, 500 גרם"
            className="text-base"
          />
        </div>
        
        <div className="flex items-end">
          <Button
            type="button"
            onClick={addVariable}
            disabled={!newVariableName.trim() || !newVariableValue.trim()}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 ml-2" />
            הוסף
          </Button>
        </div>
      </div>
      
      {variables.length > 0 && (
        <VariablesTable variables={variables} removeVariable={removeVariable} />
      )}
    </div>
  );
}

// Responsive Table Component
interface VariablesTableProps {
  variables: Variable[];
  removeVariable: (id: string) => void;
}

function VariablesTable({ variables, removeVariable }: VariablesTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block">
        <div className="border rounded-md mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם המשתנה</TableHead>
                <TableHead>ערך</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variables.map((variable) => (
                <TableRow key={variable.id}>
                  <TableCell>{variable.name}</TableCell>
                  <TableCell>{variable.value}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariable(variable.id)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Mobile Table */}
      <div className="sm:hidden mt-4 space-y-2">
        {variables.map((variable) => (
          <div
            key={variable.id}
            className="flex items-center justify-between border rounded-md p-3 bg-muted"
          >
            <div>
              <div className="text-xs text-muted-foreground">שם המשתנה</div>
              <div className="font-medium">{variable.name}</div>
              <div className="text-xs text-muted-foreground mt-1">ערך</div>
              <div>{variable.value}</div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeVariable(variable.id)}
              className="ml-2"
              aria-label="מחק משתנה"
            >
              <X className="h-5 w-5 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
} 