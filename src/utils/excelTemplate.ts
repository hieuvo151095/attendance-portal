import { ImportEmployeeRow } from '../types/employee';

/**
 * File mẫu chuẩn Excel (.xlsx) danh sách nhân sự Finviet
 * Chuẩn OpenXML ZIP chứa [Content_Types].xml, workbook.xml, styles.xml, sheet1.xml
 * Cột 'Phòng ban' sử dụng Mã phòng ban (VP-UBND, DC-XD, TP-HT, ...)
 */
export const SAMPLE_EMPLOYEE_XLSX_BASE64 =
  'UEsDBBQAAAAAAAAAAAD5bOZCuAIAALgCAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbDw/eG1sIHZlcnNpb249IjEuMCIgZW5jb2Rpbmc9IlVURi04IiBzdGFuZGFsb25lPSJ5ZXMiPz4KPFR5cGVzIHhtbG5zPSJodHRwOi8vc2NoZW1hcy5vcGVueG1sZm9ybWF0cy5vcmcvcGFja2FnZS8yMDA2L2NvbnRlbnQtdHlwZXMiPgogIDxEZWZhdWx0IEV4dGVuc2lvbj0icmVscyIgQ29udGVudFR5cGU9ImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1wYWNrYWdlLnJlbGF0aW9uc2hpcHMreG1sIi8+CiAgPERlZmF1bHQgRXh0ZW5zaW9uPSJ4bWwiIENvbnRlbnRUeXBlPSJhcHBsaWNhdGlvbi94bWwiLz4KICA8T3ZlcnJpZGUgUGFydE5hbWU9Ii94bC93b3JrYm9vay54bWwiIENvbnRlbnRUeXBlPSJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldC5tYWluK3htbCIvPgogIDxPdmVycmlkZSBQYXJ0TmFtZT0iL3hsL3dvcmtzaGVldHMvc2hlZXQxLnhtbCIgQ29udGVudFR5cGU9ImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLndvcmtzaGVldCt4bWwiLz4KICA8T3ZlcnJpZGUgUGFydE5hbWU9Ii94bC9zdHlsZXMueG1sIiBDb250ZW50VHlwZT0iYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc3R5bGVzK3htbCIvPgo8L1R5cGVzPlBLAwQUAAAAAAAAAAAAXYf0LiwBAAAsAQAACwAAAF9yZWxzLy5yZWxzPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8UmVsYXRpb25zaGlwcyB4bWxucz0iaHR0cDovL3NjaGVtYXMub3BlbnhtbGZvcm1hdHMub3JnL3BhY2thZ2UvMjAwNi9yZWxhdGlvbnNoaXBzIj4KICA8UmVsYXRpb25zaGlwIElkPSJySWQxIiBUeXBlPSJodHRwOi8vc2NoZW1hcy5vcGVueG1sZm9ybWF0cy5vcmcvb2ZmaWNlRG9jdW1lbnQvMjAwNi9yZWxhdGlvbnNoaXBzL29mZmljZURvY3VtZW50IiBUYXJnZXQ9InhsL3dvcmtib29rLnhtbCIvPgo8L1JlbGF0aW9uc2hpcHM+UEsDBBQAAAAAAAAAAAA50x48rwEAAK8BAAAaAAAAeGwvX3JlbHMvd29ya2Jvb2sueG1sLnJlbHM8P3htbCB2ZXJzaW9uPSIxLjAiIGVuY29kaW5nPSJVVEYtOCIgc3RhbmRhbG9uZT0ieWVzIj8+CjxSZWxhdGlvbnNoaXBzIHhtbG5zPSJodHRwOi8vc2NoZW1hcy5vcGVueG1sZm9ybWF0cy5vcmcvcGFja2FnZS8yMDA2L3JlbGF0aW9uc2hpcHMiPgogIDxSZWxhdGlvbnNoaXAgSWQ9InJJZDEiIFR5cGU9Imh0dHA6Ly9zY2hlbWFzLm9wZW54bWxmb3JtYXRzLm9yZy9vZmZpY2VEb2N1bWVudC8yMDA2L3JlbGF0aW9uc2hpcHMvd29ya3NoZWV0IiBUYXJnZXQ9IndvcmtzaGVldHMvc2hlZXQxLnhtbCIvPgogIDxSZWxhdGlvbnNoaXAgSWQ9InJJZDIiIFR5cGU9Imh0dHA6Ly9zY2hlbWFzLm9wZW54bWxmb3JtYXRzLm9yZy9vZmZpY2VEb2N1bWVudC8yMDA2L3JlbGF0aW9uc2hpcHMvc3R5bGVzIiBUYXJnZXQ9InN0eWxlcy54bWwiLz4KPC9SZWxhdGlvbnNoaXBzPlBLAwQUAAAAAAAAAAAAws/nEzcBAAA3AQAADwAAAHhsL3dvcmtib29rLnhtbDw/eG1sIHZlcnNpb249IjEuMCIgZW5jb2Rpbmc9IlVURi04IiBzdGFuZGFsb25lPSJ5ZXMiPz4KPHdvcmtib29rIHhtbG5zPSJodHRwOi8vc2NoZW1hcy5vcGVueG1sZm9ybWF0cy5vcmcvc3ByZWFkc2hlZXRtbC8yMDA2L21haW4iIHhtbG5zOnI9Imh0dHA6Ly9zY2hlbWFzLm9wZW54bWxmb3JtYXRzLm9yZy9vZmZpY2VEb2N1bWVudC8yMDA2L3JlbGF0aW9uc2hpcHMiPgogIDxzaGVldHM+CiAgICA8c2hlZXQgbmFtZT0iRGFuaCBzw6FjaCBuaMOibiBz4buxIiBzaGVldElkPSIxIiByOmlkPSJySWQxIi8+CiAgPC9zaGVldHM+Cjwvd29ya2Jvb2s+UEsDBBQAAAAAAAAAAADItR0PVR0AAFUdAAANAAAAeGwvc3R5bGVzLnhtbDw/eG1sIHZlcnNpb249IjEuMCIgZW5jb2Rpbmc9IlVURi04IiBzdGFuZGFsb25lPSJ5ZXMiPz4KPHN0eWxlU2hlZXQgeG1sbnM9Imh0dHA6Ly9zY2hlbWFzLm9wZW54bWxmb3JtYXRzLm9yZy9zcHJlYWRzaGVldG1sLzIwMDYvbWFpbiI+CiAgPGZvbnRzIGNvdW50PSIxMSI+CiAgICA8IS0tIDA6IENhbGlicmkgMTBwdCBub3JtYWwgLS0+CiAgICA8Zm9udD48c3ogdmFsPSIxMCIvPjxjb2xvciByZ2I9IkZGMUUyOTNCIi8+PG5hbWUgdmFsPSJDYWxpYnJpIi8+PC9mb250PgogICAgPCEtLSAxOiBDYWxpYnJpIDEwcHQgYm9sZCAtLT4KICAgIDxmb250PjxiLz48c3ogdmFsPSIxMCIvPjxjb2xvciByZ2I9IkZGMUUyOTNCIi8+PG5hbWUgdmFsPSJDYWxpYnJpIi8+PC9mb250PgogICAgPCEtLSAyOiBDYWxpYnJpIDExcHQgYm9sZCB3aGl0ZSAtLT4KICAgIDxmb250PjxiLz48c3ogdmFsPSIxMSIvPjxjb2xvciByZ2I9IkZGRkZGRkZGIi8+PG5hbWUgdmFsPSJDYWxpYnJpIi8+PC9mb250PgogICAgPCEtLSAzOiBDYWxpYnJpIDE0cHQgYm9sZCBwcmltYXJ5IGJsdWUgLS0+CiAgICA8Zm9udD48Yi8+PHN6IHZhbD0iMTQiLz48Y29sb3IgcmdiPSJGRjAwNEM4QyIvPjxuYW1lIHZhbD0iQ2FsaWJyaSIvPjwvZm9udD4KICAgIDwhLS0gNDogQ2FsaWJyaSAxMXB0IGJvbGQgcHJpbWFyeSBibHVlIC0tPgogICAgPGZvbnQ+PGIvPjxzeiB2YWw9IjExIi8+PGNvbG9yIHJnYj0iRkYwMDRDOEMiLz48bmFtZSB2YWw9IkNhbGlicmkiLz48L2ZvbnQ+CiAgICA8IS0tIDU6IENhbGlicmkgOS41cHQgaXRhbGljIHN1YnRsZSBzbGF0ZSAtLT4KICAgIDxmb250PjxpLz48c3ogdmFsPSI5LjUiLz48Y29sb3IgcmdiPSJGRjY0NzQ4QiIvPjxuYW1lIHZhbD0iQ2FsaWJyaSIvPjwvZm9udD4KICAgIDwhLS0gNjogQ2FsaWJyaSAxMHB0IGJvbGQgc3VjY2VzcyBncmVlbiAtLT4KICAgIDxmb250PjxiLz48c3ogdmFsPSIxMCIvPjxjb2xvciByZ2I9IkZGMTU4MDNEIi8+PG5hbWUgdmFsPSJDYWxpYnJpIi8+PC9mb250PgogICAgPCEtLSA3OiBDYWxpYnJpIDEwcHQgYm9sZCB3YXJuaW5nIHllbGxvdy9vcmFuZ2UgLS0+CiAgICA8Zm9udD48Yi8+PHN6IHZhbD0iMTAiLz48Y29sb3IgcmdiPSJGRkExNjIwNyIvPjxuYW1lIHZhbD0iQ2FsaWJyaSIvPjwvZm9udD4KICAgIDwhLS0gODogQ2FsaWJyaSAxMHB0IGJvbGQgZGFuZ2VyIHJlZCAtLT4KICAgIDxmb250PjxiLz48c3ogdmFsPSIxMCIvPjxjb2xvciByZ2I9IkZGQjkxQzFDIi8+PG5hbWUgdmFsPSJDYWxpYnJpIi8+PC9mb250PgogICAgPCEtLSA5OiBDYWxpYnJpIDEwcHQgYm9sZCBpbmZvIGJsdWUgLS0+CiAgICA8Zm9udD48Yi8+PHN6IHZhbD0iMTAiLz48Y29sb3IgcmdiPSJGRjFENEVEOCIvPjxuYW1lIHZhbD0iQ2FsaWJyaSIvPjwvZm9udD4KICAgIDwhLS0gMTA6IENhbGlicmkgMTBwdCBib2xkIHNsYXRlIDcwMCAtLT4KICAgIDxmb250PjxiLz48c3ogdmFsPSIxMCIvPjxjb2xvciByZ2I9IkZGMzM0MTU1Ii8+PG5hbWUgdmFsPSJDYWxpYnJpIi8+PC9mb250PgogIDwvZm9udHM+CiAgPGZpbGxzIGNvdW50PSI5Ij4KICAgIDwhLS0gMDogTm9uZSAtLT4KICAgIDxmaWxsPjxwYXR0ZXJuRmlsbCBwYXR0ZXJuVHlwZT0ibm9uZSIvPjwvZmlsbD4KICAgIDwhLS0gMTogR3JheTEyNSAoecOqdSBj4bqndSBjaHXhuqluIE9wZW5YTUwpIC0tPgogICAgPGZpbGw+PHBhdHRlcm5GaWxsIHBhdHRlcm5UeXBlPSJncmF5MTI1Ii8+PC9maWxsPgogICAgPCEtLSAyOiBQcmltYXJ5IEJsdWUgIzAwNzBDRSAtLT4KICAgIDxmaWxsPjxwYXR0ZXJuRmlsbCBwYXR0ZXJuVHlwZT0ic29saWQiPjxmZ0NvbG9yIHJnYj0iRkYwMDcwQ0UiLz48L3BhdHRlcm5GaWxsPjwvZmlsbD4KICAgIDwhLS0gMzogRGFyayBTbGF0ZSAjMUUyOTNCIC0tPgogICAgPGZpbGw+PHBhdHRlcm5GaWxsIHBhdHRlcm5UeXBlPSJzb2xpZCI+PGZnQ29sb3IgcmdiPSJGRjFFMjkzQiIvPjwvcGF0dGVybkZpbGw+PC9maWxsPgogICAgPCEtLSA0OiBTdWJoZWFkZXIgR3JheSAjRjFGNUY5IC0tPgogICAgPGZpbGw+PHBhdHRlcm5GaWxsIHBhdHRlcm5UeXBlPSJzb2xpZCI+PGZnQ29sb3IgcmdiPSJGRkYxRjVGOSIvPjwvcGF0dGVybkZpbGw+PC9maWxsPgogICAgPCEtLSA1OiBTdWNjZXNzIFNvZnQgR3JlZW4gI0RDRkNFNyAtLT4KICAgIDxmaWxsPjxwYXR0ZXJuRmlsbCBwYXR0ZXJuVHlwZT0ic29saWQiPjxmZ0NvbG9yIHJnYj0iRkZEQ0ZDRTciLz48L3BhdHRlcm5GaWxsPjwvZmlsbD4KICAgIDwhLS0gNjogV2FybmluZyBTb2Z0IFllbGxvdyAjRkVGOUMzIC0tPgogICAgPGZpbGw+PHBhdHRlcm5GaWxsIHBhdHRlcm5UeXBlPSJzb2xpZCI+PGZnQ29sb3IgcmdiPSJGRkZFRjlDMyIvPjwvcGF0dGVybkZpbGw+PC9maWxsPgogICAgPCEtLSA3OiBEYW5nZXIgU29mdCBSZWQgI0ZFRTJFMiAtLT4KICAgIDxmaWxsPjxwYXR0ZXJuRmlsbCBwYXR0ZXJuVHlwZT0ic29saWQiPjxmZ0NvbG9yIHJnYj0iRkZGRUUyRTIiLz48L3BhdHRlcm5GaWxsPjwvZmlsbD4KICAgIDwhLS0gODogSW5mbyBTb2Z0IEJsdWUgI0VGRjZGRiAtLT4KICAgIDxmaWxsPjxwYXR0ZXJuRmlsbCBwYXR0ZXJuVHlwZT0ic29saWQiPjxmZ0NvbG9yIHJnYj0iRkZFRkY2RkYiLz48L3BhdHRlcm5GaWxsPjwvZmlsbD4KICA8L2ZpbGxzPgogIDxib3JkZXJzIGNvdW50PSIyIj4KICAgIDwhLS0gMDogTm8gYm9yZGVyIC0tPgogICAgPGJvcmRlcj48bGVmdC8+PHJpZ2h0Lz48dG9wLz48Ym90dG9tLz48ZGlhZ29uYWwvPjwvYm9yZGVyPgogICAgPCEtLSAxOiBUaGluIGJvcmRlciAjQ0JENUUxIC0tPgogICAgPGJvcmRlcj4KICAgICAgPGxlZnQgc3R5bGU9InRoaW4iPjxjb2xvciByZ2I9IkZGQ0JENUUxIi8+PC9sZWZ0PgogICAgICA8cmlnaHQgc3R5bGU9InRoaW4iPjxjb2xvciByZ2I9IkZGQ0JENUUxIi8+PC9yaWdodD4KICAgICAgPHRvcCBzdHlsZT0idGhpbiI+PGNvbG9yIHJnYj0iRkZDQkQ1RTEiLz48L3RvcD4KICAgICAgPGJvdHRvbSBzdHlsZT0idGhpbiI+PGNvbG9yIHJnYj0iRkZDQkQ1RTEiLz48L2JvdHRvbT4KICAgIDwvYm9yZGVyPgogIDwvYm9yZGVycz4KICA8Y2VsbFN0eWxlWGZzIGNvdW50PSIxIj4KICAgIDx4ZiBudW1GbXRJZD0iMCIgZm9udElkPSIwIiBmaWxsSWQ9IjAiIGJvcmRlcklkPSIwIi8+CiAgPC9jZWxsU3R5bGVYZnM+CiAgPGNlbGxYZnMgY291bnQ9IjIxIj4KICAgIDwhLS0gMDogZGVmYXVsdCAtLT4KICAgIDx4ZiBudW1GbXRJZD0iMCIgZm9udElkPSIwIiBmaWxsSWQ9IjAiIGJvcmRlcklkPSIwIiB4ZklkPSIwIj48YWxpZ25tZW50IHZlcnRpY2FsPSJjZW50ZXIiLz48L3hmPgogICAgPCEtLSAxOiB0ZXh0Q2VudGVyIC0tPgogICAgPHhmIG51bUZtdElkPSIwIiBmb250SWQ9IjAiIGZpbGxJZD0iMCIgYm9yZGVySWQ9IjAiIHhmSWQ9IjAiPjxhbGlnbm1lbnQgaG9yaXpvbnRhbD0iY2VudGVyIiB2ZXJ0aWNhbD0iY2VudGVyIi8+PC94Zj4KICAgIDwhLS0gMjogdGV4dFJpZ2h0IC0tPgogICAgPHhmIG51bUZtdElkPSIwIiBmb250SWQ9IjAiIGZpbGxJZD0iMCIgYm9yZGVySWQ9IjAiIHhmSWQ9IjAiPjxhbGlnbm1lbnQgaG9yaXpvbnRhbD0icmlnaHQiIHZlcnRpY2FsPSJjZW50ZXIiLz48L3hmPgogICAgPCEtLSAzOiBoZWFkZXIgKCMwMDcwQ0UsIHdoaXRlIGJvbGQsIGNlbnRlcikgLS0+CiAgICA8eGYgbnVtRm10SWQ9IjAiIGZvbnRJZD0iMiIgZmlsbElkPSIyIiBib3JkZXJJZD0iMSIgeGZJZD0iMCIgYXBwbHlGb250PSIxIiBhcHBseUZpbGw9IjEiIGFwcGx5Qm9yZGVyPSIxIiBhcHBseUFsaWdubWVudD0iMSI+PGFsaWdubWVudCBob3Jpem9udGFsPSJjZW50ZXIiIHZlcnRpY2FsPSJjZW50ZXIiLz48L3hmPgogICAgPCEtLSA0OiBoZWFkZXJEYXJrICgjMUUyOTNCLCB3aGl0ZSBib2xkLCBjZW50ZXIpIC0tPgogICAgPHhmIG51bUZtdElkPSIwIiBmb250SWQ9IjIiIGZpbGxJZD0iMyIgYm9yZGVySWQ9IjEiIHhmSWQ9IjAiIGFwcGx5Rm9udD0iMSIgYXBwbHlGaWxsPSIxIiBhcHBseUJvcmRlcj0iMSIgYXBwbHlBbGlnbm1lbnQ9IjEiPjxhbGlnbm1lbnQgaG9yaXpvbnRhbD0iY2VudGVyIiB2ZXJ0aWNhbD0iY2VudGVyIi8+PC94Zj4KICAgIDwhLS0gNTogc3ViSGVhZGVyICgjRjFGNUY5LCBkYXJrIGJvbGQsIGNlbnRlcikgLS0+CiAgICA8eGYgbnVtRm10SWQ9IjAiIGZvbnRJZD0iMSIgZmlsbElkPSI0IiBib3JkZXJJZD0iMSIgeGZJZD0iMCIgYXBwbHlGb250PSIxIiBhcHBseUZpbGw9IjEiIGFwcGx5Qm9yZGVyPSIxIiBhcHBseUFsaWdubWVudD0iMSI+PGFsaWdubWVudCBob3Jpem9udGFsPSJjZW50ZXIiIHZlcnRpY2FsPSJjZW50ZXIiLz48L3hmPgogICAgPCEtLSA2OiB0aXRsZSAoMTRwdCAjMDA0QzhDIGJvbGQsIGNlbnRlcikgLS0+CiAgICA8eGYgbnVtRm10SWQ9IjAiIGZvbnRJZD0iMyIgZmlsbElkPSIwIiBib3JkZXJJZD0iMCIgeGZJZD0iMCIgYXBwbHlGb250PSIxIiBhcHBseUFsaWdubWVudD0iMSI+PGFsaWdubWVudCBob3Jpem9udGFsPSJjZW50ZXIiIHZlcnRpY2FsPSJjZW50ZXIiLz48L3hmPgogICAgPCEtLSA3OiBzdWJ0aXRsZSAoOS41cHQgaXRhbGljIHN1YnRsZSwgY2VudGVyKSAtLT4KICAgIDx4ZiBudW1GbXRJZD0iMCIgZm9udElkPSI1IiBmaWxsSWQ9IjAiIGJvcmRlcklkPSIwIiB4ZklkPSIwIiBhcHBseUZvbnQ9IjEiIGFwcGx5QWxpZ25tZW50PSIxIj48YWxpZ25tZW50IGhvcml6b250YWw9ImNlbnRlciIgdmVydGljYWw9ImNlbnRlciIvPjwveGY+CiAgICA8IS0tIDg6IHNlY3Rpb24gKDExcHQgYm9sZCBwcmltYXJ5LCBsZWZ0KSAtLT4KICAgIDx4ZiBudW1GbXRJZD0iMCIgZm9udElkPSI0IiBmaWxsSWQ9IjAiIGJvcmRlcklkPSIwIiB4ZklkPSIwIiBhcHBseUZvbnQ9IjEiIGFwcGx5QWxpZ25tZW50PSIxIj48YWxpZ25tZW50IGhvcml6b250YWw9ImxlZnQiIHZlcnRpY2FsPSJjZW50ZXIiLz48L3hmPgogICAgPCEtLSA5OiBib3JkZXJMZWZ0IC0tPgogICAgPHhmIG51bUZtdElkPSIwIiBmb250SWQ9IjAiIGZpbGxJZD0iMCIgYm9yZGVySWQ9IjEiIHhmSWQ9IjAiIGFwcGx5Qm9yZGVyPSIxIiBhcHBseUFsaWdubWVudD0iMSI+PGFsaWdubWVudCBob3Jpem9udGFsPSJsZWZ0IiB2ZXJ0aWNhbD0iY2VudGVyIi8+PC94Zj4KICAgIDwhLS0gMTA6IGJvcmRlckNlbnRlciAtLT4KICAgIDx4ZiBudW1GbXRJZD0iMCIgZm9udElkPSIwIiBmaWxsSWQ9IjAiIGJvcmRlcklkPSIxIiB4ZklkPSIwIiBhcHBseUJvcmRlcj0iMSIgYXBwbHlBbGlnbm1lbnQ9IjEiPjxhbGlnbm1lbnQgaG9yaXpvbnRhbD0iY2VudGVyIiB2ZXJ0aWNhbD0iY2VudGVyIi8+PC94Zj4KICAgIDwhLS0gMTE6IGJvcmRlclJpZ2h0IC0tPgogICAgPHhmIG51bUZtdElkPSIwIiBmb250SWQ9IjAiIGZpbGxJZD0iMCIgYm9yZGVySWQ9IjEiIHhmSWQ9IjAiIGFwcGx5Qm9yZGVyPSIxIiBhcHBseUFsaWdubWVudD0iMSI+PGFsaWdubWVudCBob3Jpem9udGFsPSJyaWdodCIgdmVydGljYWw9ImNlbnRlciIvPjwveGY+CiAgICA8IS0tIDEyOiBib2xkQm9yZGVyTGVmdCAtLT4KICAgIDx4ZiBudW1GbXRJZD0iMCIgZm9udElkPSIxIiBmaWxsSWQ9IjAiIGJvcmRlcklkPSIxIiB4ZklkPSIwIiBhcHBseUZvbnQ9IjEiIGFwcGx5Qm9yZGVyPSIxIiBhcHBseUFsaWdubWVudD0iMSI+PGFsaWdubWVudCBob3Jpem9udGFsPSJsZWZ0IiB2ZXJ0aWNhbD0iY2VudGVyIi8+PC94Zj4KICAgIDwhLS0gMTM6IGJvbGRCb3JkZXJDZW50ZXIgLS0+CiAgICA8eGYgbnVtRm10SWQ9IjAiIGZvbnRJZD0iMSIgZmlsbElkPSIwIiBib3JkZXJJZD0iMSIgeGZJZD0iMCIgYXBwbHlGb250PSIxIiBhcHBseUJvcmRlcj0iMSIgYXBwbHlBbGlnbm1lbnQ9IjEiPjxhbGlnbm1lbnQgaG9yaXpvbnRhbD0iY2VudGVyIiB2ZXJ0aWNhbD0iY2VudGVyIi8+PC94Zj4KICAgIDwhLS0gMTQ6IGJvbGRCb3JkZXJSaWdodCAtLT4KICAgIDx4ZiBudW1GbXRJZD0iMCIgZm9udElkPSIxIiBmaWxsSWQ9IjAiIGJvcmRlcklkPSIxIiB4ZklkPSIwIiBhcHBseUZvbnQ9IjEiIGFwcGx5Qm9yZGVyPSIxIiBhcHBseUFsaWdubWVudD0iMSI+PGFsaWdubWVudCBob3Jpem9udGFsPSJyaWdodCIgdmVydGljYWw9ImNlbnRlciIvPjwveGY+CiAgICA8IS0tIDE1OiBiYWRnZVN1Y2Nlc3MgKCNEQ0ZDRTcsIHRleHQgIzE1ODAzRCBib2xkLCBjZW50ZXIpIC0tPgogICAgPHhmIG51bUZtdElkPSIwIiBmb250SWQ9IjYiIGZpbGxJZD0iNSIgYm9yZGVySWQ9IjEiIHhmSWQ9IjAiIGFwcGx5Rm9udD0iMSIgYXBwbHlGaWxsPSIxIiBhcHBseUJvcmRlcj0iMSIgYXBwbHlBbGlnbm1lbnQ9IjEiPjxhbGlnbm1lbnQgaG9yaXpvbnRhbD0iY2VudGVyIiB2ZXJ0aWNhbD0iY2VudGVyIi8+PC94Zj4KICAgIDwhLS0gMTY6IGJhZGdlV2FybmluZyAoI0ZFRjlDMywgdGV4dCAjQTE2MjA3IGJvbGQsIGNlbnRlcikgLS0+CiAgICA8eGYgbnVtRm10SWQ9IjAiIGZvbnRJZD0iNyIgZmlsbElkPSI2IiBib3JkZXJJZD0iMSIgeGZJZD0iMCIgYXBwbHlGb250PSIxIiBhcHBseUZpbGw9IjEiIGFwcGx5Qm9yZGVyPSIxIiBhcHBseUFsaWdubWVudD0iMSI+PGFsaWdubWVudCBob3Jpem9udGFsPSJjZW50ZXIiIHZlcnRpY2FsPSJjZW50ZXIiLz48L3hmPgogICAgPCEtLSAxNzogYmFkZ2VEYW5nZXIgKCNGRUUyRTIsIHRleHQgI0I5MUMxQyBib2xkLCBjZW50ZXIpIC0tPgogICAgPHhmIG51bUZtdElkPSIwIiBmb250SWQ9IjgiIGZpbGxJZD0iNyIgYm9yZGVySWQ9IjEiIHhmSWQ9IjAiIGFwcGx5Rm9udD0iMSIgYXBwbHlGaWxsPSIxIiBhcHBseUJvcmRlcj0iMSIgYXBwbHlBbGlnbm1lbnQ9IjEiPjxhbGlnbm1lbnQgaG9yaXpvbnRhbD0iY2VudGVyIiB2ZXJ0aWNhbD0iY2VudGVyIi8+PC94Zj4KICAgIDwhLS0gMTg6IGJhZGdlSW5mbyAoI0VGRjZGRiwgdGV4dCAjMUQ0RUQ4IGJvbGQsIGNlbnRlcikgLS0+CiAgICA8eGYgbnVtRm10SWQ9IjAiIGZvbnRJZD0iOSIgZmlsbElkPSI4IiBib3JkZXJJZD0iMSIgeGZJZD0iMCIgYXBwbHlGb250PSIxIiBhcHBseUZpbGw9IjEiIGFwcGx5Qm9yZGVyPSIxIiBhcHBseUFsaWdubWVudD0iMSI+PGFsaWdubWVudCBob3Jpem9udGFsPSJjZW50ZXIiIHZlcnRpY2FsPSJjZW50ZXIiLz48L3hmPgogICAgPCEtLSAxOTogbWV0YUxhYmVsIChib2xkIHNsYXRlLCByaWdodCkgLS0+CiAgICA8eGYgbnVtRm10SWQ9IjAiIGZvbnRJZD0iMTAiIGZpbGxJZD0iMCIgYm9yZGVySWQ9IjAiIHhmSWQ9IjAiIGFwcGx5Rm9udD0iMSIgYXBwbHlBbGlnbm1lbnQ9IjEiPjxhbGlnbm1lbnQgaG9yaXpvbnRhbD0icmlnaHQiIHZlcnRpY2FsPSJjZW50ZXIiLz48L3hmPgogICAgPCEtLSAyMDogbWV0YVZhbHVlIChub3JtYWwsIGxlZnQpIC0tPgogICAgPHhmIG51bUZtdElkPSIwIiBmb250SWQ9IjAiIGZpbGxJZD0iMCIgYm9yZGVySWQ9IjAiIHhmSWQ9IjAiIGFwcGx5QWxpZ25tZW50PSIxIj48YWxpZ25tZW50IGhvcml6b250YWw9ImxlZnQiIHZlcnRpY2FsPSJjZW50ZXIiLz48L3hmPgogIDwvY2VsbFhmcz4KPC9zdHlsZVNoZWV0PlBLAwQUAAAAAAAAAAAAjyP3oh0MAAAdDAAAGAAAAHhsL3dvcmtzaGVldHMvc2hlZXQxLnhtbDw/eG1sIHZlcnNpb249IjEuMCIgZW5jb2Rpbmc9IlVURi04IiBzdGFuZGFsb25lPSJ5ZXMiPz4KPHdvcmtzaGVldCB4bWxucz0iaHR0cDovL3NjaGVtYXMub3BlbnhtbGZvcm1hdHMub3JnL3NwcmVhZHNoZWV0bWwvMjAwNi9tYWluIj4KICA8Y29scz48Y29sIG1pbj0iMSIgbWF4PSIxIiB3aWR0aD0iMTYiIGN1c3RvbVdpZHRoPSIxIi8+PGNvbCBtaW49IjIiIG1heD0iMiIgd2lkdGg9IjIyIiBjdXN0b21XaWR0aD0iMSIvPjxjb2wgbWluPSIzIiBtYXg9IjMiIHdpZHRoPSIxOCIgY3VzdG9tV2lkdGg9IjEiLz48Y29sIG1pbj0iNCIgbWF4PSI0IiB3aWR0aD0iMzIiIGN1c3RvbVdpZHRoPSIxIi8+PGNvbCBtaW49IjUiIG1heD0iNSIgd2lkdGg9IjIwIiBjdXN0b21XaWR0aD0iMSIvPjxjb2wgbWluPSI2IiBtYXg9IjYiIHdpZHRoPSIyOCIgY3VzdG9tV2lkdGg9IjEiLz48Y29sIG1pbj0iNyIgbWF4PSI3IiB3aWR0aD0iMTgiIGN1c3RvbVdpZHRoPSIxIi8+PC9jb2xzPgogIDxzaGVldERhdGE+CiAgICA8cm93IHI9IjEiIGh0PSIyOCIgY3VzdG9tSGVpZ2h0PSIxIj48YyByPSJBMSIgcz0iMyIgdD0iaW5saW5lU3RyIj48aXM+PHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+TcOjIG5ow6JuIHZpw6puPC90PjwvaXM+PC9jPjxjIHI9IkIxIiBzPSIzIiB0PSJpbmxpbmVTdHIiPjxpcz48dCB4bWw6c3BhY2U9InByZXNlcnZlIj5I4buNIHbDoCB0w6puPC90PjwvaXM+PC9jPjxjIHI9IkMxIiBzPSIzIiB0PSJpbmxpbmVTdHIiPjxpcz48dCB4bWw6c3BhY2U9InByZXNlcnZlIj5T4buRIENDQ0Q8L3Q+PC9pcz48L2M+PGMgcj0iRDEiIHM9IjMiIHQ9ImlubGluZVN0ciI+PGlzPjx0IHhtbDpzcGFjZT0icHJlc2VydmUiPkNo4bupYyBkYW5oPC90PjwvaXM+PC9jPjxjIHI9IkUxIiBzPSIzIiB0PSJpbmxpbmVTdHIiPjxpcz48dCB4bWw6c3BhY2U9InByZXNlcnZlIj5Nw6MgcGjDsm5nIGJhbjwvdD48L2lzPjwvYz48YyByPSJGMSIgcz0iMyIgdD0iaW5saW5lU3RyIj48aXM+PHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+RW1haWw8L3Q+PC9pcz48L2M+PGMgcj0iRzEiIHM9IjMiIHQ9ImlubGluZVN0ciI+PGlzPjx0IHhtbDpzcGFjZT0icHJlc2VydmUiPlPhu5EgxJFp4buHbiB0aG/huqFpPC90PjwvaXM+PC9jPjwvcm93Pgo8cm93IHI9IjIiIGh0PSIyMiIgY3VzdG9tSGVpZ2h0PSIxIj48YyByPSJBMiIgcz0iMTAiIHQ9ImlubGluZVN0ciI+PGlzPjx0IHhtbDpzcGFjZT0icHJlc2VydmUiPk5WLUlNUC0wMTwvdD48L2lzPjwvYz48YyByPSJCMiIgcz0iMTIiIHQ9ImlubGluZVN0ciI+PGlzPjx0IHhtbDpzcGFjZT0icHJlc2VydmUiPlRy4bqnbiBWxINuIELDrG5oPC90PjwvaXM+PC9jPjxjIHI9IkMyIiBzPSIxMCIgdD0iaW5saW5lU3RyIj48aXM+PHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+MDc5MDk1MDA5OTg4PC90PjwvaXM+PC9jPjxjIHI9IkQyIiBzPSI5IiB0PSJpbmxpbmVTdHIiPjxpcz48dCB4bWw6c3BhY2U9InByZXNlcnZlIj5DaHV5w6puIHZpw6puIEPDtG5nIG5naOG7hyB0aMO0bmcgdGluPC90PjwvaXM+PC9jPjxjIHI9IkUyIiBzPSIxMyIgdD0iaW5saW5lU3RyIj48aXM+PHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+VlAtVUJORDwvdD48L2lzPjwvYz48YyByPSJGMiIgcz0iOSIgdD0iaW5saW5lU3RyIj48aXM+PHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+YmluaC50cmFuQGZpbnZpZXQuY29tPC90PjwvaXM+PC9jPjxjIHI9IkcyIiBzPSIxMCIgdD0iaW5saW5lU3RyIj48aXM+PHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+MDk3NyAxMDEgMjAyPC90PjwvaXM+PC9jPjwvcm93Pgo8cm93IHI9IjMiIGh0PSIyMiIgY3VzdG9tSGVpZ2h0PSIxIj48YyByPSJBMyIgcz0iMTAiIHQ9ImlubGluZVN0ciI+PGlzPjx0IHhtbDpzcGFjZT0icHJlc2VydmUiPk5WLUlNUC0wMjwvdD48L2lzPjwvYz48YyByPSJCMyIgcz0iMTIiIHQ9ImlubGluZVN0ciI+PGlzPjx0IHhtbDpzcGFjZT0icHJlc2VydmUiPkzDqiBUaOG7iyBEaeG7h3U8L3Q+PC9pcz48L2M+PGMgcj0iQzMiIHM9IjEwIiB0PSJpbmxpbmVTdHIiPjxpcz48dCB4bWw6c3BhY2U9InByZXNlcnZlIj4wNzkxOTgwMDc3NjY8L3Q+PC9pcz48L2M+PGMgcj0iRDMiIHM9IjkiIHQ9ImlubGluZVN0ciI+PGlzPjx0IHhtbDpzcGFjZT0icHJlc2VydmUiPkvhur8gdG/DoW4gdmnDqm48L3Q+PC9pcz48L2M+PGMgcj0iRTMiIHM9IjEzIiB0PSJpbmxpbmVTdHIiPjxpcz48dCB4bWw6c3BhY2U9InByZXNlcnZlIj5EQy1YRDwvdD48L2lzPjwvYz48YyByPSJGMyIgcz0iOSIgdD0iaW5saW5lU3RyIj48aXM+PHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+ZGlldS5sZUBmaW52aWV0LmNvbTwvdD48L2lzPjwvYz48YyByPSJHMyIgcz0iMTAiIHQ9ImlubGluZVN0ciI+PGlzPjx0IHhtbDpzcGFjZT0icHJlc2VydmUiPjA5MDggNjU0IDMyMTwvdD48L2lzPjwvYz48L3Jvdz4KPHJvdyByPSI0IiBodD0iMjIiIGN1c3RvbUhlaWdodD0iMSI+PGMgcj0iQTQiIHM9IjEwIiB0PSJpbmxpbmVTdHIiPjxpcz48dCB4bWw6c3BhY2U9InByZXNlcnZlIj5OVi1JTVAtMDM8L3Q+PC9pcz48L2M+PGMgcj0iQjQiIHM9IjEyIiB0PSJpbmxpbmVTdHIiPjxpcz48dCB4bWw6c3BhY2U9InByZXNlcnZlIj5OZ8O0IFRoYW5oIFTDuW5nPC90PjwvaXM+PC9jPjxjIHI9IkM0IiBzPSIxMCIgdD0iaW5saW5lU3RyIj48aXM+PHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+MDc5MDkyMDA1NTQ0PC90PjwvaXM+PC9jPjxjIHI9IkQ0IiBzPSI5IiB0PSJpbmxpbmVTdHIiPjxpcz48dCB4bWw6c3BhY2U9InByZXNlcnZlIj5L4bu5IHPGsCBW4bqtbiBow6BuaDwvdD48L2lzPjwvYz48YyByPSJFNCIgcz0iMTMiIHQ9ImlubGluZVN0ciI+PGlzPjx0IHhtbDpzcGFjZT0icHJlc2VydmUiPlRQLUhUPC90PjwvaXM+PC9jPjxjIHI9IkY0IiBzPSI5IiB0PSJpbmxpbmVTdHIiPjxpcz48dCB4bWw6c3BhY2U9InByZXNlcnZlIj50dW5nLm5nb0BmaW52aWV0LmNvbTwvdD48L2lzPjwvYz48YyByPSJHNCIgcz0iMTAiIHQ9ImlubGluZVN0ciI+PGlzPjx0IHhtbDpzcGFjZT0icHJlc2VydmUiPjA5MTIgMzQ1IDY3ODwvdD48L2lzPjwvYz48L3Jvdz4KICA8L3NoZWV0RGF0YT4KICAKPC93b3Jrc2hlZXQ+UEsBAhQAFAAAAAAAAAAAAPls5kK4AgAAuAIAABMAAAAAAAAAAAAAAAAAAAAAAFtDb250ZW50X1R5cGVzXS54bWxQSwECFAAUAAAAAAAAAAAAXYf0LiwBAAAsAQAACwAAAAAAAAAAAAAAAADpAgAAX3JlbHMvLnJlbHNQSwECFAAUAAAAAAAAAAAAOdMePK8BAACvAQAAGgAAAAAAAAAAAAAAAAA+BAAAeGwvX3JlbHMvd29ya2Jvb2sueG1sLnJlbHNQSwECFAAUAAAAAAAAAAAAws/nEzcBAAA3AQAADwAAAAAAAAAAAAAAAAAlBgAAeGwvd29ya2Jvb2sueG1sUEsBAhQAFAAAAAAAAAAAAMi1HQ9VHQAAVR0AAA0AAAAAAAAAAAAAAAAAiQcAAHhsL3N0eWxlcy54bWxQSwECFAAUAAAAAAAAAAAAjyP3oh0MAAAdDAAAGAAAAAAAAAAAAAAAAAAJJQAAeGwvd29ya3NoZWV0cy9zaGVldDEueG1sUEsFBgAAAAAGAAYAgAEAAFwxAAAAAA==';

/**
 * Giải mã các ký tự XML entities
 */
function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * Tải file mẫu danh sách nhân sự định dạng .xlsx
 */
export function downloadEmployeeExcelTemplate(fileName = 'Mau_nhap_lieu_nhan_su_Finviet.xlsx') {
  try {
    const binaryString = atob(SAMPLE_EMPLOYEE_XLSX_BASE64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Lỗi khi tải file mẫu Excel (.xlsx):', err);
    // Fallback: nếu môi trường bị chặn blob, điều hướng sang file public
    const link = document.createElement('a');
    link.href = '/Mau_nhap_lieu_nhan_su_Finviet.xlsx';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Giải nén và trích xuất dữ liệu từ file Excel .xlsx
 * Hỗ trợ cả inlineStr (<is><t>), sharedStrings (<v>) và plain string values.
 */
export async function parseXlsxFile(file: File): Promise<ImportEmployeeRow[]> {
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    if (typeof file.arrayBuffer === 'function') {
      file.arrayBuffer().then(resolve, reject);
    } else {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    }
  });
  const buffer = new Uint8Array(arrayBuffer);

  const entries: Record<string, string> = {};
  let offset = 0;

  while (offset < buffer.length - 4) {
    if (
      buffer[offset] === 0x50 &&
      buffer[offset + 1] === 0x4b &&
      buffer[offset + 2] === 0x03 &&
      buffer[offset + 3] === 0x04
    ) {
      const view = new DataView(buffer.buffer, buffer.byteOffset + offset);
      const compMethod = view.getUint16(8, true);
      const compSize = view.getUint32(18, true);
      const nameLen = view.getUint16(26, true);
      const extraLen = view.getUint16(28, true);

      const nameBytes = buffer.slice(offset + 30, offset + 30 + nameLen);
      const fileName = new TextDecoder('utf-8').decode(nameBytes);
      const dataStart = offset + 30 + nameLen + extraLen;
      const compData = buffer.slice(dataStart, dataStart + compSize);

      if (compMethod === 0) {
        entries[fileName] = new TextDecoder('utf-8').decode(compData);
      } else if (compMethod === 8) {
        if (typeof DecompressionStream !== 'undefined') {
          const ds = new DecompressionStream('deflate-raw');
          const writer = ds.writable.getWriter();
          writer.write(compData);
          writer.close();
          const decompressedBuffer = await new Response(ds.readable).arrayBuffer();
          entries[fileName] = new TextDecoder('utf-8').decode(decompressedBuffer);
        }
      }
      offset = dataStart + compSize;
    } else {
      offset++;
    }
  }

  // Trích xuất shared strings
  const sstXml = entries['xl/sharedStrings.xml'] || '';
  const sharedStrings: string[] = [];
  const siRegex = /<si>(.*?)<\/si>/gs;
  let m: RegExpExecArray | null;
  while ((m = siRegex.exec(sstXml)) !== null) {
    const tMatch = /<t[^>]*>(.*?)<\/t>/s.exec(m[1]);
    sharedStrings.push(tMatch ? decodeXmlEntities(tMatch[1]) : '');
  }

  // Trích xuất sheet1.xml
  const sheetXml = entries['xl/worksheets/sheet1.xml'] || '';
  const parsedRows: ImportEmployeeRow[] = [];
  const rowRegex = /<row[^>]*>(.*?)<\/row>/gs;

  let isHeader = true;
  while ((m = rowRegex.exec(sheetXml)) !== null) {
    if (isHeader) {
      isHeader = false;
      continue; // Bỏ qua dòng tiêu đề
    }
    const rowContent = m[1];
    const cellRegex = /<c\s+([^>]*?)>(.*?)<\/c>|<c\s+([^>]*?)\/>/gs;
    const rowData: Record<string, string> = {};
    let cm: RegExpExecArray | null;

    while ((cm = cellRegex.exec(rowContent)) !== null) {
      const attrs = cm[1] || cm[3] || '';
      const body = cm[2] || '';
      const colMatch = attrs.match(/r="([A-Z]+)\d+"/);
      if (!colMatch) continue;
      const col = colMatch[1];
      const typeMatch = attrs.match(/t="([^"]*)"/);
      const type = typeMatch ? typeMatch[1] : '';

      let cellVal = '';
      const inlineMatch = body.match(/<is><t[^>]*>(.*?)<\/t><\/is>/s);
      const vMatch = body.match(/<v>(.*?)<\/v>/s);
      const tMatch = body.match(/<t[^>]*>(.*?)<\/t>/s);

      if (inlineMatch) {
        cellVal = decodeXmlEntities(inlineMatch[1]);
      } else if (vMatch) {
        if (type === 's') {
          const idx = parseInt(vMatch[1], 10);
          cellVal = sharedStrings[idx] ?? '';
        } else {
          cellVal = decodeXmlEntities(vMatch[1]);
        }
      } else if (tMatch) {
        cellVal = decodeXmlEntities(tMatch[1]);
      }
      rowData[col] = cellVal.trim();
    }

    if (rowData['A'] || rowData['B']) {
      parsedRows.push({
        employeeCode: rowData['A'] || '',
        fullName: rowData['B'] || '',
        identityNumber: rowData['C'] || '',
        position: rowData['D'] || '',
        departmentCodeOrName: rowData['E'] || '',
        email: rowData['F'] || '',
        phoneNumber: rowData['G'] || ''
      });
    }
  }

  return parsedRows;
}
