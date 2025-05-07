"use client";

import { scanReceipt } from '@/actions/transaction';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { Camera, Loader2 } from 'lucide-react';
import React, { useEffect, useRef } from 'react'
import { toast } from 'sonner';

const ReciptScanner = ({ onScanComplete }) => {
  const fileInputRef = useRef();
  
  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData
  } = useFetch(scanReceipt);
  
  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      // Notify parent that scan was canceled due to file size
      onScanComplete(null);
      return;
    }
    
    await scanReceiptFn(file);
  };
  
  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      // Delay executing the callback to break potential render cycles
      setTimeout(() => {
        onScanComplete(scannedData);
      }, 0);
      // Don't show duplicate toast as it's already shown in the parent component
    } else if (!scanReceiptLoading && !scannedData && fileInputRef.current) {
      // Reset file input after scanning regardless of result
      fileInputRef.current.value = '';
    }
  }, [scanReceiptLoading, scannedData, onScanComplete]);
  
  // Prevent form submission when clicking the scan button
  const handleScanButtonClick = (e) => {
    e.preventDefault(); // Prevent the button from submitting the form
    fileInputRef.current?.click();
  };

  // Handle file input change, including when user cancels
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleReceiptScan(file);
    } else {
      // User canceled the file selection dialog
      onScanComplete(null);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
      />
      <Button 
        type="button" // Explicitly set type to button to prevent form submission
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500
        animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={handleScanButtonClick}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className='mr-2' />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  )
}

export default ReciptScanner;