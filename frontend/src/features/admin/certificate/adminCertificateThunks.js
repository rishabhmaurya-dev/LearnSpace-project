import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getCertificatesApi,
  previewCertificateApi,
  sendCertificateApi,
  deleteCertificateApi,
} from "./adminCertificateApi";

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

export const previewCertificate = createAsyncThunk(
  "adminCertificate/previewCertificate",
  async (capstoneSubmissionId, { rejectWithValue }) => {
    try {
      const blob = await previewCertificateApi(capstoneSubmissionId);

      const url = URL.createObjectURL(blob);

      return { url };
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();

          const payload = JSON.parse(text);

          return rejectWithValue(
            payload?.message || "Failed to preview certificate",
          );
        } catch (_) {
          return rejectWithValue("Failed to preview certificate");
        }
      }

      return rejectWithValue(
        error.response?.data?.message || "Failed to preview certificate",
      );
    }
  },
);

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

export const deleteCertificate = createAsyncThunk(
  "adminCertificate/deleteCertificate",
  async (certificateId, { rejectWithValue }) => {
    try {
      return await deleteCertificateApi(certificateId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete certificate",
      );
    }
  },
);