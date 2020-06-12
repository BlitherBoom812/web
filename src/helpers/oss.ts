import axios from "axios";
import type OSS from "ali-oss";
import FileSaver from "file-saver";

let expirationTime: Date | null = null;
let oss: OSS | null = null;

export const getOSS = async () => {
  if (
    oss === null ||
    expirationTime === null ||
    expirationTime.getTime() <= new Date().getTime()
  ) {
    const response = await axios.get("/static/sts");
    const auth = response.data;
    expirationTime = new Date(auth.Expiration);

    const OSS = (await import("ali-oss")).default;
    oss = new OSS({
      region: "oss-cn-beijing",
      accessKeyId: auth.AccessKeyId,
      accessKeySecret: auth.AccessKeySecret,
      stsToken: auth.SecurityToken,
      bucket: "eesast",
      cname: true,
      endpoint: process.env.REACT_APP_STATIC_URL,
      secure: true,
    });
    return oss;
  } else {
    return oss;
  }
};

interface File {
  filename: string;
  url: string;
}

export const downloadFile = async (file: File) => {
  let response = await axios.get(`/static${file.url}`);
  const data = response.data as { location: string };
  response = await axios.get(data.location, { responseType: "blob" });
  FileSaver.saveAs(response.data, file.filename);
};
