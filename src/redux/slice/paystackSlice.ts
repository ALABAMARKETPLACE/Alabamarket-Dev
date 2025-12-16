import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice } from '../createSlices';
import { 
  PaystackState, 
  PaystackInitializeRequest, 
  PaystackVerificationData,
  PaystackError 
} from '@/types/paystack.types';
import { GET, POST } from '@/util/apicall';
import API from '@/config/API';

// Initial state
const initialState: PaystackState = {
  // Payment initialization
  isInitializing: false,
  initializationError: null,
  paymentData: null,
  
  // Payment verification
  isVerifying: false,
  verificationError: null,
  verificationData: null,
  
  // Payment status
  paymentStatus: 'idle',
  paymentReference: null,
  
  // Public key
  publicKey: null,
  
  // Transaction details
  currentTransaction: null,
  
  // Refund status
  isRefunding: false,
  refundError: null,
  refundData: null,
};

// Create the slice with async thunks
export const paystackSlice = createAppSlice({
  name: 'paystack',
  initialState,
  reducers: (create) => ({
    // Initialize payment
    initializePayment: create.asyncThunk(
      async (paymentData: PaystackInitializeRequest, { rejectWithValue }) => {
        try {
          const response = await POST(API.PAYSTACK_INITIALIZE, paymentData);
          return response;
        } catch (error: any) {
          return rejectWithValue({
            message: error.message || 'Payment initialization failed',
            code: error.code || 'INITIALIZATION_ERROR',
            status: error.status || 500,
            data: error.response?.data
          } as PaystackError);
        }
      },
      {
        pending: (state) => {
          state.isInitializing = true;
          state.initializationError = null;
          state.paymentStatus = 'pending';
        },
        fulfilled: (state, action) => {
          state.isInitializing = false;
          state.initializationError = null;
          state.paymentData = action.meta.arg;
          state.paymentReference = action.payload.data?.data?.reference || null;
          state.paymentStatus = 'pending';
        },
        rejected: (state, action) => {
          state.isInitializing = false;
          state.initializationError = (action.payload as PaystackError)?.message || 'Payment initialization failed';
          state.paymentStatus = 'failed';
        },
      }
    ),

    // Verify payment
    verifyPayment: create.asyncThunk(
      async (reference: string, { rejectWithValue }) => {
        try {
          const response = await POST(API.PAYSTACK_VERIFY, { reference });
          return response;
        } catch (error: any) {
          return rejectWithValue({
            message: error.message || 'Payment verification failed',
            code: error.code || 'VERIFICATION_ERROR',
            status: error.status || 500,
            data: error.response?.data
          } as PaystackError);
        }
      },
      {
        pending: (state) => {
          state.isVerifying = true;
          state.verificationError = null;
        },
        fulfilled: (state, action) => {
          state.isVerifying = false;
          state.verificationError = null;
          state.verificationData = action.payload.data?.data || null;
          state.currentTransaction = action.payload.data?.data || null;
          
          // Update payment status based on verification result
          const status = action.payload.data?.data?.status;
          if (status === 'success') {
            state.paymentStatus = 'success';
          } else if (status === 'failed') {
            state.paymentStatus = 'failed';
          } else if (status === 'abandoned') {
            state.paymentStatus = 'cancelled';
          } else {
            state.paymentStatus = 'pending';
          }
        },
        rejected: (state, action) => {
          state.isVerifying = false;
          state.verificationError = (action.payload as PaystackError)?.message || 'Payment verification failed';
          state.paymentStatus = 'failed';
        },
      }
    ),

    // Get public key
    getPublicKey: create.asyncThunk(
      async (_, { rejectWithValue }) => {
        try {
          const response = await GET(API.PAYSTACK_PUBLIC_KEY);
          return response;
        } catch (error: any) {
          return rejectWithValue({
            message: error.message || 'Failed to get public key',
            code: error.code || 'PUBLIC_KEY_ERROR',
            status: error.status || 500
          } as PaystackError);
        }
      },
      {
        fulfilled: (state, action) => {
          state.publicKey = action.payload.publicKey || null;
        },
      }
    ),

    // Process refund
    processRefund: create.asyncThunk(
      async (refundData: { transaction: string; amount?: number; reason?: string }, { rejectWithValue }) => {
        try {
          const response = await POST(API.PAYSTACK_REFUND, refundData);
          return response;
        } catch (error: any) {
          return rejectWithValue({
            message: error.message || 'Refund processing failed',
            code: error.code || 'REFUND_ERROR',
            status: error.status || 500,
            data: error.response?.data
          } as PaystackError);
        }
      },
      {
        pending: (state) => {
          state.isRefunding = true;
          state.refundError = null;
        },
        fulfilled: (state, action) => {
          state.isRefunding = false;
          state.refundError = null;
          state.refundData = action.payload.data || null;
        },
        rejected: (state, action) => {
          state.isRefunding = false;
          state.refundError = (action.payload as PaystackError)?.message || 'Refund processing failed';
        },
      }
    ),

    // Synchronous actions
    setPaymentReference: create.reducer((state, action: PayloadAction<string | null>) => {
      state.paymentReference = action.payload;
    }),

    setPaymentStatus: create.reducer((state, action: PayloadAction<PaystackState['paymentStatus']>) => {
      state.paymentStatus = action.payload;
    }),

    clearPaymentData: create.reducer((state) => {
      state.paymentData = null;
      state.verificationData = null;
      state.currentTransaction = null;
      state.paymentReference = null;
      state.paymentStatus = 'idle';
      state.initializationError = null;
      state.verificationError = null;
      state.refundError = null;
      state.refundData = null;
    }),

    clearErrors: create.reducer((state) => {
      state.initializationError = null;
      state.verificationError = null;
      state.refundError = null;
    }),

    setVerificationData: create.reducer((state, action: PayloadAction<PaystackVerificationData | null>) => {
      state.verificationData = action.payload;
      state.currentTransaction = action.payload;
    }),
  }),
});

// Export actions
export const {
  initializePayment,
  verifyPayment,
  getPublicKey,
  processRefund,
  setPaymentReference,
  setPaymentStatus,
  clearPaymentData,
  clearErrors,
  setVerificationData,
} = paystackSlice.actions;

// Selectors
export const selectPaystackState = (state: { paystack: PaystackState }) => state.paystack;
export const selectIsLoading = (state: { paystack: PaystackState }) => 
  state.paystack.isInitializing || state.paystack.isVerifying || state.paystack.isRefunding;
export const selectPaymentStatus = (state: { paystack: PaystackState }) => state.paystack.paymentStatus;
export const selectPaymentReference = (state: { paystack: PaystackState }) => state.paystack.paymentReference;
export const selectVerificationData = (state: { paystack: PaystackState }) => state.paystack.verificationData;
export const selectPublicKey = (state: { paystack: PaystackState }) => state.paystack.publicKey;
export const selectPaymentErrors = (state: { paystack: PaystackState }) => ({
  initialization: state.paystack.initializationError,
  verification: state.paystack.verificationError,
  refund: state.paystack.refundError,
});

// Export reducer
export default paystackSlice.reducer;