import { createSlice } from "@reduxjs/toolkit";

import {
  fetchMyCertificates,
  downloadCertificatePdf,
} from "./studentCertificateThunks";

const initialState = {
  /* =====================================================
     DATA
     ===================================================== */

  certificates: {
    courseCompletion: [],
    companyProject: [],
  },

  downloadingId: null,

  /* =====================================================
     LOADING / ERROR
     ===================================================== */

  loading: false,

  error: null,
};

const studentCertificateSlice = createSlice({
  name: "studentCertificate",

  initialState,

  reducers: {
    clearStudentCertificateError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    /* =====================================================
       FETCH MY CERTIFICATES
       ===================================================== */

    builder

      .addCase(fetchMyCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMyCertificates.fulfilled, (state, action) => {
        state.loading = false;

        state.certificates =
          action.payload.certificates || initialState.certificates;
      })

      .addCase(fetchMyCertificates.rejected, (state, action) => {
        state.loading = false;

        state.certificates = initialState.certificates;

        state.error = action.payload || "Failed to fetch certificates";
      });

    /* =====================================================
       DOWNLOAD CERTIFICATE PDF
       ===================================================== */

    builder

      .addCase(downloadCertificatePdf.pending, (state, action) => {
        state.downloadingId = action.meta.arg || null;
        state.error = null;
      })

      .addCase(downloadCertificatePdf.fulfilled, (state) => {
        state.downloadingId = null;
      })

      .addCase(downloadCertificatePdf.rejected, (state, action) => {
        state.downloadingId = null;

        state.error = action.payload || "Failed to download certificate";
      });
  },
});

export const { clearStudentCertificateError } = studentCertificateSlice.actions;

export default studentCertificateSlice.reducer;
