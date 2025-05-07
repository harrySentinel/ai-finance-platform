"use client";

import { createTransaction, updateTransaction } from '@/actions/transaction';
import { transactionSchema } from '@/app/lib/schema';
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ReciptScanner from './recipt-scanner';

const AddTransactionForm = ({ accounts, categories, editMode = false, initialData = null}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit")

  const [scannerActive, setScannerActive] = useState(false);
  
  // Memoize default account id to prevent unnecessary re-renders
  const defaultAccountId = React.useMemo(() => 
    accounts.find((ac) => ac.isDefault)?.id, 
    [accounts]
  );
  
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    getValues,
    reset,
    trigger
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
      ? { 
          type: initialData.type,
          amount: initialData.amount.toString(),
          description: initialData.description,
          accountId: initialData.accountId,
          category: initialData.category,
          date: new Date(initialData.date),
          isRecurring: initialData.isRecurring,
          ...(initialData.recurringInterval && {
            recurringInterval: initialData.recurringInterval,
          }),
      }
    :{
      type: "EXPENSE",
      amount: "",
      description: "",
      accountId: defaultAccountId,
      date: new Date(),
      isRecurring: false,
    },
    mode: "onSubmit", // Only validate on submit
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch('date');

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
            ? "Transaction updated successfully"
            : "Transaction created successfully"
          );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, reset, router, editMode]);
  
  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  const handleScanComplete = (scannedData) => {
    // Always turn off scanner mode whether data was received or not
    setScannerActive(false);
    
    if (scannedData) {
      // Set form values without triggering validation
      setValue("amount", scannedData.amount.toString(), { shouldValidate: false });
      setValue("date", new Date(scannedData.date), { shouldValidate: false });
      
      if (scannedData.description) {
        setValue("description", scannedData.description, { shouldValidate: false });
      }
      
      if (scannedData.category) {
        const aiCategory = scannedData.category.toLowerCase();
        console.log("AI detected category:", aiCategory);
        
        // Create a stable reference to filtered categories
        const currentCategories = [...filteredCategories];
        console.log("Available categories:", currentCategories.map(c => c.name));
        
        // Find the matching category
        const foundCategory = currentCategories.find(
          category => category.name.toLowerCase() === aiCategory
        );
        
        if (foundCategory) {
          console.log("Found matching category:", foundCategory.name, "with ID:", foundCategory.id);
          // Set the category immediately
          setValue("category", foundCategory.id, { shouldValidate: false });
          
          // Force a re-render
          setTimeout(() => {
            const currentValue = getValues("category");
            console.log("Category value after setting:", currentValue);
            
            // If value didn't stick, try one more time
            if (currentValue !== foundCategory.id) {
              setValue("category", foundCategory.id, { shouldValidate: false });
            }
          }, 100);
        } else {
          console.log("No direct match found. Trying similar categories...");
          
          // Try to find a similar category
          const similarCategory = currentCategories.find(
            category => category.name.toLowerCase().includes(aiCategory) || 
                      aiCategory.includes(category.name.toLowerCase())
          );
          
          if (similarCategory) {
            console.log("Found similar category:", similarCategory.name, "with ID:", similarCategory.id);
            // Set the category immediately
            setValue("category", similarCategory.id, { shouldValidate: false });
            
            // Force a re-render
            setTimeout(() => {
              const currentValue = getValues("category");
              console.log("Category value after setting:", currentValue);
              
              // If value didn't stick, try one more time
              if (currentValue !== similarCategory.id) {
                setValue("category", similarCategory.id, { shouldValidate: false });
              }
            }, 100);
          } else {
            console.log("No matching category found in filtered categories:", 
                      currentCategories.map(c => c.name));
          }
        }
      }
      
      // Log all form values after setting
      setTimeout(() => {
        console.log("Form values after scan:", getValues());
      }, 200);
    }
  };

  // Use effect to log when the category value changes
  useEffect(() => {
    const categoryValue = watch("category");
    if (categoryValue) {
      console.log("Category changed to:", categoryValue);
      const matchingCategory = categories.find(c => c.id === categoryValue);
      if (matchingCategory) {
        console.log("Selected category name:", matchingCategory.name);
      }
    }
  }, [watch("category"), categories]);

  return (
    <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
      {/* AI Receipt Scanner */}
      {!editMode && <div onClick={() => setScannerActive(true)}>
        <ReciptScanner onScanComplete={handleScanComplete} />
      </div>}

      {/* Type */}
      <div className='space-y-2 w-full'>
        <label className='text-sm font-medium'>Type</label>
        <Select
          onValueChange={(value) => setValue("type", value)}
          defaultValue={type}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="w-full">
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>

        {errors.type && !scannerActive && (
          <p className='text-sm text-red-500'>{errors.type.message}</p>
        )}
      </div>

      {/* Amount and Account */}
      <div className='grid gap-6 md:grid-cols-2'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Amount</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
          />

          {errors.amount && !scannerActive && (
            <p className='text-sm text-red-500'>{errors.amount.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Account</label>
          <Select
            onValueChange={(value) => setValue("accountId", value)}
            defaultValue={getValues("accountId")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (${parseFloat(account.balance).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button variant="ghost" className="w-full select-none items-center text-sm outline-none">Create Account</Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>

          {errors.accountId && !scannerActive && (
            <p className='text-sm text-red-500'>{errors.accountId.message}</p>
          )}
        </div>
      </div>
 
      {/* Category */}
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Category</label>
        <Select
          key={watch("type")} // Re-render when type changes
          onValueChange={(value) => {
            console.log("Setting category to:", value);
            setValue("category", value, { shouldValidate: false });
          }}
          value={watch("category")} // Control the component with current value
          defaultValue={getValues("category")} // Fallback initial value
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent
            side="bottom"
            sideOffset={8}
            avoidCollisions={false}
            position="popper"
          >
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.category && !scannerActive && (
          <p className='text-sm text-red-500'>{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button" // Prevent form submission
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date, { shouldValidate: false })}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && !scannerActive && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input placeholder="Enter description" {...register("description")} />
        {errors.description && !scannerActive && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring Toggle */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <label className="text-base font-medium">Recurring Transaction</label>
          <div className="text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </div>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked, { shouldValidate: false })}
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && !scannerActive && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={transactionLoading}
        >
          {transactionLoading ? (
            <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
             "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddTransactionForm;