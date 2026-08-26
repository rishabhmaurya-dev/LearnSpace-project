import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getCertificatesApi,
  previewCertificateApi,
  sendCertificateApi,
} from "./adminCertificateApi";

/* =========================================================
   1. LIST CERTIFICATES
   ========================================================= */

export const fetchCertificates = createAsyncThunk(
  "adminCertificate/fetchCertificates",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getCertificatesApi(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch certificates",
      );
    }
  },
);

/* =========================================================
   2. PREVIEW CERTIFICATE
   ========================================================= */

export const previewCertificate = createAsyncThunk(
  "adminCertificate/previewCertificate",
  async (capstoneSubmissionId, { rejectWithValue }) => {
    try {
      return await previewCertificateApi(capstoneSubmissionId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to preview certificate",
      );
    }
  },
);

/* =========================================================
   3. SEND CERTIFICATE
   ========================================================= */

export const sendCertificate = createAsyncThunk(
  "adminCertificate/sendCertificate",
  async (capstoneSubmissionId, { rejectWithValue }) => {
    try {
      return await sendCertificateApi(capstoneSubmissionId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send certificate",
      );
    }
  },
);
