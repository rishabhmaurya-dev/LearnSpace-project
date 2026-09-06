import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getMyCertificatesApi,
  downloadCertificatePdfApi,
} from "./studentCertificateApi";

/* =========================================================
   1. FETCH MY CERTIFICATES
   ========================================================= */

export const fetchMyCertificates = createAsyncThunk(
  "studentCertificate/fetchMyCertificates",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyCertificatesApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch certificates",
      );
    }
  },
);

/* =========================================================
   2. DOWNLOAD CERTIFICATE PDF
   ========================================================= */

export const downloadCertificatePdf = createAsyncThunk(
  "studentCertificate/downloadCertificatePdf",
  async (certificateId, { rejectWithValue }) => {
    try {
      return await downloadCertificatePdfApi(certificateId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to download certificate",
      );
    }
  },
);
