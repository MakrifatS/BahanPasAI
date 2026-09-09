import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const http = axios.create({ baseURL: API, timeout: 60000 });

export const parseVoice = (transcript) =>
  http.post("/ai/parse-voice", { transcript }).then((r) => r.data);

export const parseReceipt = (payload) =>
  http.post("/ai/parse-receipt", payload).then((r) => r.data);

export const marginAdvice = (hike_percent, recipes) =>
  http.post("/ai/margin-advice", { hike_percent, recipes }).then((r) => r.data);

export const reorderAnalysis = (inventory, sales) =>
  http.post("/ai/reorder", { inventory, sales }).then((r) => r.data);
