import { createSlice } from "@reduxjs/toolkit";

import {
  fetchCertificates,
  previewCertificate,
  sendCertificate,
} from "./adminCertificateThunks";

const initialState = {
  /* =====================================================
     CERTIFICATES LIST
     ===================================================== */

  certificates: [],

  /* =====================================================
     PREVIEW
     ===================================================== */

  preview: null,

  /* =====================================================
     LOADING STATES
     ===================================================== */

  loading: false,

  previewLoading: false,

  sending: false,

  /* =====================================================
     ERROR / SUCCESS
     ===================================================== */

  error: null,

  success: false,

  message: "",
};

const adminCertificateSlice = createSlice({
  name: "adminCertificate",

  initialState,

  reducers: {
    clearCertificateError: (state) => {
      state.error = null;
    },

    clearCertificateSuccess: (state) => {
      state.success = false;
      state.message = "";
    },

    clearPreview: (state) => {
      state.preview = null;
    },
  },

  extraReducers: (builder) => {
    /* =====================================================
       LIST CERTIFICATES
       ===================================================== */

    builder

      .addCase(fetchCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.loading = false;

        state.certificates = action.payload.certificates || [];
      })

      .addCase(fetchCertificates.rejected, (state, action) => {
        state.loading = false;

        state.certificates = [];

        state.error = action.payload || "Failed to fetch certificates";
      });

    /* =====================================================
       PREVIEW CERTIFICATE
       ===================================================== */

    builder

      .addCase(previewCertificate.pending, (state) => {
        state.previewLoading = true;
        state.error = null;
      })

      .addCase(previewCertificate.fulfilled, (state, action) => {
        state.previewLoading = false;

        state.preview = action.payload.preview || null;
      })

      .addCase(previewCertificate.rejected, (state, action) => {
        state.previewLoading = false;

        state.preview = null;

        state.error = action.payload || "Failed to preview certificate";
      });

    /* =====================================================
       SEND CERTIFICATE
       ===================================================== */

    builder

      .addCase(sendCertificate.pending, (state) => {
        state.sending = true;
        state.success = false;
        state.error = null;
      })

      .addCase(sendCertificate.fulfilled, (state, action) => {
        state.sending = false;

        state.success = true;

        state.message =
          action.payload.message || "Certificate sent successfully";
      })

      .addCase(sendCertificate.rejected, (state, action) => {
        state.sending = false;

        state.success = false;

        state.error = action.payload || "Failed to send certificate";
      });
  },
});

export const { clearCertificateError, clearCertificateSuccess, clearPreview } =
  adminCertificateSlice.actions;

export default adminCertificateSlice.reducer;
